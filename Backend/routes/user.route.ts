import express from 'express';
import isAuth from '../middlewares/isAuth';
import {
  getCurrentUser,
  getDashboardSummary,
  switchUserRole,
  updateInterviewerProfile,
  getUserProfile,
} from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.get('/current-user', isAuth, getCurrentUser);
userRouter.get('/dashboard-summary', isAuth, getDashboardSummary);
userRouter.get('/profile', isAuth, getUserProfile);
userRouter.post('/role', isAuth, switchUserRole);
userRouter.post('/interviewer-profile', isAuth, updateInterviewerProfile);

export default userRouter;

