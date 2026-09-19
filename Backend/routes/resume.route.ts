import express from 'express';
import isAuth from '../middlewares/isAuth';
import { upload } from '../middlewares/multer';
import {
  analyzeFullResume,
  getSavedResumeAnalysis,
  getResumeHistory,
  deleteResumeAnalysis,
} from '../controllers/interview.controller';

const resumeRouter = express.Router();

resumeRouter.post('/analyze', isAuth, upload.single('resume'), analyzeFullResume);
resumeRouter.get('/latest', isAuth, getSavedResumeAnalysis);
resumeRouter.get('/history', isAuth, getResumeHistory);
resumeRouter.delete('/:id', isAuth, deleteResumeAnalysis);
resumeRouter.delete('/latest', isAuth, deleteResumeAnalysis);

export default resumeRouter;
