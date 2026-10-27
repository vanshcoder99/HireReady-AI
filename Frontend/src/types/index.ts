export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  isVerified: boolean;
}

export interface VerificationDetails {
  phoneNumber?: string;
  dob?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  governmentIdUrl?: string;
  panCardUrl?: string;
  aadhaarUrl?: string;
  resumeUrl: string;
  resumeOriginalName: string;
  degreeUrl: string;
  degreeOriginalName: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  extractedResumeName?: string;
  extractedDegreeName?: string;
  extractedExperienceYears?: number;
  extractedSkills?: string[];
  nameMatchScore?: number;
  isNameMatched?: boolean;
  mismatchReason?: string;
  auditSummary?: string;
  auditedAt?: string | null;
}

export interface InterviewerProfile {
  title: string;
  company: string;
  yearsOfExperience: number;
  skills: string[];
  languages: string[];
  bio: string;
  rating: number;
  avatarUrl: string;
  isApproved: boolean;
  bankDetails: BankDetails;
  verificationDetails: VerificationDetails;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'learner' | 'interviewer' | 'admin';
  credits: number;
  interviewerTitle?: string;
  interviewerCompany?: string;
  yearsOfExperience?: number;
  skills?: string[];
  languages?: string[];
  bio?: string;
  rating?: number;
  avatarUrl?: string;
  isApproved?: boolean;
  bankAccountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  bankIsVerified?: boolean;
  resumeUrl?: string;
  resumeOriginalName?: string;
  degreeUrl?: string;
  degreeOriginalName?: string;
  verificationStatus?: string;
  extractedResumeName?: string;
  extractedDegreeName?: string;
  extractedExperienceYears?: number;
  extractedSkills?: string[];
  nameMatchScore?: number;
  isNameMatched?: boolean;
  mismatchReason?: string;
  auditSummary?: string;
  auditedAt?: string | null;
  savedResumeAnalysis?: any;
  savedRoadmap?: any;
  createdAt?: string;
  updatedAt?: string;
  interviewerProfile?: InterviewerProfile;
}

export interface Question {
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  score: number;
  confidence: number;
  communication: number;
  correctness: number;
  answer: string;
  feedback: string;
}

export interface Interview {
  id: string;
  userId: string;
  role: string;
  experience: string;
  mode: string;
  resumeText?: string;
  questions: Question[];
  finalScore: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSlot {
  id: string;
  interviewerId: string | User;
  interviewerName: string;
  company: string;
  role: string;
  experienceLevel: string;
  duration: string;
  date: string;
  time: string;
  price: number;
  availableSlots: number;
  requiredSkills: string[];
  description: string;
  status: string;
  createdAt?: string;
  interviewer?: Partial<User>;
}

export interface Booking {
  id: string;
  userId: string | User;
  mentorId: string | User;
  slotId?: string;
  date: string;
  timeSlot: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' | 'confirmed' | 'completed' | 'pending';
  roomId: string;
  notes?: string;
  overallRating?: number;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  finalScore?: number;
  interviewerFeedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  recommendation?: string;
  createdAt?: string;
  user?: Partial<User>;
  mentor?: Partial<User>;
  slot?: Partial<InterviewSlot>;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  originalName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  pageCount: number;
  extractedText: string;
  summary?: string;
  summaryAvailable?: boolean;
  flashcardsCount?: number;
  quizzesCount?: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id?: number | string;
  question: string;
  answer: string;
  difficulty?: string;
  category?: string;
}

export interface FlashcardSet {
  id: string;
  userId: string;
  documentId?: string | null;
  title: string;
  cards: Flashcard[];
  totalCards: number;
  masteredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correctAnswer?: number;
  correctIndex?: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  userId: string;
  documentId?: string | null;
  title: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  attemptsCount: number;
  lastAttemptScore: number;
  bestScore: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  isFromResume: boolean;
  isSkillGap: boolean;
  keyConcepts: string[];
  practicalProject: string;
  resourceLink: string;
}

export interface RoadmapPhase {
  id: string;
  phaseName: string;
  duration: string;
  description: string;
  topics: RoadmapTopic[];
}

export interface PersonalRoadmap {
  targetRole: string;
  experienceLevel: string;
  estimatedWeeks: number;
  readinessScore: number;
  matchedSkillsCount: number;
  skillGapCount: number;
  phases: RoadmapPhase[];
  updatedAt: string;
}

export interface DashboardSummary {
  success: boolean;
  stats: {
    aiInterviews: {
      total: number;
      completed: number;
      avgScore: number;
    };
    humanInterviews: {
      total: number;
      completed: number;
      avgScore: number;
      upcoming?: Booking | null;
    };
    quizzes: {
      total: number;
      completed: number;
      avgScore: number;
    };
    flashcards: {
      totalSets: number;
      totalCards: number;
      masteredCards: number;
      masteryPct: number;
    };
    documentsCount: number;
    resumeScore: number;
    hasResume: boolean;
    placementReadiness: number;
    credits: number;
  };
  recommendation: {
    title: string;
    description: string;
    actionLabel: string;
    actionPath: string;
    priority: string;
  };
  activities: Array<{
    id: string;
    type: string;
    text: string;
    detail: string;
    time: string;
    timestamp: number;
    iconType: string;
    color: string;
    actionPath: string;
  }>;
  recentDocuments: Document[];
  recentInterviews: Interview[];
  recentBookings: Booking[];
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

