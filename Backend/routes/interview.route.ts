import express from 'express';
import isAuth from '../middlewares/isAuth';
import { upload } from '../middlewares/multer';
import {
  analyzeResume,
  analyzeFullResume,
  getSavedResumeAnalysis,
  getPersonalRoadmap,
  generatePersonalRoadmap,
  updateRoadmapStep,
  addRoadmapTopic,
  resetPersonalRoadmap,
  finishInterview,
  generateQuestions,
  getInterviewReport,
  getMyInterviews,
  submitAnswer,
} from '../controllers/interview.controller';

const interviewRouter = express.Router();

interviewRouter.post('/resume', isAuth, upload.single('resume'), analyzeResume);
interviewRouter.post('/full-resume-analysis', isAuth, upload.single('resume'), analyzeFullResume);
interviewRouter.get('/saved-resume-analysis', isAuth, getSavedResumeAnalysis);

// Personalized AI Roadmap Routes
interviewRouter.get('/personal-roadmap', isAuth, getPersonalRoadmap);
interviewRouter.post('/generate-roadmap', isAuth, generatePersonalRoadmap);
interviewRouter.put('/update-roadmap-step', isAuth, updateRoadmapStep);
interviewRouter.post('/add-roadmap-topic', isAuth, addRoadmapTopic);
interviewRouter.post('/reset-roadmap', isAuth, resetPersonalRoadmap);

interviewRouter.post('/generate-questions', isAuth, generateQuestions);
interviewRouter.post('/submit-answer', isAuth, submitAnswer);
interviewRouter.post('/finish', isAuth, finishInterview);

interviewRouter.get('/get-interview', isAuth, getMyInterviews);
interviewRouter.get('/report/:id', isAuth, getInterviewReport);

export default interviewRouter;
