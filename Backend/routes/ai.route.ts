import express from 'express';
import isAuth from '../middlewares/isAuth';
import {
  chatWithAi,
  generateSummary,
  generateFlashcards,
  generateQuiz,
  explainConcept,
  generateNotes,
  extractKeywords,
  getFlashcardSets,
  deleteFlashcardSet,
  getQuizzes,
  deleteQuiz,
  submitQuizAttempt,
  getBlind75Guidance,
} from '../controllers/ai.controller';

const aiRouter = express.Router();

// Required Standalone & AI Endpoints
aiRouter.post('/chat', isAuth, chatWithAi);
aiRouter.post('/summary', isAuth, generateSummary);
aiRouter.post('/flashcards', isAuth, generateFlashcards);
aiRouter.post('/quiz', isAuth, generateQuiz);
aiRouter.post('/explain', isAuth, explainConcept);
aiRouter.post('/notes', isAuth, generateNotes);
aiRouter.post('/keywords', isAuth, extractKeywords);

// Flashcards & Quizzes Persistence Routes
aiRouter.get('/flashcards', isAuth, getFlashcardSets);
aiRouter.delete('/flashcards/:id', isAuth, deleteFlashcardSet);
aiRouter.get('/quizzes', isAuth, getQuizzes);
aiRouter.delete('/quizzes/:id', isAuth, deleteQuiz);
aiRouter.post('/quizzes/:id/submit', isAuth, submitQuizAttempt);

// Blind 75 Interactive AI Guidance (Requires 50 credits)
aiRouter.post('/blind75-guidance', isAuth, getBlind75Guidance);

export default aiRouter;
