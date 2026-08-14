import express from 'express';
import isAuth from '../middlewares/isAuth';
import { upload } from '../middlewares/multer';
import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  chatWithDocument,
  handleDocumentAction,
  generateFlashcardsFromDoc,
  generateQuizFromDoc,
} from '../controllers/document.controller';

const documentRouter = express.Router();

documentRouter.post('/upload', isAuth, upload.single('file'), uploadDocument);
documentRouter.get('/list', isAuth, getDocuments);
documentRouter.get('/:id', isAuth, getDocumentById);
documentRouter.delete('/delete/:id', isAuth, deleteDocument);

// AI features per document
documentRouter.post('/:id/chat', isAuth, chatWithDocument);
documentRouter.post('/:id/action', isAuth, handleDocumentAction);
documentRouter.post('/:id/flashcards', isAuth, generateFlashcardsFromDoc);
documentRouter.post('/:id/quiz', isAuth, generateQuizFromDoc);

export default documentRouter;
