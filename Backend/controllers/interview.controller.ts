import { Response } from 'express';
import { AuthRequest } from '../middlewares/isAuth';
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { askAi, askAiJson } from '../services/openRouter.service';
import { prisma } from '../config/connectDb';
import { Prisma } from '@prisma/client';

export const analyzeResume = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Resume Required',
        statusCode: 400,
      });
    }

    const filepath = req.file.path;
    const FileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(FileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      resumeText += pageText + '\n';
    }

    resumeText = resumeText.replace(/\s+/g, ' ').trim();

    const messages: any[] = [
      {
        role: 'system',
        content: `
Extract structured data from resume.

Return strictly JSON:

{
    "role": "string",
    "experience": "string",
    "projects": ["project1","project2"],
    "skills": ["skill1","skill2"]
}
`,
      },
      {
        role: 'user',
        content: resumeText,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = JSON.parse(aiResponse);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    return res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText,
    });
  } catch (error: any) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

export const generateQuestions = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body;

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({
        message: 'Role, Experience and Mode are required',
        statusCode: 400,
      });
    }

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
        statusCode: 404,
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: 'Not enough credits. Minimum 50 required.',
      });
    }

    const projectText = Array.isArray(projects) && projects.length ? projects.join(', ') : 'None';
    const skillsText = Array.isArray(skills) && skills.length ? skills.join(', ') : 'None';
    const safeResume = resumeText?.trim() || 'None';

    const userPrompt = `
Role: ${role}
Experience: ${experience}
InterviewMode: ${mode}
projects: ${projectText}
skills: ${skillsText}
Resume: ${safeResume}
`;

    const messages: any[] = [
      {
        role: 'system',
        content: `You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do Not number them.
- Do Not add explanations.
- Do Not add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 -> easy
Question 2 -> easy
Question 3 -> medium
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience, interviewMode, projects, skills, and resume details.`,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const aiResponse = await askAi(messages);

    if (!aiResponse || !aiResponse.trim()) {
      return res.status(500).json({
        message: 'AI returned empty response',
        statusCode: 500,
      });
    }

    const questionsArray = aiResponse
      .split('\n')
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      return res.status(500).json({
        message: 'AI failed to generate questions.',
        statusCode: 500,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 50 } },
    });

    const preparedQuestions = questionsArray.map((q, index) => ({
      question: q,
      difficulty: ['easy', 'easy', 'medium', 'medium', 'hard'][index],
      timeLimit: [60, 60, 90, 90, 120][index],
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0,
      answer: '',
      feedback: '',
    }));

    const interview = await prisma.interview.create({
      data: {
        userId,
        role,
        experience,
        mode,
        resumeText: safeResume,
        questions: preparedQuestions,
        finalScore: 0,
        status: 'Incompleted',
      },
    });

    return res.json({
      interviewId: interview.id,
      creditsLeft: updatedUser.credits,
      userName: user.name,
      questions: interview.questions,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `failed to create interview ${error.message || error}`,
      statusCode: 500,
    });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body;

    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const questionsArr: any[] = Array.isArray(interview.questions) ? (interview.questions as any[]) : [];
    const question = questionsArr[questionIndex];

    if (!question) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    if (!answer) {
      question.score = 0;
      question.feedback = 'You did not submit an answer.';
      question.answer = '';

      await prisma.interview.update({
        where: { id: interviewId },
        data: { questions: questionsArr },
      });

      return res.json({ feedback: question.feedback });
    }

    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = 'Time limit exceeded. Answer not evaluated.';
      question.answer = answer;

      await prisma.interview.update({
        where: { id: interviewId },
        data: { questions: questionsArr },
      });

      return res.json({ feedback: question.feedback });
    }

    const messages: any[] = [
      {
        role: 'system',
        content: `You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
"confidence": number,
"communication": number,
"correctness": number,
"finalScore": number,
"feedback": "short human feedback"
}`,
      },
      {
        role: 'user',
        content: `Question: ${question.question}\nAnswer: ${answer}`,
      },
    ];

    const aiResponse = await askAi(messages);
    const parsed = JSON.parse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;

    await prisma.interview.update({
      where: { id: interviewId },
      data: { questions: questionsArr },
    });

    return res.status(200).json({
      feedback: parsed.feedback,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `failed to submit answer ${error.message || error}`,
      statusCode: 500,
    });
  }
};

export const finishInterview = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { interviewId } = req.body;
    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });

    if (!interview) {
      return res.status(400).json({
        message: 'failed to find interview',
        statusCode: 500,
      });
    }

    const questionsArr: any[] = Array.isArray(interview.questions) ? (interview.questions as any[]) : [];
    const totalQuestions = questionsArr.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    questionsArr.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions ? totalScore / totalQuestions : 0;
    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        finalScore,
        status: 'completed',
      },
    });

    const io = req.app.get('io');
    if (io && interview.userId) {
      io.to(`user-${interview.userId}`).emit('dashboard-update');
    }

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: questionsArr.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || '',
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `failed to finish Interview ${error.message || error}`,
      statusCode: 500,
    });
  }
};

export const getMyInterviews = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const interviews = await prisma.interview.findMany({
      where: { userId },
      select: {
        id: true,
        role: true,
        experience: true,
        mode: true,
        finalScore: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(interviews);
  } catch (error: any) {
    return res.status(500).json({ message: `failed to find currentUser Interview ${error.message || error}` });
  }
};

export const getInterviewReport = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const interviewId = req.params.id as string;
    const interview = await prisma.interview.findUnique({ where: { id: interviewId } });

    if (!interview) {
      return res.status(400).json({ message: 'Interview not found' });
    }

    const questionsArr: any[] = Array.isArray(interview.questions) ? (interview.questions as any[]) : [];
    const totalQuestions = questionsArr.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    questionsArr.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const avgConfidence = totalQuestions ? totalConfidence / totalQuestions : 0;
    const avgCommunication = totalQuestions ? totalCommunication / totalQuestions : 0;
    const avgCorrectness = totalQuestions ? totalCorrectness / totalQuestions : 0;

    return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: questionsArr,
    });
  } catch (error: any) {
    return res.status(500).json({ message: `failed to find currentUser Interview report ${error.message || error}` });
  }
};

export const analyzeFullResume = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF file is required.' });
    }

    const filepath = req.file.path;
    const originalName = req.file.originalname;

    const fileBuffer = await fs.promises.readFile(filepath);
    const uint8Array = new Uint8Array(fileBuffer);

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let resumeText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      resumeText += pageText + '\n';
    }

    resumeText = resumeText.replace(/\s+/g, ' ').trim();

    if (!resumeText) {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      return res.status(400).json({ message: 'Could not extract text from uploaded PDF.' });
    }

    const messages: any[] = [
      {
        role: 'system',
        content: `You are an expert ATS (Applicant Tracking System) Auditor & Senior Technical HR Manager.
Evaluate the candidate's resume text and calculate a real ATS compatibility score, section scores, detected technical skills, missing recommended skills, and actionable improvement recommendations.

Return strictly valid JSON format:
{
  "atsScore": 84,
  "overallScore": 86,
  "extractedRole": "Full-Stack Web Engineer",
  "experienceLevel": "2 years",
  "matchedSkills": ["JavaScript", "React.js", "Node.js", "Express.js", "MongoDB", "REST APIs", "Git", "TailwindCSS"],
  "recommendedSkills": ["TypeScript", "Docker", "CI/CD Pipelines", "System Design", "AWS/Cloud"],
  "suggestions": [
    { "type": "critical", "text": "Add quantifiable achievements with metrics (e.g., 'Improved API response time by 40%')." },
    { "type": "warning", "text": "Include a dedicated Projects section with tech stack and live demo links." },
    { "type": "tip", "text": "Highlight experience with TypeScript and cloud platforms like AWS/Vercel." }
  ],
  "sections": {
    "contact": { "score": 90, "label": "Contact Information" },
    "experience": { "score": 75, "label": "Work Experience" },
    "education": { "score": 85, "label": "Education" },
    "skills": { "score": 80, "label": "Technical Skills" },
    "projects": { "score": 70, "label": "Projects" },
    "formatting": { "score": 90, "label": "Formatting & ATS" }
  }
}`,
      },
      {
        role: 'user',
        content: `Resume File: ${originalName}\n\nResume Content:\n${resumeText.slice(0, 4500)}`,
      },
    ];

    const aiAnalysis = await askAiJson(messages);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    const formattedData = {
      fileName: originalName,
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      atsScore: aiAnalysis.atsScore || 75,
      overallScore: aiAnalysis.overallScore || 78,
      extractedRole: aiAnalysis.extractedRole || 'Software Engineer',
      experienceLevel: aiAnalysis.experienceLevel || '1-2 years',
      matchedSkills: Array.isArray(aiAnalysis.matchedSkills) ? aiAnalysis.matchedSkills : [],
      recommendedSkills: Array.isArray(aiAnalysis.recommendedSkills) ? aiAnalysis.recommendedSkills : [],
      suggestions: Array.isArray(aiAnalysis.suggestions) ? aiAnalysis.suggestions : [],
      sections: aiAnalysis.sections || {
        contact: { score: 90, label: 'Contact Information' },
        experience: { score: 70, label: 'Work Experience' },
        education: { score: 85, label: 'Education' },
        skills: { score: 75, label: 'Technical Skills' },
        projects: { score: 65, label: 'Projects' },
        formatting: { score: 80, label: 'Formatting & ATS' },
      },
    };

    const userId = req.userId;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { savedResumeAnalysis: formattedData },
      });

      const io = req.app.get('io');
      if (io) {
        io.to(`user-${userId}`).emit('dashboard-update');
      }
    }

    return res.status(200).json({
      message: 'Resume analyzed successfully',
      data: formattedData,
    });
  } catch (error: any) {
    console.error('Analyze Full Resume Error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: error.message || 'Failed to analyze resume' });
  }
};

export const getSavedResumeAnalysis = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.savedResumeAnalysis) {
      return res.status(200).json({
        hasResume: true,
        data: user.savedResumeAnalysis,
      });
    }

    return res.status(200).json({
      hasResume: false,
      data: null,
    });
  } catch (error: any) {
    console.error('Get Saved Resume Analysis Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch saved resume analysis' });
  }
};

export const getResumeHistory = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = user.savedResumeAnalysis ? [user.savedResumeAnalysis] : [];
    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to fetch resume history' });
  }
};

export const deleteResumeAnalysis = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await prisma.user.update({
      where: { id: userId },
      data: { savedResumeAnalysis: Prisma.DbNull },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${userId}`).emit('dashboard-update');
    }

    return res.status(200).json({
      success: true,
      message: 'Resume analysis deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to delete resume analysis' });
  }
};

export const getPersonalRoadmap = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.savedRoadmap) {
      return res.status(200).json({
        hasRoadmap: true,
        roadmap: user.savedRoadmap,
        resume: user.savedResumeAnalysis || null,
      });
    }

    if (user.savedResumeAnalysis) {
      const initialRoadmap = createDefaultPersonalizedRoadmap(user.savedResumeAnalysis);
      await prisma.user.update({
        where: { id: userId },
        data: { savedRoadmap: initialRoadmap },
      });

      return res.status(200).json({
        hasRoadmap: true,
        roadmap: initialRoadmap,
        resume: user.savedResumeAnalysis,
      });
    }

    return res.status(200).json({
      hasRoadmap: false,
      roadmap: null,
      resume: null,
    });
  } catch (error: any) {
    console.error('Get Personal Roadmap Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch personal roadmap' });
  }
};

export const generatePersonalRoadmap = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { targetRole: customRole, customFocusAreas } = req.body || {};
    const resumeData: any = user.savedResumeAnalysis || {};

    const targetRole = customRole || resumeData.extractedRole || 'Full-Stack Software Engineer';
    const matchedSkills = resumeData.matchedSkills || ['JavaScript', 'React.js', 'Node.js', 'REST APIs', 'Git'];
    const recommendedSkills = resumeData.recommendedSkills || ['TypeScript', 'Docker', 'CI/CD Pipelines', 'System Design', 'AWS/Cloud'];
    const expLevel = resumeData.experienceLevel || '1-2 years';

    const promptMessages: any[] = [
      {
        role: 'system',
        content: `You are an elite Tech Career Coach & Principal Staff Architect creating a personalized learning roadmap.
Candidate Resume Profile:
- Target Role: ${targetRole}
- Current Experience Level: ${expLevel}
- Existing Matched Skills (from resume): ${matchedSkills.join(', ')}
- Identified Skill Gaps (to learn): ${recommendedSkills.join(', ')}
${customFocusAreas ? `- Specific Focus Request: ${customFocusAreas}` : ''}

Build a structured 4-phase milestone roadmap in JSON format with:
- targetRole: string
- experienceLevel: string
- estimatedWeeks: number (e.g. 8)
- readinessScore: number (e.g. 65)
- matchedSkillsCount: number (count of matched skills)
- skillGapCount: number (count of skill gaps)
- phases: array of 4 objects. Each phase contains:
    - id: string (e.g. "phase-1")
    - phaseName: string (e.g. "Phase 1: Resume Skill Gap Bridge & Modern Core")
    - duration: string (e.g. "Weeks 1 - 2")
    - description: string
    - topics: array of 2-3 topic objects. Each topic contains:
        - id: string (e.g. "p1-t1")
        - title: string
        - description: string
        - status: string ("completed" if skill is already in matchedSkills, else "in_progress" or "pending")
        - isFromResume: boolean (true if skill was in matchedSkills)
        - isSkillGap: boolean (true if skill was in recommendedSkills)
        - keyConcepts: array of 3 string items
        - practicalProject: string (actionable real-world mini-project)
        - resourceLink: string (valid docs/guide link)

Return ONLY valid JSON matching this schema.`,
      },
      {
        role: 'user',
        content: `Generate a personalized learning roadmap for target role "${targetRole}".`,
      },
    ];

    let aiRoadmap = await askAiJson(promptMessages);

    if (!aiRoadmap || !Array.isArray(aiRoadmap.phases) || aiRoadmap.phases.length === 0) {
      aiRoadmap = createDefaultPersonalizedRoadmap(resumeData, targetRole);
    }

    const finalRoadmap = {
      targetRole: aiRoadmap.targetRole || targetRole,
      experienceLevel: aiRoadmap.experienceLevel || expLevel,
      estimatedWeeks: aiRoadmap.estimatedWeeks || 8,
      readinessScore: aiRoadmap.readinessScore || calculateReadinessScore(aiRoadmap.phases),
      matchedSkillsCount: matchedSkills.length,
      skillGapCount: recommendedSkills.length,
      phases: aiRoadmap.phases,
      updatedAt: new Date().toISOString(),
    };

    await prisma.user.update({
      where: { id: userId },
      data: { savedRoadmap: finalRoadmap },
    });

    return res.status(200).json({
      message: 'Personalized AI Roadmap generated successfully',
      roadmap: finalRoadmap,
    });
  } catch (error: any) {
    console.error('Generate Personal Roadmap Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to generate roadmap' });
  }
};

export const updateRoadmapStep = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.savedRoadmap) {
      return res.status(404).json({ message: 'No active roadmap found for user.' });
    }

    const { topicId, newStatus } = req.body;
    if (!topicId || !newStatus) {
      return res.status(400).json({ message: 'topicId and newStatus are required.' });
    }

    const roadmap: any = user.savedRoadmap;
    let found = false;

    if (Array.isArray(roadmap.phases)) {
      roadmap.phases.forEach((phase: any) => {
        if (Array.isArray(phase.topics)) {
          phase.topics.forEach((topic: any) => {
            if (topic.id === topicId) {
              topic.status = newStatus;
              found = true;
            }
          });
        }
      });
    }

    if (!found) {
      return res.status(404).json({ message: 'Topic not found in roadmap.' });
    }

    roadmap.readinessScore = calculateReadinessScore(roadmap.phases);
    roadmap.updatedAt = new Date().toISOString();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { savedRoadmap: roadmap },
    });

    return res.status(200).json({
      message: 'Roadmap step updated successfully',
      roadmap: updatedUser.savedRoadmap,
    });
  } catch (error: any) {
    console.error('Update Roadmap Step Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to update step' });
  }
};

export const addRoadmapTopic = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.savedRoadmap) {
      return res.status(404).json({ message: 'No active roadmap found for user.' });
    }

    const { phaseId, title, description, keyConcepts, practicalProject } = req.body;
    if (!phaseId || !title) {
      return res.status(400).json({ message: 'phaseId and title are required.' });
    }

    const roadmap: any = user.savedRoadmap;
    const targetPhase = Array.isArray(roadmap.phases) ? roadmap.phases.find((p: any) => p.id === phaseId) : null;

    if (!targetPhase) {
      return res.status(404).json({ message: 'Target phase not found.' });
    }

    const newTopic = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || 'Custom learning module.',
      status: 'pending',
      isFromResume: false,
      isSkillGap: false,
      keyConcepts: Array.isArray(keyConcepts) ? keyConcepts : (keyConcepts ? keyConcepts.split(',').map((s: string) => s.trim()) : ['Core Concepts', 'Implementation', 'Best Practices']),
      practicalProject: practicalProject?.trim() || 'Build a working prototype demonstrating mastery of this topic.',
      resourceLink: 'https://developer.mozilla.org',
    };

    if (!Array.isArray(targetPhase.topics)) {
      targetPhase.topics = [];
    }
    targetPhase.topics.push(newTopic);
    roadmap.updatedAt = new Date().toISOString();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { savedRoadmap: roadmap },
    });

    return res.status(200).json({
      message: 'Topic added successfully',
      roadmap: updatedUser.savedRoadmap,
    });
  } catch (error: any) {
    console.error('Add Roadmap Topic Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to add topic' });
  }
};

export const resetPersonalRoadmap = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { savedRoadmap: null as any },
      });
    }
    return res.status(200).json({ message: 'Roadmap reset successfully', roadmap: null });
  } catch (error: any) {
    console.error('Reset Roadmap Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to reset roadmap' });
  }
};

function calculateReadinessScore(phases: any[] = []) {
  let totalTopics = 0;
  let scorePoints = 0;

  phases.forEach((p) => {
    (p.topics || []).forEach((t: any) => {
      totalTopics++;
      if (t.status === 'completed') scorePoints += 100;
      else if (t.status === 'in_progress') scorePoints += 45;
    });
  });

  if (totalTopics === 0) return 50;
  return Math.min(98, Math.max(30, Math.round(scorePoints / totalTopics)));
}

function createDefaultPersonalizedRoadmap(resumeData: any = {}, customRole?: string) {
  const role = customRole || resumeData.extractedRole || 'Full-Stack Web Engineer';
  const matched = resumeData.matchedSkills || ['JavaScript', 'React.js', 'Node.js', 'REST APIs', 'MongoDB', 'Git'];
  const recommended = resumeData.recommendedSkills || ['TypeScript', 'Docker', 'CI/CD Pipelines', 'System Design', 'AWS/Cloud'];

  return {
    targetRole: role,
    experienceLevel: resumeData.experienceLevel || '1-2 years',
    estimatedWeeks: 8,
    readinessScore: 68,
    matchedSkillsCount: matched.length,
    skillGapCount: recommended.length,
    phases: [
      {
        id: 'phase-1',
        phaseName: 'Phase 1: Resume Skill Gaps & Modern Core',
        duration: 'Weeks 1 - 2',
        description: 'Focus on bridging essential technical skill gaps identified during resume evaluation.',
        topics: [
          {
            id: 'p1-t1',
            title: recommended[0] ? `${recommended[0]} Mastery` : 'TypeScript & Strong Typing',
            description: `Master ${recommended[0] || 'TypeScript'} to make your code bulletproof and enterprise-ready.`,
            status: 'in_progress',
            isFromResume: false,
            isSkillGap: true,
            keyConcepts: ['Strict Type Checking', 'Generic Interfaces', 'Async API Contract Safety'],
            practicalProject: `Build a strongly-typed REST client library using ${recommended[0] || 'TypeScript'}.`,
            resourceLink: 'https://www.typescriptlang.org/docs/',
          },
          {
            id: 'p1-t2',
            title: matched[0] ? `${matched[0]} Advanced Patterns` : 'React.js State Architecture',
            description: `Leverage your existing proficiency in ${matched[0] || 'React'} for complex application design.`,
            status: 'completed',
            isFromResume: true,
            isSkillGap: false,
            keyConcepts: ['Custom Hooks Pattern', 'Global State Management', 'Performance Optimization'],
            practicalProject: 'Implement a high-performance state store with local storage synchronization.',
            resourceLink: 'https://react.dev',
          },
        ],
      },
      {
        id: 'phase-2',
        phaseName: 'Phase 2: Scalable Backend & System Architecture',
        duration: 'Weeks 3 - 4',
        description: 'Master production-grade backend design, database indexing, and containerization.',
        topics: [
          {
            id: 'p2-t1',
            title: recommended[1] ? `${recommended[1]} & Microservices Setup` : 'Docker Containerization',
            description: `Containerize development and production environments using ${recommended[1] || 'Docker'}.`,
            status: 'pending',
            isFromResume: false,
            isSkillGap: true,
            keyConcepts: ['Multi-Stage Dockerfiles', 'Docker Compose Orchestration', 'Environment Isolation'],
            practicalProject: 'Containerize multi-service architecture with database and caching service.',
            resourceLink: 'https://docs.docker.com/',
          },
          {
            id: 'p2-t2',
            title: matched[1] ? `${matched[1]} Data Modeling` : 'Node.js & MongoDB Optimization',
            description: `Optimize data persistence and database query response times using ${matched[1] || 'MongoDB'}.`,
            status: 'completed',
            isFromResume: true,
            isSkillGap: false,
            keyConcepts: ['Index Strategies & Aggregations', 'JWT Auth & Session Management', 'Rate Limiting Middleware'],
            practicalProject: 'Design an automated DB indexing & log monitoring pipeline.',
            resourceLink: 'https://mongoosejs.com/',
          },
        ],
      },
      {
        id: 'phase-3',
        phaseName: 'Phase 3: Cloud Deployment & CI/CD Pipelines',
        duration: 'Weeks 5 - 6',
        description: 'Automate code quality checks, continuous delivery, and cloud infrastructure deployment.',
        topics: [
          {
            id: 'p3-t1',
            title: recommended[2] ? `${recommended[2]} & DevOps Automation` : 'CI/CD & Cloud Deployments',
            description: `Implement automated test suites and production deployments with ${recommended[2] || 'CI/CD'}.`,
            status: 'pending',
            isFromResume: false,
            isSkillGap: true,
            keyConcepts: ['GitHub Actions Workflows', 'Automated Linting & Unit Testing', 'Cloud Server Hosting'],
            practicalProject: 'Setup automated zero-downtime deployment script on git commit push.',
            resourceLink: 'https://docs.github.com/en/actions',
          },
        ],
      },
      {
        id: 'phase-4',
        phaseName: 'Phase 4: High-Stakes Tech & Placement Interviews',
        duration: 'Weeks 7 - 8',
        description: 'Prepare for top-tier technical interviews, high-scale system design, and coding challenges.',
        topics: [
          {
            id: 'p4-t1',
            title: 'High Scale System Design & Architecture',
            description: 'Design fault-tolerant distributed systems, caching layers, and database sharding.',
            status: 'pending',
            isFromResume: false,
            isSkillGap: true,
            keyConcepts: ['Redis Caching & CDN', 'Database Sharding & Replication', 'Load Balancing & Message Queues'],
            practicalProject: 'Create a complete System Design document for a real-time messaging engine.',
            resourceLink: 'https://github.com/donnemartin/system-design-primer',
          },
        ],
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}
