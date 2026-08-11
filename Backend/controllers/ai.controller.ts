import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/isAuth';
import { askAi, askAiJson } from '../services/openRouter.service';
import { prisma } from '../config/connectDb';

// 1. POST /chat
export const chatWithAi = async (req: Request, res: Response): Promise<any> => {
  try {
    const { message, context, history } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const messages: any[] = [
      {
        role: 'system',
        content: `You are HireReady.AI assistant for placement preparation. Be concise, clear, and professional.${
          context ? `\n\nContext:\n${context.slice(0, 3000)}` : ''
        }`,
      },
      ...(Array.isArray(history) ? history.slice(-6) : []),
      { role: 'user', content: message.trim() },
    ];

    const reply = await askAi(messages);
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ message: error.message || 'AI Chat failed.' });
  }
};

// 2. POST /summary
export const generateSummary = async (req: Request, res: Response): Promise<any> => {
  try {
    const { text, documentId } = req.body;
    let contentToSummarize = text;

    if (!contentToSummarize && documentId) {
      const doc = await prisma.document.findUnique({ where: { id: documentId } });
      if (doc) contentToSummarize = doc.extractedText;
    }

    if (!contentToSummarize || !contentToSummarize.trim()) {
      return res.status(400).json({ message: 'Text or documentId is required.' });
    }

    const messages: any[] = [
      {
        role: 'system',
        content: 'Provide a structured, executive summary highlighting key takeaways and technical interview points.',
      },
      {
        role: 'user',
        content: contentToSummarize.slice(0, 4000),
      },
    ];

    const summary = await askAi(messages);
    return res.status(200).json({ summary });
  } catch (error: any) {
    console.error('Summary Error:', error);
    return res.status(500).json({ message: error.message || 'Summary generation failed.' });
  }
};

// 3. POST /flashcards
export const generateFlashcards = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.credits < 20) {
      return res.status(400).json({
        message: 'Not enough credits. Minimum 20 credits required for Flashcards generation.',
        statusCode: 400,
      });
    }

    const { topic, text, documentId, cardCount = 6 } = req.body;
    let promptContent = topic || text;

    if (!promptContent && documentId) {
      const doc = await prisma.document.findUnique({ where: { id: documentId } });
      if (doc) promptContent = doc.extractedText;
    }

    if (!promptContent || !promptContent.trim()) {
      return res.status(400).json({ message: 'Topic, text, or documentId is required.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 20 } },
    });

    const messages: any[] = [
      {
        role: 'system',
        content: `Generate exactly ${cardCount} study flashcards for placement prep.
Return strictly valid JSON array:
[
  { "question": "string", "answer": "string", "difficulty": "EASY|MEDIUM|HARD", "category": "string" }
]`,
      },
      {
        role: 'user',
        content: `Topic/Content:\n${promptContent.slice(0, 3500)}`,
      },
    ];

    const rawCards = await askAiJson(messages);
    const cards = Array.isArray(rawCards) ? rawCards : [];

    const set = await prisma.flashcardSet.create({
      data: {
        userId,
        documentId: documentId || null,
        title: topic || (documentId ? 'Document Flashcards' : 'AI Placement Deck'),
        cards: cards.map((c: any) => ({
          question: c.question,
          answer: c.answer,
          difficulty: c.difficulty || 'MEDIUM',
          category: c.category || 'General',
        })),
        totalCards: cards.length,
      },
    });

    return res.status(201).json({
      message: 'Flashcards generated and saved successfully.',
      flashcardSet: set,
      creditsLeft: updatedUser.credits,
    });
  } catch (error: any) {
    console.error('Generate Flashcards Error:', error);
    return res.status(500).json({ message: error.message || 'Flashcards generation failed.' });
  }
};

// 4. POST /quiz
export const generateQuiz = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.credits < 20) {
      return res.status(400).json({
        message: 'Not enough credits. Minimum 20 credits required for Quiz generation.',
        statusCode: 400,
      });
    }

    const { topic, text, documentId, questionCount = 5 } = req.body;
    let promptContent = topic || text;

    if (!promptContent && documentId) {
      const doc = await prisma.document.findUnique({ where: { id: documentId } });
      if (doc) promptContent = doc.extractedText;
    }

    if (!promptContent || !promptContent.trim()) {
      return res.status(400).json({ message: 'Topic, text, or documentId is required.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 20 } },
    });

    const messages: any[] = [
      {
        role: 'system',
        content: `Generate a ${questionCount}-question multiple choice quiz for placement prep.
Return strictly valid JSON format:
{
  "title": "string",
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctIndex": number,
      "explanation": "string"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Topic/Content:\n${promptContent.slice(0, 3500)}`,
      },
    ];

    const quizData = await askAiJson(messages);

    const quiz = await prisma.quiz.create({
      data: {
        userId,
        documentId: documentId || null,
        title: quizData.title || topic || 'AI Practice Quiz',
        questions: quizData.questions || [],
        totalQuestions: quizData.questions?.length || 0,
      },
    });

    return res.status(201).json({
      message: 'Quiz generated and saved successfully.',
      quiz,
      creditsLeft: updatedUser.credits,
    });
  } catch (error: any) {
    console.error('Generate Quiz Error:', error);
    return res.status(500).json({ message: error.message || 'Quiz generation failed.' });
  }
};

// 5. POST /explain
export const explainConcept = async (req: Request, res: Response): Promise<any> => {
  try {
    const { concept, context } = req.body;
    if (!concept || !concept.trim()) {
      return res.status(400).json({ message: 'Concept is required.' });
    }

    const messages: any[] = [
      {
        role: 'system',
        content: 'Explain the technical concept in simple, beginner-friendly terms with code examples and interview application tips.',
      },
      {
        role: 'user',
        content: `Concept: ${concept.trim()}${context ? `\nContext:\n${context.slice(0, 2000)}` : ''}`,
      },
    ];

    const explanation = await askAi(messages);
    return res.status(200).json({ explanation });
  } catch (error: any) {
    console.error('Explain Concept Error:', error);
    return res.status(500).json({ message: error.message || 'Concept explanation failed.' });
  }
};

// 6. POST /notes
export const generateNotes = async (req: Request, res: Response): Promise<any> => {
  try {
    const { topic, text } = req.body;
    const content = topic || text;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Topic or text is required.' });
    }

    const messages: any[] = [
      {
        role: 'system',
        content: 'Generate structured, bulleted study revision notes with key definitions, formulas, and interview tips.',
      },
      {
        role: 'user',
        content: content.slice(0, 4000),
      },
    ];

    const notes = await askAi(messages);
    return res.status(200).json({ notes });
  } catch (error: any) {
    console.error('Generate Notes Error:', error);
    return res.status(500).json({ message: error.message || 'Notes generation failed.' });
  }
};

// 7. POST /keywords
export const extractKeywords = async (req: Request, res: Response): Promise<any> => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Text content is required.' });
    }

    const messages: any[] = [
      {
        role: 'system',
        content: 'Extract key technical terms, tools, algorithms, and concepts from the text as a bulleted list with brief descriptions.',
      },
      {
        role: 'user',
        content: text.slice(0, 4000),
      },
    ];

    const keywords = await askAi(messages);
    return res.status(200).json({ keywords });
  } catch (error: any) {
    console.error('Extract Keywords Error:', error);
    return res.status(500).json({ message: error.message || 'Keyword extraction failed.' });
  }
};

// 8. Flashcards & Quiz Helpers
export const getFlashcardSets = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const where: any = { userId };
    if (req.query.documentId) {
      where.documentId = req.query.documentId as string;
    }
    const sets = await prisma.flashcardSet.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.status(200).json(sets);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch flashcards.' });
  }
};

export const deleteFlashcardSet = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await prisma.flashcardSet.deleteMany({ where: { id: req.params.id as string, userId } });
    return res.status(200).json({ message: 'Flashcard set deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete flashcard set.' });
  }
};

export const getQuizzes = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const where: any = { userId };
    if (req.query.documentId) {
      where.documentId = req.query.documentId as string;
    }
    const quizzes = await prisma.quiz.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.status(200).json(quizzes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch quizzes.' });
  }
};

export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await prisma.quiz.deleteMany({ where: { id: req.params.id as string, userId } });
    return res.status(200).json({ message: 'Quiz deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete quiz.' });
  }
};

export const submitQuizAttempt = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { score } = req.body;
    const quiz = await prisma.quiz.findFirst({ where: { id: req.params.id as string, userId } });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        attemptsCount: { increment: 1 },
        lastAttemptScore: score,
        bestScore: score > quiz.bestScore ? score : quiz.bestScore,
        status: 'completed',
      },
    });

    return res.status(200).json({ message: 'Quiz attempt saved.', quiz: updatedQuiz });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to submit quiz attempt.' });
  }
};
