import { Response } from 'express';
import { AuthRequest } from '../middlewares/isAuth';
import { prisma } from '../config/connectDb';

export const formatUserResponse = (user: any) => {
  if (!user) return null;
  return {
    ...user,
    interviewerProfile: {
      title: user.interviewerTitle || 'Senior Tech Interviewer',
      company: user.interviewerCompany || 'Tech Enterprise',
      yearsOfExperience: user.yearsOfExperience ?? 5,
      skills: user.skills || [],
      languages: user.languages || ['English'],
      bio: user.bio || '',
      rating: user.rating ?? 4.9,
      avatarUrl: user.avatarUrl || '',
      isApproved: user.isApproved ?? false,
      bankDetails: {
        accountHolderName: user.bankAccountHolderName || '',
        bankName: user.bankName || '',
        accountNumber: user.accountNumber || '',
        ifscCode: user.ifscCode || '',
        upiId: user.upiId || '',
        isVerified: user.bankIsVerified ?? false,
      },
      verificationDetails: {
        phoneNumber: user.phoneNumber || '',
        dob: user.dob || '',
        linkedinUrl: user.linkedinUrl || '',
        githubUrl: user.githubUrl || '',
        governmentIdUrl: user.governmentIdUrl || '',
        panCardUrl: user.panCardUrl || '',
        aadhaarUrl: user.aadhaarUrl || '',
        resumeUrl: user.resumeUrl || '',
        resumeOriginalName: user.resumeOriginalName || '',
        degreeUrl: user.degreeUrl || '',
        degreeOriginalName: user.degreeOriginalName || '',
        status: user.verificationStatus || 'unverified',
        extractedResumeName: user.extractedResumeName || '',
        extractedDegreeName: user.extractedDegreeName || '',
        extractedExperienceYears: user.extractedExperienceYears ?? 0,
        extractedSkills: user.extractedSkills || [],
        nameMatchScore: user.nameMatchScore ?? 0,
        isNameMatched: user.isNameMatched ?? false,
        mismatchReason: user.mismatchReason || '',
        auditSummary: user.auditSummary || '',
        auditedAt: user.auditedAt || null,
      },
    },
  };
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized', statusCode: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
        statusCode: 404,
      });
    }

    return res.status(200).json({
      user: formatUserResponse(user),
      message: 'User found successfully',
      statusCode: 200,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Failed to get current user: ${error.message}`,
    });
  }
};

export const getDashboardSummary = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const [interviews, bookings, quizzes, flashcardSets, documents] = await Promise.all([
      prisma.interview.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
      prisma.booking.findMany({
        where: { userId },
        include: {
          mentor: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              interviewerTitle: true,
              interviewerCompany: true,
              skills: true,
              languages: true,
              bio: true,
              rating: true,
              isApproved: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.quiz.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
      prisma.flashcardSet.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
      prisma.document.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }),
    ]);

    // AI Interview Metrics
    const totalAIInterviews = interviews.length;
    const completedAIInterviews = interviews.filter((i: any) => i.status === 'completed');
    const completedAICount = completedAIInterviews.length;
    const avgAIScore =
      completedAICount > 0
        ? Math.round(completedAIInterviews.reduce((acc: number, curr: any) => acc + (curr.finalScore || 0), 0) / completedAICount)
        : 0;

    // Human Mock Interview Metrics
    const totalHumanBookings = bookings.length;
    const completedHumanBookings = bookings.filter((b: any) => b.status === 'Completed');
    const completedHumanCount = completedHumanBookings.length;
    const upcomingHumanBooking = bookings.find((b: any) => b.status === 'Scheduled' || b.status === 'pending');
    const avgHumanScore =
      completedHumanCount > 0
        ? Math.round(
            completedHumanBookings.reduce(
              (acc: number, curr: any) => acc + (curr.finalScore || (curr.overallRating ? curr.overallRating * 20 : 0)),
              0
            ) / completedHumanCount
          )
        : 0;

    // Quiz Metrics
    const totalQuizzes = quizzes.length;
    const completedQuizzes = quizzes.filter((q: any) => q.status === 'completed' || q.attemptsCount > 0);
    const completedQuizCount = completedQuizzes.length;
    const avgQuizScore =
      completedQuizCount > 0
        ? Math.round(
            completedQuizzes.reduce(
              (acc: number, curr: any) => acc + (curr.bestScore || curr.lastAttemptScore || 0),
              0
            ) / completedQuizCount
          )
        : 0;

    // Flashcards Metrics
    const totalFlashcardSets = flashcardSets.length;
    const totalCards = flashcardSets.reduce((acc: number, curr: any) => {
      const cardsArr = Array.isArray(curr.cards) ? curr.cards : [];
      return acc + (curr.totalCards || cardsArr.length || 0);
    }, 0);
    const totalMastered = flashcardSets.reduce((acc: number, curr: any) => acc + (curr.masteredCount || 0), 0);
    const flashcardMasteryPct = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

    // Resume Score
    const resumeAnalysis: any = user.savedResumeAnalysis;
    const hasResume = Boolean(resumeAnalysis);
    const resumeScore = hasResume
      ? Number(
          resumeAnalysis?.overallScore ||
            resumeAnalysis?.matchPercentage ||
            resumeAnalysis?.score ||
            resumeAnalysis?.resumeScore ||
            70
        )
      : 0;

    // Placement Readiness Calculation
    let totalWeight = 0;
    let weightedSum = 0;

    if (hasResume) {
      weightedSum += resumeScore * 0.25;
      totalWeight += 0.25;
    }
    if (completedAICount > 0) {
      weightedSum += avgAIScore * 0.35;
      totalWeight += 0.35;
    }
    if (completedHumanCount > 0) {
      weightedSum += avgHumanScore * 0.2;
      totalWeight += 0.2;
    }
    if (completedQuizCount > 0) {
      weightedSum += avgQuizScore * 0.1;
      totalWeight += 0.1;
    }
    if (totalCards > 0) {
      weightedSum += flashcardMasteryPct * 0.1;
      totalWeight += 0.1;
    }

    const placementReadiness =
      totalWeight > 0 ? Math.min(100, Math.round(weightedSum / totalWeight)) : 0;

    // Dynamic Recommended Next Step
    let recommendation: any = {};
    if (!hasResume) {
      recommendation = {
        title: 'Analyze Your Resume',
        description: 'Upload your resume to get instant ATS feedback & AI-customized interview questions.',
        actionLabel: 'Analyze Resume',
        actionPath: '/resume',
        priority: 'high',
      };
    } else if (completedAICount === 0) {
      recommendation = {
        title: 'Take Your First AI Mock Interview',
        description: 'Practice real interview questions tailored to your role with instant feedback on confidence and correctness.',
        actionLabel: 'Start AI Mock Interview',
        actionPath: '/interview',
        priority: 'high',
      };
    } else if (completedQuizCount === 0 && documents.length > 0) {
      recommendation = {
        title: 'Test Your Skills With a Quick Quiz',
        description: 'Generate an interactive AI quiz from your uploaded study documents to test core concepts.',
        actionLabel: 'Take a Quiz',
        actionPath: '/quizzes',
        priority: 'medium',
      };
    } else if (avgAIScore < 75 && completedAICount > 0) {
      recommendation = {
        title: 'Improve AI Interview Score',
        description: `Your average AI interview score is currently ${avgAIScore}%. Take another mock round to refine your answers.`,
        actionLabel: 'Retake AI Interview',
        actionPath: '/interview',
        priority: 'medium',
      };
    } else {
      recommendation = {
        title: 'Book a Live 1-on-1 Mentor Interview',
        description: "You're making great progress! Schedule a live mock interview with an experienced technical interviewer.",
        actionLabel: 'Book Live Interview',
        actionPath: '/human-interviews',
        priority: 'medium',
      };
    }

    // Build Recent Activity Feed
    const activities: any[] = [];

    interviews.slice(0, 5).forEach((i: any) => {
      activities.push({
        id: `interview-${i.id}`,
        type: 'interview',
        text: `AI Mock Interview (${i.role || 'General'} - ${i.mode || 'Technical'})`,
        detail: i.status === 'completed' ? `Score: ${i.finalScore}%` : 'In Progress / Draft',
        time: i.updatedAt,
        timestamp: new Date(i.updatedAt).getTime(),
        iconType: 'mic',
        color: 'emerald',
        actionPath: i.status === 'completed' ? `/report/${i.id}` : '/interview',
      });
    });

    bookings.slice(0, 5).forEach((b: any) => {
      const mentorFormatted = formatUserResponse(b.mentor);
      activities.push({
        id: `booking-${b.id}`,
        type: 'human_interview',
        text: `1-on-1 Live Interview with ${mentorFormatted?.name || 'Mentor'}`,
        detail: `Status: ${b.status} (${b.date || ''} ${b.timeSlot || ''})`,
        time: b.updatedAt,
        timestamp: new Date(b.updatedAt).getTime(),
        iconType: 'person',
        color: 'purple',
        actionPath: '/human-interviews',
      });
    });

    quizzes.slice(0, 5).forEach((q: any) => {
      activities.push({
        id: `quiz-${q.id}`,
        type: 'quiz',
        text: `Quiz: ${q.title}`,
        detail: q.status === 'completed' || q.attemptsCount > 0 ? `Best Score: ${q.bestScore}%` : 'Created',
        time: q.updatedAt,
        timestamp: new Date(q.updatedAt).getTime(),
        iconType: 'quiz',
        color: 'blue',
        actionPath: `/quizzes/${q.id}`,
      });
    });

    documents.slice(0, 5).forEach((d: any) => {
      activities.push({
        id: `document-${d.id}`,
        type: 'document',
        text: `Uploaded Document: ${d.title}`,
        detail: `${d.pageCount || 1} page(s) · ${d.category || 'Study Material'}`,
        time: d.createdAt,
        timestamp: new Date(d.createdAt).getTime(),
        iconType: 'document',
        color: 'amber',
        actionPath: `/documents/${d.id}`,
      });
    });

    if (hasResume) {
      activities.push({
        id: 'resume-analysis-active',
        type: 'resume',
        text: 'Resume Analyzed & Evaluated',
        detail: `ATS Match Score: ${resumeScore}%`,
        time: user.updatedAt,
        timestamp: new Date(user.updatedAt).getTime(),
        iconType: 'file',
        color: 'teal',
        actionPath: '/resume',
      });
    }

    activities.sort((a, b) => b.timestamp - a.timestamp);

    const formattedBookings = bookings.map((b: any) => ({
      ...b,
      mentor: formatUserResponse(b.mentor),
      mentorId: formatUserResponse(b.mentor),
    }));

    return res.status(200).json({
      success: true,
      stats: {
        aiInterviews: {
          total: totalAIInterviews,
          completed: completedAICount,
          avgScore: avgAIScore,
        },
        humanInterviews: {
          total: totalHumanBookings,
          completed: completedHumanCount,
          avgScore: avgHumanScore,
          upcoming: upcomingHumanBooking || null,
        },
        quizzes: {
          total: totalQuizzes,
          completed: completedQuizCount,
          avgScore: avgQuizScore,
        },
        flashcards: {
          totalSets: totalFlashcardSets,
          totalCards,
          masteredCards: totalMastered,
          masteryPct: flashcardMasteryPct,
        },
        documentsCount: documents.length,
        resumeScore,
        hasResume,
        placementReadiness,
        credits: user.credits || 0,
      },
      recommendation,
      activities: activities.slice(0, 8),
      recentDocuments: documents.slice(0, 3),
      recentInterviews: interviews.slice(0, 5),
      recentBookings: formattedBookings.slice(0, 5),
      recentFlashcards: flashcardSets.slice(0, 4),
      recentQuizzes: quizzes.slice(0, 4),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch dashboard summary: ${error.message}`,
    });
  }
};

export const switchUserRole = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { role } = req.body;
    if (!['learner', 'interviewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        interviewerTitle: role === 'interviewer' && !user.interviewerTitle ? 'Senior Tech Interviewer' : user.interviewerTitle,
        interviewerCompany: role === 'interviewer' && !user.interviewerCompany ? 'HireReady.AI Partner' : user.interviewerCompany,
        yearsOfExperience: role === 'interviewer' ? (user.yearsOfExperience || 5) : user.yearsOfExperience,
        skills: role === 'interviewer' && user.skills.length === 0 ? ['System Design', 'React.js', 'Node.js', 'DSA'] : user.skills,
        languages: role === 'interviewer' && user.languages.length === 0 ? ['English'] : user.languages,
        rating: role === 'interviewer' ? (user.rating || 4.9) : user.rating,
        isApproved: role === 'interviewer' ? true : user.isApproved,
      },
    });

    return res.status(200).json({
      message: `User role switched to ${role} successfully.`,
      user: formatUserResponse(updatedUser),
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to switch role.' });
  }
};

export const updateInterviewerProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { title, company, yearsOfExperience, skills, languages, bio } = req.body;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        interviewerTitle: title || user.interviewerTitle,
        interviewerCompany: company || user.interviewerCompany,
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : user.yearsOfExperience,
        skills: Array.isArray(skills) ? skills : user.skills,
        languages: Array.isArray(languages) ? languages : user.languages,
        bio: bio || user.bio,
      },
    });

    return res.status(200).json({
      message: 'Interviewer profile updated successfully.',
      user: formatUserResponse(updatedUser),
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Failed to update profile.' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized', statusCode: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.', statusCode: 404 });
    }

    const [interviews, bookings, quizzes, flashcardSets] = await Promise.all([
      prisma.interview.findMany({ where: { userId } }),
      prisma.booking.findMany({ where: { userId } }),
      prisma.quiz.findMany({ where: { userId } }),
      prisma.flashcardSet.findMany({ where: { userId } }),
    ]);

    const totalAIInterviews = interviews.length;
    const completedAIInterviews = interviews.filter((i: any) => i.status === 'completed');
    const completedAICount = completedAIInterviews.length;

    const totalHumanBookings = bookings.length;
    const completedHumanBookings = bookings.filter((b: any) => b.status === 'Completed');
    const completedHumanCount = completedHumanBookings.length;

    const totalInterviews = totalAIInterviews + totalHumanBookings;
    const completedInterviewsCount = completedAICount + completedHumanCount;

    const totalAIScore = completedAIInterviews.reduce((sum: number, i: any) => sum + (i.finalScore || 0), 0);
    const totalHumanScore = completedHumanBookings.reduce(
      (sum: number, b: any) => sum + (b.finalScore || (b.overallRating ? b.overallRating * 20 : 0)),
      0
    );

    const averageScore =
      completedInterviewsCount > 0
        ? Math.round((totalAIScore + totalHumanScore) / completedInterviewsCount)
        : 0;

    const resumeAnalysis: any = user.savedResumeAnalysis;
    const hasResume = Boolean(resumeAnalysis);
    const resumeATSScore = hasResume
      ? Number(
          resumeAnalysis?.overallScore ||
            resumeAnalysis?.matchPercentage ||
            resumeAnalysis?.score ||
            resumeAnalysis?.resumeScore ||
            0
        )
      : null;

    const totalMasteredFlashcards = flashcardSets.reduce((sum: number, f: any) => sum + (f.masteredCount || 0), 0);
    const hasPerfectQuiz = quizzes.some(
      (q: any) => (q.bestScore >= 100 || q.lastAttemptScore >= 100) && (q.status === 'completed' || q.attemptsCount > 0)
    );

    const achievements = [
      {
        id: 'first_interview',
        title: 'First Interview',
        desc: 'Completed your first AI or human mock interview',
        type: 'mic',
        unlocked: completedInterviewsCount >= 1,
      },
      {
        id: 'ten_interviews',
        title: '10 Interviews',
        desc: 'Completed 10 mock interview rounds',
        type: 'lightning',
        unlocked: completedInterviewsCount >= 10,
      },
      {
        id: 'resume_uploaded',
        title: 'Resume Uploaded',
        desc: 'Uploaded and analyzed your resume',
        type: 'file',
        unlocked: hasResume,
      },
      {
        id: 'quiz_master',
        title: 'Quiz Master',
        desc: 'Scored 100% on any quiz module',
        type: 'trophy',
        unlocked: hasPerfectQuiz,
      },
      {
        id: 'flashcard_pro',
        title: 'Flashcard Pro',
        desc: 'Mastered at least 50 study flashcards',
        type: 'layers',
        unlocked: totalMasteredFlashcards >= 50,
      },
      {
        id: 'streak_30',
        title: '30-Day Streak',
        desc: 'Practiced actively across 30 days',
        type: 'calendar',
        unlocked: completedInterviewsCount >= 5,
      },
    ];

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return res.status(200).json({
      success: true,
      user: formatUserResponse(user),
      statistics: {
        totalInterviews,
        completedInterviews: completedInterviewsCount,
        averageScore,
        hasResume,
        resumeATSScore,
        credits: user.credits || 0,
      },
      achievements,
      unlockedCount,
      totalAchievements: achievements.length,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: `Failed to fetch profile: ${error.message}`,
    });
  }
};

