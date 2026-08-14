import { Response } from 'express';
import { AuthRequest } from '../middlewares/isAuth';
import fs from 'fs';
import path from 'path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { prisma } from '../config/connectDb';
import { askAi, askAiJson } from '../services/openRouter.service';

const extractTextFromFile = async (filePath: string, originalName: string) => {
  try {
    const ext = path.extname(originalName).toLowerCase();
    const fileBuffer = await fs.promises.readFile(filePath);

    if (ext === '.pdf') {
      const uint8Array = new Uint8Array(fileBuffer);
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      let extractedText = '';
      const pageCount = pdf.numPages || 1;

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + '\n';
      }

      extractedText = extractedText.replace(/\s+/g, ' ').trim();
      return { extractedText, pageCount };
    } else {
      const text = fileBuffer.toString('utf-8').trim();
      const pageCount = Math.max(1, Math.ceil(text.length / 2000));
      return { extractedText: text, pageCount };
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return { extractedText: 'Content extracted from document.', pageCount: 1 };
  }
};

// 1. Upload Document
export const uploadDocument = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Document file is required.',
        statusCode: 400,
      });
    }

    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.credits < 20) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: 'Not enough credits. Minimum 20 credits required for Document processing.',
        statusCode: 400,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: 20 } },
    });

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const title = req.body.title || originalName;
    const category = req.body.category || 'General';

    const { extractedText, pageCount } = await extractTextFromFile(filePath, originalName);

    const doc = await prisma.document.create({
      data: {
        userId,
        title,
        originalName,
        filePath,
        fileUrl: `/public/${path.basename(filePath)}`,
        fileSize,
        pageCount,
        extractedText,
        category,
      },
    });

    return res.status(201).json({
      message: 'Document uploaded successfully',
      document: doc,
      creditsLeft: updatedUser.credits,
    });
  } catch (error: any) {
    console.error('Upload document error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      message: error.message || 'Failed to upload document.',
      statusCode: 500,
    });
  }
};

// 2. Get All User Documents
export const getDocuments = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({
      message: 'Failed to fetch documents.',
      statusCode: 500,
    });
  }
};

// 3. Get Single Document by ID
export const getDocumentById = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const docId = req.params.id as string;
    const doc = await prisma.document.findFirst({
      where: { id: docId, userId },
    });
    if (!doc) {
      return res.status(404).json({
        message: 'Document not found.',
        statusCode: 404,
      });
    }
    return res.status(200).json(doc);
  } catch (error) {
    console.error('Get document by id error:', error);
    return res.status(500).json({
      message: 'Failed to fetch document.',
      statusCode: 500,
    });
  }
};

// 4. Delete Document
export const deleteDocument = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const docId = req.params.id as string;
    const doc = await prisma.document.findFirst({
      where: { id: docId, userId },
    });
    if (!doc) {
      return res.status(404).json({
        message: 'Document not found.',
        statusCode: 404,
      });
    }

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (err) {
        console.error('Failed to delete file from filesystem:', err);
      }
    }

    await prisma.documentSession.deleteMany({ where: { documentId: doc.id } });
    await prisma.document.delete({ where: { id: doc.id } });

    return res.status(200).json({
      message: 'Document deleted successfully.',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({
      message: 'Failed to delete document.',
      statusCode: 500,
    });
  }
};

// 5. Document AI Chat
export const chatWithDocument = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        message: 'Chat message is required.',
        statusCode: 400,
      });
    }

    const docId = req.params.id as string;
    const doc = await prisma.document.findFirst({
      where: { id: docId, userId },
    });
    if (!doc) {
      return res.status(404).json({
        message: 'Document not found.',
        statusCode: 404,
      });
    }

    let session = await prisma.documentSession.findFirst({
      where: {
        documentId: doc.id,
        userId,
      },
    });

    const messagesArr: any[] = session && Array.isArray(session.messages) ? (session.messages as any[]) : [];

    const contextPrompt = `Document Title: ${doc.title}\nExtracted Content:\n${doc.extractedText.slice(0, 3000)}`;

    const conversationHistory = messagesArr.slice(-6).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const aiMessages: any[] = [
      {
        role: 'system',
        content: `You are an AI study assistant for placement preparation. Answer the user's questions strictly based on the following document context:\n${contextPrompt}\nProvide clear, helpful, and concise answers.`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message.trim(),
      },
    ];

    const aiReply = await askAi(aiMessages);

    const updatedMessages = [
      ...messagesArr,
      { role: 'user', content: message.trim(), timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiReply, timestamp: new Date().toISOString() },
    ];

    if (!session) {
      session = await prisma.documentSession.create({
        data: {
          documentId: doc.id,
          userId,
          messages: updatedMessages,
        },
      });
    } else {
      session = await prisma.documentSession.update({
        where: { id: session.id },
        data: { messages: updatedMessages },
      });
    }

    return res.status(200).json({
      reply: aiReply,
      sessionMessages: session.messages,
    });
  } catch (error: any) {
    console.error('Document AI chat error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to generate AI response.',
      statusCode: 500,
    });
  }
};

// 6. Document AI Actions
export const handleDocumentAction = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { action } = req.body;
    const docId = req.params.id as string;
    const doc = await prisma.document.findFirst({
      where: { id: docId, userId },
    });
    if (!doc) {
      return res.status(404).json({
        message: 'Document not found.',
        statusCode: 404,
      });
    }

    const textSnippet = doc.extractedText.slice(0, 4000) || doc.title;

    let systemPrompt = '';
    const userPrompt = `Document Title: ${doc.title}\n\nContent:\n${textSnippet}`;

    switch (action) {
      case 'summary':
        systemPrompt = 'Provide a structured, high-level summary of the document with key takeaways and core concepts.';
        break;
      case 'explain':
        systemPrompt = 'Explain the core concepts in this document in simple, beginner-friendly terms with real-world placement interview examples.';
        break;
      case 'keywords':
        systemPrompt = 'Extract key technical terms, topics, and important concepts from this document as bullet points with 1-line descriptions.';
        break;
      case 'notes':
        systemPrompt = 'Generate clear, bulleted study revision notes highlighting important formulas, definitions, and placement tips.';
        break;
      case 'mindmap':
        systemPrompt = 'Create a structured outline representation of a mind map for this document with primary nodes and sub-concepts.';
        break;
      default:
        return res.status(400).json({ message: 'Invalid action specified.' });
    }

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const result = await askAi(messages);

    if (action === 'summary') {
      await prisma.document.update({
        where: { id: doc.id },
        data: { summary: result, summaryAvailable: true },
      });
    }

    return res.status(200).json({
      action,
      result,
    });
  } catch (error: any) {
    console.error('Document AI action error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to process AI action.',
      statusCode: 500,
    });
  }
};

// 7. Generate Flashcards from Document
export const generateFlashcardsFromDoc = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const docId = req.params.id as string;
    const doc = await prisma.document.findFirst({
      where: { id: docId, userId },
    });
    if (!doc) {
      return res.status(404).json({
        message: 'Document not found.',
        statusCode: 404,
      });
    }

    const textSnippet = doc.extractedText.slice(0, 3500) || doc.title;

    const messages: any[] = [
      {
        role: 'system',
        content: `Generate exactly 5 high-yield study flashcards from the given text for placement interview prep.
Return strictly valid JSON array format without extra markdown commentary:
[
  { "id": 1, "question": "string", "answer": "string", "difficulty": "EASY|MEDIUM|HARD", "category": "string" }
]`,
      },
      {
        role: 'user',
        content: `Document Title: ${doc.title}\n\nContent:\n${textSnippet}`,
      },
    ];

    let flashcards: any[] = [];
    try {
      flashcards = await askAiJson(messages);
    } catch (parseErr) {
      console.warn('askAiJson parsing failed, attempting fallback parse:', parseErr);
      const raw = await askAi(messages);
      const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      flashcards = JSON.parse(cleaned);
    }

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      flashcards = [
        {
          id: 1,
          question: `What are the core concepts covered in ${doc.title}?`,
          answer: textSnippet.slice(0, 200) || 'Core principles and technical fundamentals covered in this document.',
          difficulty: 'MEDIUM',
          category: doc.category || 'General',
        },
      ];
    }

    const updatedDoc = await prisma.document.update({
      where: { id: doc.id },
      data: { flashcardsCount: { increment: flashcards.length } },
    });

    return res.status(200).json({
      flashcards,
      flashcardsCount: updatedDoc.flashcardsCount,
    });
  } catch (error: any) {
    console.error('Generate flashcards error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to generate flashcards.',
      statusCode: 500,
    });
  }
};

// 8. Generate Quiz from Document
export const generateQuizFromDoc = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const docId = req.params.id as string;
    const doc = await prisma.document.findFirst({
      where: { id: docId, userId },
    });
    if (!doc) {
      return res.status(404).json({
        message: 'Document not found.',
        statusCode: 404,
      });
    }

    const textSnippet = doc.extractedText.slice(0, 3500) || doc.title;

    const messages: any[] = [
      {
        role: 'system',
        content: `Generate a 4-question multiple-choice placement practice quiz based on the text.
Return strictly valid JSON format without markdown wrappers:
{
  "title": "Quiz Title",
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}`,
      },
      {
        role: 'user',
        content: `Document Title: ${doc.title}\n\nContent:\n${textSnippet}`,
      },
    ];

    let quiz: any = null;
    try {
      quiz = await askAiJson(messages);
    } catch (parseErr) {
      console.warn('askAiJson parsing failed for quiz, attempting fallback:', parseErr);
      const raw = await askAi(messages);
      const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      quiz = JSON.parse(cleaned);
    }

    const updatedDoc = await prisma.document.update({
      where: { id: doc.id },
      data: { quizzesCount: { increment: 1 } },
    });

    return res.status(200).json({
      quiz,
      quizzesCount: updatedDoc.quizzesCount,
    });
  } catch (error: any) {
    console.error('Generate quiz error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to generate quiz.',
      statusCode: 500,
    });
  }
};
