import express from 'express';
import isAuth, { requireRole } from '../middlewares/isAuth';
import { upload } from '../middlewares/multer';
import {
  createInterviewSlot,
  getPublishedSlots,
  getInterviewerSlots,
  deleteInterviewSlot,
  createSlotBookingOrder,
  verifySlotBookingPayment,
  bookInterviewSlot,
  startLiveSession,
  endLiveSession,
  getInterviewerEarnings,
  updateBankDetails,
  verifyInterviewerCredentials,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  submitFeedback,
  getRoomMessages,
  getAiCoInterviewerAssist,
  generateFinalAiInterviewSummary,
  getInterviewerDashboard,
  getAiMatchSuggestions,
  getInterviewerBookings,
  getLearnerCompletedInterviews,
  getInterviewerProfile,
  getInterviewerWallet,
  requestWithdrawal,
} from '../controllers/humanInterview.controller';

const humanInterviewRouter = express.Router();

// Slot Management Routes
humanInterviewRouter.post('/slots/create', isAuth, requireRole('interviewer'), createInterviewSlot);
humanInterviewRouter.get('/slots/browse', isAuth, getPublishedSlots);
humanInterviewRouter.get('/slots/my-slots', isAuth, requireRole('interviewer'), getInterviewerSlots);
humanInterviewRouter.delete('/slots/:id', isAuth, requireRole('interviewer'), deleteInterviewSlot);

// Booking Routes (Learner)
humanInterviewRouter.post('/create-slot-order', isAuth, createSlotBookingOrder);
humanInterviewRouter.post('/verify-slot-booking', isAuth, verifySlotBookingPayment);
humanInterviewRouter.post('/slots/book', isAuth, bookInterviewSlot);
humanInterviewRouter.get('/list', isAuth, getUserBookings);
humanInterviewRouter.get('/completed', isAuth, getLearnerCompletedInterviews);
humanInterviewRouter.post('/cancel/:id', isAuth, cancelBooking);

// Live Session Lifecycle Endpoints (Interviewer)
humanInterviewRouter.post('/session/start/:id', isAuth, requireRole('interviewer'), startLiveSession);
humanInterviewRouter.post('/session/end/:id', isAuth, requireRole('interviewer'), endLiveSession);

// Feedback (Interviewer submits)
humanInterviewRouter.post('/feedback/:id', isAuth, requireRole('interviewer'), submitFeedback);

// Earnings, Wallet & KYC Routes (Interviewer)
humanInterviewRouter.get('/interviewer/earnings', isAuth, requireRole('interviewer'), getInterviewerEarnings);
humanInterviewRouter.get('/interviewer/wallet', isAuth, requireRole('interviewer'), getInterviewerWallet);
humanInterviewRouter.post('/interviewer/withdraw', isAuth, requireRole('interviewer'), requestWithdrawal);
humanInterviewRouter.post('/bank-details', isAuth, requireRole('interviewer'), updateBankDetails);
humanInterviewRouter.post(
  '/verify-credentials',
  isAuth,
  requireRole('interviewer'),
  upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'degree', maxCount: 1 }]),
  verifyInterviewerCredentials
);

// Interviewer Dashboard & Bookings
humanInterviewRouter.get('/interviewer/dashboard', isAuth, requireRole('interviewer'), getInterviewerDashboard);
humanInterviewRouter.get('/interviewer/bookings', isAuth, requireRole('interviewer'), getInterviewerBookings);
humanInterviewRouter.get('/interviewer/profile/:id', isAuth, getInterviewerProfile);

// Chat History
humanInterviewRouter.get('/messages/:roomId', isAuth, getRoomMessages);

// AI Co-Interviewer Routes
humanInterviewRouter.post('/ai-assist', isAuth, getAiCoInterviewerAssist);
humanInterviewRouter.post('/ai-summary', isAuth, generateFinalAiInterviewSummary);
humanInterviewRouter.post('/suggestions', isAuth, getAiMatchSuggestions);

// Booking Detail — MUST be last (catch-all :id pattern)
humanInterviewRouter.get('/booking/:id', isAuth, getBookingDetails);

export default humanInterviewRouter;
