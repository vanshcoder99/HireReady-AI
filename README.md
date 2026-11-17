# 🎯 HireReady AI — End-to-End AI-Powered Interview Preparation & Mentorship Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.10-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Peer_to_Peer-333333?style=for-the-badge&logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

> **HireReady AI** is an intelligent, full-stack placement preparation ecosystem designed to help job candidates bridge the gap between preparation and real-world hiring standards. It combines **real-time AI voice/video mock interviews**, **live 1-on-1 human mock interviews with WebRTC and AI co-interviewing**, **ATS resume analysis**, **personalized skill-gap roadmaps**, and an **AI study hub with document chat, flashcards, and quizzes**.

---

## 📑 Table of Contents

- [Overview & Problem Solved](#-overview--problem-solved)
- [Key Features](#-key-features)
  - [1. Real-time AI Mock Interview Studio](#1-real-time-ai-mock-interview-studio)
  - [2. 1-on-1 Human Mock Interview Marketplace](#2-1-on-1-human-mock-interview-marketplace)
  - [3. Live WebRTC Interview Room with AI Co-Interviewer](#3-live-webrtc-interview-room-with-ai-co-interviewer)
  - [4. Smart ATS Resume Auditor & Skill Extractor](#4-smart-ats-resume-auditor--skill-extractor)
  - [5. Personalized AI Career Roadmaps](#5-personalized-ai-career-roadmaps)
  - [6. Intelligent Study & Document Hub](#6-intelligent-study--document-hub)
  - [7. Performance Analytics & Insights](#7-performance-analytics--insights)
  - [8. Credits, Payments & Interviewer Payouts](#8-credits-payments--interviewer-payouts)
  - [9. Blind 75 LeetCode Sheet with AI Hints & Dynamic Guidance](#9-blind-75-leetcode-sheet-with-ai-hints--dynamic-guidance)
  - [10. Legal, Privacy & Compliance Suite](#10-legal-privacy--compliance-suite)
  - [11. Dedicated Discovery & Showcase Pages](#11-dedicated-discovery--showcase-pages)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema (Prisma ORM)](#-database-schema-prisma-orm)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Configuration](#-environment-configuration)
- [API & WebSocket Reference](#-api--websocket-reference)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [Author & License](#-author--license)

---

## 🌟 Overview & Problem Solved

Traditional interview preparation is fragmented: candidates read static interview questions, guess how applicant tracking systems (ATS) view their resumes, and pay high fees for mock interviews without structured evaluation.

**HireReady AI solves this with a unified, data-driven platform:**

| Challenge | How HireReady AI Solves It |
|---|---|
| **Lack of realistic practice** | Realistic AI interviewer avatars with synchronized voice synthesis (TTS) and live speech recognition (STT). |
| **Vague or absent feedback** | Instant evaluation on three core pillars: **Confidence**, **Communication**, and **Correctness**, with a detailed scorecard. |
| **Disconnected resume review** | Full ATS scoring that highlights matched technical skills, missing competencies, and concrete line-by-line recommendations. |
| **Unfocused study paths** | Auto-generated 4-phase learning roadmaps derived directly from identified resume skill gaps. |
| **Expensive mentor interviews** | Two-sided marketplace with automated KYC credential auditing, transparent booking, low-latency WebRTC video rooms, and AI co-interviewer assist. |

---

## 🚀 Key Features

### 1. Real-time AI Mock Interview Studio
- **Realistic Video Avatars**: Select between dynamic male and female interviewer avatars.
- **Voice-to-Voice Interaction**:
  - **Speech Synthesis (TTS)**: Realistic speech output calibrated with natural pacing and live subtitles.
  - **Speech Recognition (STT)**: Direct microphone capture using the Web Speech API with real-time transcription.
- **Progressive Question Engine**: Questions adapt dynamically to the candidate's chosen role, seniority, and resume text (Difficulty progression: Easy $\rightarrow$ Medium $\rightarrow$ Hard).
- **Multi-Pillar Scoring**: Every submitted answer is evaluated by OpenRouter AI across:
  - 🗣️ **Communication**: Clarity, structure, and articulation.
  - 🧠 **Correctness**: Technical accuracy and depth of understanding.
  - ⚡ **Confidence**: Delivery, pace, and presentation.
- **Instant Detailed Report**: Question-by-question scoring, actionable feedback summaries, and downloadable PDF report cards using `jsPDF`.

---

### 2. 1-on-1 Human Mock Interview Marketplace
- **Dual-Role Ecosystem**: Seamlessly switch between **Learner** (candidate) and **Interviewer** (mentor).
- **Automated KYC & Credential Auditing**:
  - Interviewers upload degrees and resumes for automated verification.
  - Text extraction via `pdfjs-dist` cross-checks names against bank account details, calculating a name match score to prevent impersonation.
- **Dynamic Slot Publishing**: Interviewers configure their availability, target domain, seniority, duration, and price (e.g. ₹299 for a 45-minute technical round).
- **Razorpay Escrow Integration**: Transparent checkout for learners with automatic slot locking upon payment verification.

---

### 3. Live WebRTC Interview Room with AI Co-Interviewer
- **Peer-to-Peer Video & Audio**: Ultra-low latency conferencing powered by WebRTC with Google STUN servers and Socket.io signaling.
- **Interactive In-Room Tools**:
  - High-definition screen sharing for live coding and architectural walkthroughs.
  - Live in-room chat with full database persistence in PostgreSQL.
  - Media controls (camera toggle, microphone mute, screen share, full screen).
  - Network quality monitor and status indicators.
- **🤖 Live AI Co-Interviewer Assist**:
  - The interviewer can request live AI suggestions during the interview.
  - OpenRouter AI analyzes the candidate's target role and ongoing conversation to suggest sharp technical follow-up questions and probe potential weak spots.
- **Structured Evaluation Form**:
  - Post-session rating system (Technical Score, Communication Score, Problem Solving Score, Final Score).
  - Detailed qualitative feedback: Strengths, Weaknesses, Suggestions, and Final Hiring Recommendation.

---

### 4. Smart ATS Resume Auditor & Skill Extractor
- **Deep PDF Text Parsing**: Robust extraction of multi-page resumes using `pdfjs-dist`.
- **Comprehensive ATS Compatibility Score (0–100%)**:
  - Evaluates formatting, keyword density, and section completeness.
  - Section scores for Contact Information, Work Experience, Education, Skills, Projects, and Formatting.
- **Skill Gap Discovery**:
  - Highlights verified matched skills already present on the resume.
  - Discovers high-priority missing skills for target roles.
  - Highlights critical warnings (e.g., lack of quantifiable metrics, missing live links).
- **Persistent Profile Storage**: Resume analysis is stored in the database, allowing candidates to re-sync their progress anytime.

---

### 5. Personalized AI Career Roadmaps
- **Resume-Driven Roadmap Generation**: Automatically creates an 8-week, 4-phase personalized curriculum tailored to bridge identified skill gaps.
  - **Phase 1**: Resume Skill Gaps & Modern Core
  - **Phase 2**: Scalable Backend & System Architecture
  - **Phase 3**: Cloud Deployment & CI/CD Pipelines
  - **Phase 4**: High-Stakes Tech & Product Interview Prep
- **Interactive Progress Tracker**: Track topic statuses (`completed`, `in_progress`, `pending`).
- **Hands-On Mini Projects**: Every topic includes a practical real-world project, key conceptual takeaways, and links to official documentation.
- **Dynamic Readiness Score**: Real-time calculation that updates as topics are marked completed.
- **Pre-Built Engineering Paths**: Curated tracks for Frontend, Backend, Full-Stack, System Design, and DevOps.

---

### 6. Intelligent Study & Document Hub
- **Document Management**: Upload PDF study guides, technical notes, or cheat sheets.
- **Contextual Document AI Chat**: Interactive RAG-like Q&A session rooted strictly in the uploaded document's contents.
- **One-Click AI Study Actions**:
  - 📝 **Summary**: Executive summaries of key concepts.
  - 💡 **Explain**: Simplifies complex concepts with interview examples.
  - 🏷️ **Keywords**: Extracts high-frequency technical keywords and definitions.
  - 📌 **Revision Notes**: Bulleted formula sheets and placement tips.
  - 🗺️ **Mind Map**: Hierarchical topic outline for rapid revision.
- **AI Flashcards**: Generates high-yield study flashcards with difficulty ratings (`EASY`, `MEDIUM`, `HARD`) and spaced repetition tracking.
- **AI Practice Quizzes**: Generates 4-option multiple-choice quizzes with explanations and tracks attempt history and personal best scores.

---

### 7. Performance Analytics & Insights
- **Aggregated Readiness Dashboard**: Visualizes overall placement readiness, average AI interview score, completed human sessions, and study material mastery.
- **Interactive Data Charts**: Built using **Recharts** for visualizing score distributions and historical improvements over time.
- **Real-Time Push Notifications**: Socket.io emits live updates on slot bookings, session status, and profile score refreshes.

---

### 8. Credits, Payments & Interviewer Payouts
- **Freemium Credit Engine**:
  - New users receive **100 free credits** upon registration.
  - **AI Mock Interview**: Consumes **50 credits** per complete 5-question session with instant grading & scoring.
  - **Blind 75 Dynamic AI Guidance**: Consumes **50 credits** per deep-dive coaching query with step-by-step breakdown.
  - **Document AI Processing**: Consumes **20 credits** per PDF upload & AI text analysis.
  - **Custom AI Quiz Generation**: Consumes **20 credits** per 4-question interactive quiz.
- **Recharge Packs (Razorpay)**:
  - **Starter Pack**: ₹100 for 150 credits.
  - **Pro Pack**: ₹500 for 650 credits (Best Value).
  - Secure instant payment verification via Razorpay HMAC SHA256 signatures with live balance refresh.
- **Interviewer Financial Ecosystem**:
  - Transparent **80/20 revenue share** (80% net earnings credited to the interviewer, 20% platform commission).
  - **Wallet & Payout Dashboard**: Displays total earned, available balance, pending funds, and historical transactions.
  - **Withdrawal Requests**: Interviewers can request payouts directly to their verified Bank Account (via IFSC) or UPI ID.

---

### 9. Blind 75 LeetCode Sheet with AI Hints & Dynamic Guidance
- **Complete Canonical Blind 75 Collection**: All 75 canonical questions across 11 core patterns:
  - *Arrays & Hashing, Two Pointers, Sliding Window, Bit Manipulation, Dynamic Programming, Trees & Tries, Graphs, Intervals, Linked List, Matrix, and Heap & Priority Queue*.
- **Direct LeetCode External Problem Links**: Every question links directly to its official LeetCode problem URL (`target="_blank" rel="noopener noreferrer"`) for immediate browser-based solving.
- **Color-Coded Difficulty Badges**: Visual indicators for **Easy** (Emerald), **Medium** (Amber), and **Hard** (Rose).
- **Tick & Black/Dark Completion Toggle**: 
  - Interactive checkbox toggle that transforms between an empty border and a solid black/dark background with a prominent checkmark (`✓`) when marked solved.
  - Instant client-side persistence using `localStorage` (`blind75_completed_problems`), preserving problem completion state across browser refreshes and sessions.
  - Real-time progress bar displaying total solved count (e.g., `18 / 75 Solved - 24% Complete`).
- **Two-Stage Progressive AI Hints (Free)**:
  - **Hint 1 (Pattern & Intuition)**: Guides the student toward the foundational pattern without giving away code.
  - **Hint 2 (Algorithm & Complexity)**: Highlights data structures, handling edge cases, and achieving target time $O(N)$ and space $O(1)$ complexities.
- **Dynamic AI Mentor Guidance (50 Credits per Query)**:
  - Interactive, dynamic AI guidance drawer powered by authenticated backend endpoint `POST /api/ai/blind75-guidance`.
  - Candidates can submit specific doubts or request step-by-step intuition, code approach, dry runs, and edge-case handling.
  - Automatically validates balance, deducts **50 credits** upon submission, and updates the candidate's credit balance across the UI in real time.

---

### 10. Legal, Privacy & Compliance Suite
- **Complete In-App Legal Documentation**: Dedicated, professionally structured policy pages accessible at `/privacy` and `/terms`.
- **Privacy Policy (`/privacy` & `/privacy-policy`)**:
  - **11 Detailed Articles**: Transparently explains the collection, storage, and processing of speech audio, Web Speech STT transcripts, AI mock scores, resume PDF text, WebRTC video calling data, and Razorpay billing information.
  - **Zero Audio/Video Recording Storage**: Explicit policy confirming that live WebRTC video and microphone audio streams are strictly peer-to-peer and never stored or recorded on server disks.
  - **Resume Data Safeguards**: Outlines how uploaded resumes are parsed in-memory, analyzed for ATS metrics, and stored privately under the user's encrypted profile.
  - **User Data Rights**: Clear guidelines for requesting data export, profile deletion, or revoking OAuth permissions.
- **Terms of Service (`/terms` & `/terms-of-service`)**:
  - **11 Operational Sections**: Establishes binding agreements regarding account eligibility, student vs. interviewer roles, the 50-credit interview / hint usage rules, and non-refundable digital credits.
  - **Mentor KYC & Conduct Rules**: Strict guidelines prohibiting harassment, impersonation, recording of live sessions without consent, and enforcing bank account name matching.
  - **80/20 Payout Transparency**: Formalizes the 80% mentor revenue share and 20% platform maintenance fee.
  - **AI Scoring Disclaimers**: Affirms that AI ratings and ATS scores are educational recommendations and not guaranteed employment offers.
- **Interactive UI Architecture**: Sticky quick-jump section navigation, active link highlights, breadcrumb back navigation, and dark/light mode responsiveness.
- **Universal Linking**: Clickable links integrated into all primary and landing footers, authentication dialogs, and navigation drawers.

---

### 11. Dedicated Discovery & Showcase Pages
- **Interactive Features Hub (`/features`)**: Comprehensive breakdown of the 6 core pillars of HireReady AI (AI Mock Interviews, ATS Resume Scoring, WebRTC Human Mentorship, Dynamic Blind 75 Sheet, Document Study Hub, and Real-Time Analytics) with interactive feature cards and live demo CTAs.
- **How It Works Guide (`/how-it-works`)**: Step-by-step interactive workflow detailing the candidate journey from resume upload and skill gap analysis to AI mock rounds and 1-on-1 human mentorship sessions.
- **Transparent Pricing Page (`/pricing`)**: Detailed tier breakdown comparing Free Starter credits against Starter (₹100) and Pro (₹500) packs, complete with Razorpay checkout and FAQ accordion.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite + Tailwind v4)"]
        UI[User Interface & Pages]
        Redux[Redux Toolkit State]
        WebRTCClient[WebRTC PeerConnection & Media]
        STT_TTS[Web Speech API STT & TTS]
        SocketClient[Socket.io Client]
    end

    subgraph Server ["Backend (Node.js + Express 5 + TypeScript)"]
        Router[Express API Routers]
        AuthMW[JWT & Auth Middleware]
        SocketServer[Socket.io Signaling & Chat Server]
        UploadMW[Multer & PDF Parser]
        Services[Business Logic & Service Layer]
    end

    subgraph Data ["Persistence & External Services"]
        Prisma[Prisma ORM Client]
        Postgres[(PostgreSQL Database)]
        OpenRouter[OpenRouter AI Multi-Model Cascade]
        RazorpayAPI[Razorpay Payment Gateway]
        STUN[Google STUN WebRTC Servers]
    end

    UI --> Redux
    UI --> STT_TTS
    UI --> WebRTCClient
    UI --> SocketClient

    UI -->|REST API Requests| Router
    SocketClient <-->|Signaling & Real-time Events| SocketServer
    WebRTCClient <-->|STUN Traversal & P2P Stream| STUN

    Router --> AuthMW
    AuthMW --> Services
    UploadMW --> Services
    Services --> Prisma
    Prisma --> Postgres

    Services -->|Chat & Evaluations| OpenRouter
    Services -->|Orders & Verification| RazorpayAPI
```

### AI Interview Flow Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Candidate as Candidate
    participant Frontend as Frontend Studio
    participant Backend as Express Server
    participant AI as OpenRouter AI
    participant DB as PostgreSQL (Prisma)

    Candidate->>Frontend: Select Role, Experience, Mode & Optional Resume
    Frontend->>Backend: POST /api/interview/generate-questions
    Backend->>AI: Generate 5 Progressive Questions (JSON)
    AI-->>Backend: 5 Questions (Easy -> Hard)
    Backend->>DB: Create Interview Record (status: Incompleted)
    Backend-->>Frontend: Return Questions & Interview ID
    
    loop For each of the 5 questions
        Frontend->>Candidate: TTS Avatar Speaks Question + Subtitles
        Candidate->>Frontend: Speaks Answer via Web Speech STT
        Frontend->>Backend: POST /api/interview/submit-answer
        Backend->>AI: Evaluate Confidence, Communication & Correctness
        AI-->>Backend: Scores & Qualitative Feedback
        Backend->>DB: Save Question Score in JSON
        Backend-->>Frontend: Display Live Feedback
    end

    Frontend->>Backend: POST /api/interview/finish
    Backend->>DB: Compute Final Average & Mark Completed
    Backend-->>Frontend: Return Comprehensive Scorecard
    Candidate->>Frontend: Download Official PDF Report (jsPDF)
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + `@tailwindcss/vite`
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + `react-redux`
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Charts & Data Viz**: [Recharts](https://recharts.org/) + `react-circular-progressbar`
- **Real-Time & WebRTC**: `socket.io-client` + Native WebRTC API
- **Document Generation**: `jspdf` + `jspdf-autotable`
- **Icons**: `react-icons`
- **Authentication**: Firebase Authentication + Custom JWT Cookie Support

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express 5](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Runner**: `tsx` (development watch) & `esbuild` (production bundling)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg`
- **Real-Time Communication**: [Socket.io 4.8](https://socket.io/) (WebRTC signaling, chat, and room notifications)
- **AI Orchestration**: [OpenRouter API](https://openrouter.ai/) with multi-model cascade:
  - `openai/gpt-4o-mini`
  - `google/gemini-2.0-flash-lite-preview-02-05:free`
  - `meta-llama/llama-3.3-70b-instruct:free`
  - `deepseek/deepseek-r1:free`
  - `mistralai/mistral-7b-instruct:free`
  - Built-in deterministic local fallback failsafe
- **Payments**: [Razorpay SDK](https://razorpay.com/)
- **File & PDF Processing**: `multer` + `pdfjs-dist` (legacy build for server compatibility)
- **Security & Auth**: `jsonwebtoken` + `cookie-parser` + `cors`

---

## 📁 Project Directory Structure

```text
AI_POWERED_INTERVIEW_PREP_WEBSITE/
├── Backend/
│   ├── config/
│   │   ├── connectDb.ts            # PostgreSQL connection & Prisma client instance
│   │   └── token.ts                # JWT token signing & verification utilities
│   ├── controllers/
│   │   ├── ai.controller.ts        # AI chat, summaries, flashcards, quizzes & concepts
│   │   ├── auth.controller.ts      # Authentication, Google OAuth & logout
│   │   ├── document.controller.ts  # Document upload, PDF text extraction & study actions
│   │   ├── humanInterview.controller.ts # 1-on-1 slots, WebRTC booking, KYC & payouts
│   │   ├── interview.controller.ts # AI interview, ATS resume scoring & roadmaps
│   │   ├── payment.controller.ts   # Razorpay orders & webhook signature verification
│   │   └── user.controller.ts      # User profile, role switching & dashboard analytics
│   ├── middlewares/
│   │   ├── isAuth.ts               # JWT authentication & role-based access control
│   │   └── multer.ts               # File upload handler for resumes & documents
│   ├── prisma/
│   │   └── schema.prisma           # Complete PostgreSQL data models
│   ├── routes/
│   │   ├── ai.route.ts             # AI study tools endpoints
│   │   ├── auth.route.ts           # Authentication endpoints
│   │   ├── document.route.ts       # Document hub endpoints
│   │   ├── humanInterview.route.ts # Mentorship, slots & WebRTC session endpoints
│   │   ├── interview.route.ts      # AI interview session & roadmap endpoints
│   │   ├── payment.route.ts        # Credit purchase endpoints
│   │   ├── resume.route.ts         # Dedicated ATS resume analysis routes
│   │   └── user.route.ts           # User profile & metrics endpoints
│   ├── services/
│   │   ├── openRouter.service.ts   # Multi-model AI cascading engine with failsafe
│   │   └── razorpay.service.ts     # Razorpay instance setup
│   ├── index.ts                    # Server bootstrap, Express setup & Socket.io WebRTC
│   ├── package.json
│   └── tsconfig.json
│
└── Frontend/
    ├── public/                     # Static assets & avatar videos (male-ai, female-ai)
    ├── src/
    │   ├── assets/                 # SVGs, icons, illustrations & badges
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── AppLayout.tsx   # Dashboard layout wrapper with sidebar & navbar
    │   │   │   └── Sidebar.tsx     # Navigation sidebar for Learner and Interviewer
    │   │   ├── dashboard/          # Metrics cards, activity feeds & score widgets
    │   │   ├── document/           # Document tabs (Chat, Flashcards, Quizzes, Actions)
    │   │   ├── landing/            # Landing page hero, features, how-it-works & testimonials
    │   │   ├── quiz/               # Quiz question cards, timers & score reviews
    │   │   ├── Step1SetUp.tsx      # AI Interview setup modal (role, experience, mode)
    │   │   ├── Step2Interview.tsx  # Live AI Interview room with avatar & speech STT/TTS
    │   │   ├── Step3Report.tsx     # Performance report card with PDF export
    │   │   ├── Navbar.tsx          # Main application navigation bar
    │   │   └── Footer.tsx          # Application footer
    │   ├── pages/
    │   │   ├── Analytics.tsx       # Comprehensive visual analytics with Recharts
    │   │   ├── Auth.tsx            # Login, registration & Google OAuth modal
    │   │   ├── Blind75.tsx         # Blind 75 LeetCode sheet with hints & AI guidance
    │   │   ├── Dashboard.tsx       # Main user command center
    │   │   ├── Documents.tsx       # Document repository & upload manager
    │   │   ├── DocumentDetail.tsx  # Document view with interactive AI study tools
    │   │   ├── FeaturesPage.tsx    # Standalone Features showcase page
    │   │   ├── Flashcards.tsx      # Flashcard study deck with mastery tracking
    │   │   ├── Home.tsx            # Landing page
    │   │   ├── HowItWorksPage.tsx  # Standalone How It Works workflow guide
    │   │   ├── HumanInterviews.tsx # 1-on-1 slot explorer & booking manager
    │   │   ├── InterviewerCreateSlots.tsx # Slot creation & publishing interface
    │   │   ├── InterviewerDashboard.tsx   # Mentor analytics, bookings & wallet payouts
    │   │   ├── InterviewerProfile.tsx     # KYC upload, degree verification & bank details
    │   │   ├── InterviewHistory.tsx       # Past AI interview sessions
    │   │   ├── InterviewPage.tsx          # AI Interview launchpad
    │   │   ├── InterviewReport.tsx        # Detailed standalone interview report
    │   │   ├── InterviewRoom.tsx          # Real-time WebRTC live video interview room
    │   │   ├── Pricing.tsx                # Credit tiers & Razorpay checkout
    │   │   ├── PrivacyPolicy.tsx          # Comprehensive 11-section Privacy Policy
    │   │   ├── Profile.tsx                # Candidate profile & role switcher
    │   │   ├── Quizzes.tsx                # Skill assessments & quiz player
    │   │   ├── ResumeAnalysis.tsx         # ATS score gauge, skill match & recommendations
    │   │   ├── Roadmaps.tsx               # Personalized 4-phase learning roadmaps
    │   │   └── TermsOfService.tsx         # Comprehensive 11-section Terms of Service
    │   ├── redux/
    │   │   ├── store.ts            # Redux store configuration
    │   │   └── userSlice.ts        # User authentication & profile slice
    │   ├── types/
    │   │   └── index.ts            # Shared TypeScript type definitions
    │   ├── App.tsx                 # Route declarations & current user initializer
    │   ├── main.tsx                # Entry point
    │   └── index.css               # Tailwind CSS v4 styling
    ├── package.json
    ├── vite.config.ts
    └── tsconfig.json
```

---

## 🗄️ Database Schema (Prisma ORM)

The application uses **PostgreSQL** configured via **Prisma ORM**. Key models include:

| Model | Purpose |
|---|---|
| `User` | Stores profile, role (`learner` \| `interviewer`), credit balance, saved resume analysis, personalized roadmap, interviewer credentials, and KYC verification status. |
| `Booking` | Represents a 1-on-1 human interview booking between a Learner and an Interviewer, including scores, notes, and qualitative feedback. |
| `InterviewSlot` | Availability published by an interviewer with date, time, price, duration, and required skills. |
| `InterviewRoom` | Live WebRTC session instance linking a booking, learner, and interviewer, tracking status, AI notes, and summaries. |
| `InterviewMessage` | Real-time chat messages exchanged inside an interview room, persisted in PostgreSQL. |
| `Interview` | AI mock interview session tracking role, mode, 5 generated questions, answers, and scores. |
| `Document` | Uploaded study document (PDF) with extracted text, summary, category, and metadata. |
| `DocumentSession` | Chat history between the user and an uploaded study document. |
| `FlashcardSet` | Collection of AI-generated flashcards with mastery indicators (`reviewedCount`, `masteredCount`). |
| `Quiz` | Practice assessments with questions, options, explanations, and historical attempt scores. |
| `Payment` | Razorpay transaction records tracking credit purchases and payment statuses. |
| `InterviewerWallet` | Holds interviewer earnings, pending balances, total withdrawn, and links to transactions. |
| `WalletTransaction` | Ledger of credits and debits for an interviewer's wallet. |
| `WithdrawalRequest` | Payout requests submitted by an interviewer for bank or UPI transfer. |

---

## ⚙️ Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or via a cloud instance like Neon / Supabase)
- [Git](https://git-scm.com/)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/vanshcoder99/HireReady-AI.git
cd HireReady-AI
```

---

### Step 2: Backend Setup

1. **Navigate to the Backend folder:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=8000
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/hireready?schema=public"
   JWT_SECRET="your_super_secret_jwt_key_here"
   OPENROUTER_API_KEY="your_openrouter_api_key_here"
   RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_secret"
   ```

4. **Run Prisma Migrations & Generate Client:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Backend Server:**
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:8000` with WebSockets active on the same port.*

---

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to the Frontend folder:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_BACKEND_URL="http://localhost:8000"
   VITE_RAZORPAY_KEY_ID="rzp_test_your_key_id"
   VITE_FIREBASE_APIKEY="your_firebase_api_key"
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 🔐 Environment Configuration

### Backend (`Backend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port for Express & Socket.io server | `8000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/hireready` |
| `JWT_SECRET` | Secret key used to sign and verify JWT auth cookies | `supersecretkey123` |
| `OPENROUTER_API_KEY` | API key from OpenRouter.ai for AI generation | `sk-or-v1-...` *(Has local fallback if empty)* |
| `RAZORPAY_KEY_ID` | Razorpay Key ID for payments and slot bookings | `rzp_test_xxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret for HMAC verification | `xxxxxxxxxxxxxxxx` |

### Frontend (`Frontend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `VITE_BACKEND_URL` | Base URL pointing to the running backend | `http://localhost:8000` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key ID for client-side checkout modal | `rzp_test_xxxxxx` |
| `VITE_FIREBASE_APIKEY` | Firebase API Key for client authentication | `AIzaSy...` |

---

## 📡 API & WebSocket Reference

### Authentication & User (`/api/auth`, `/api/user`)
- `POST /api/auth/google` — Sign in or register via Google credential token.
- `GET  /api/auth/logout` — Clear auth cookie and terminate session.
- `GET  /api/user/current-user` — Retrieve currently logged-in user and role profile.
- `GET  /api/user/dashboard-summary` — Aggregated metrics (interviews, scores, readiness, quizzes).
- `POST /api/user/role` — Switch between `learner` and `interviewer` modes.
- `POST /api/user/interviewer-profile` — Update interviewer bio, skills, company, and title.

### AI Mock Interview & Roadmaps (`/api/interview`, `/api/resume`)
- `POST /api/interview/generate-questions` — Deduct credits and generate 5 progressive interview questions.
- `POST /api/interview/submit-answer` — Evaluate question answer (Confidence, Communication, Correctness).
- `POST /api/interview/finish` — Finalize interview, calculate overall scores, and trigger dashboard sync.
- `GET  /api/interview/get-interview` — Fetch list of user's past AI interviews.
- `GET  /api/interview/report/:id` — Fetch question-level score breakdown for an interview session.
- `POST /api/interview/full-resume-analysis` — Upload resume PDF for ATS scoring and skill analysis.
- `GET  /api/interview/saved-resume-analysis` — Fetch saved resume analysis from user profile.
- `GET  /api/interview/personal-roadmap` — Fetch personalized 4-phase learning roadmap.
- `POST /api/interview/generate-roadmap` — Generate/re-generate personalized roadmap based on resume gaps.
- `PUT  /api/interview/update-roadmap-step` — Update status of a roadmap topic (`completed`, `in_progress`).

### 1-on-1 Human Interviews (`/api/human-interview`)
- `POST /api/human-interview/slots/create` — Publish a new interview slot (Interviewer only, KYC required).
- `GET  /api/human-interview/slots/browse` — Browse upcoming available slots across all interviewers.
- `GET  /api/human-interview/slots/my-slots` — Fetch slots published by the authenticated interviewer.
- `DELETE /api/human-interview/slots/:id` — Delete an unpublished or unfilled slot.
- `POST /api/human-interview/create-slot-order` — Create Razorpay order to book an interview slot.
- `POST /api/human-interview/verify-slot-booking` — Verify payment signature and finalize slot booking.
- `POST /api/human-interview/session/start/:id` — Mark live interview as started.
- `POST /api/human-interview/session/end/:id` — Mark live interview ended and trigger wallet credit (80%).
- `POST /api/human-interview/feedback/:id` — Submit structured feedback and scoring for candidate.
- `POST /api/human-interview/verify-credentials` — Upload resume & degree for automated KYC verification.
- `GET  /api/human-interview/interviewer/wallet` — Fetch wallet balance, pending earnings, and transactions.
- `POST /api/human-interview/interviewer/withdraw` — Request bank or UPI payout.
- `POST /api/human-interview/ai-assist` — Request real-time contextual AI follow-up questions during live call.

### Smart Documents, Flashcards, Quizzes & Blind 75 AI (`/api/document`, `/api/ai`)
- `POST /api/document/upload` — Upload PDF study document and extract text.
- `GET  /api/document/list` — List all uploaded documents for the user.
- `POST /api/document/:id/chat` — Contextual AI chat query against the document.
- `POST /api/document/:id/action` — Perform one-click AI action (`summary`, `explain`, `keywords`, `notes`, `mindmap`).
- `POST /api/document/:id/flashcards` — Generate study flashcards from document content.
- `POST /api/document/:id/quiz` — Generate 4-question placement quiz from document content.
- `GET  /api/ai/flashcards` — Fetch all saved flashcard sets.
- `DELETE /api/ai/flashcards/:id` — Delete a flashcard set.
- `GET  /api/ai/quizzes` — Fetch all saved placement quizzes and past scores.
- `DELETE /api/ai/quizzes/:id` — Delete a saved quiz.
- `POST /api/ai/quizzes/:id/submit` — Submit quiz attempt and compute scored results.
- `POST /api/ai/blind75-guidance` — Deduct **50 credits** and generate dynamic AI problem breakdown, pattern hints, edge cases, and code intuition for any Blind 75 LeetCode problem.

### Payments (`/api/payment`)
- `POST /api/payment/create-order` — Create Razorpay order for Starter (₹100) or Pro (₹500) credit packs.
- `POST /api/payment/verify-payment` — Verify Razorpay signature and credit user account.

---

### Socket.IO Real-Time & WebRTC Events

| Event Name | Direction | Payload / Purpose |
|---|---|---|
| `join-room` | Client $\rightarrow$ Server | Joins an interview room by `roomId`, notifies other peers. |
| `user-connected` | Server $\rightarrow$ Client | Broadcasts when a new peer joins the room. |
| `offer` | Bidirectional | WebRTC SDP offer sent to peer through signaling. |
| `answer` | Bidirectional | WebRTC SDP answer returned by peer. |
| `ice-candidate` | Bidirectional | WebRTC ICE candidate exchanged between peers. |
| `camera-toggle` | Bidirectional | Syncs camera state across participants. |
| `mic-toggle` | Bidirectional | Syncs microphone mute/unmute state across participants. |
| `screen-share-start` | Bidirectional | Notifies room that a participant started screen sharing. |
| `screen-share-stop` | Bidirectional | Notifies room that screen sharing stopped. |
| `message` | Bidirectional | Live chat message persisted in PostgreSQL and broadcast to room. |
| `interview-start` | Server $\rightarrow$ Client | Signals that the interviewer has started the session. |
| `interview-end` | Server $\rightarrow$ Client | Signals that the session has concluded. |
| `dashboard-update` | Server $\rightarrow$ Client | Targeted push notification instructing client to re-fetch metrics. |

---

## 🗺️ Future Roadmap

- [ ] **Collaborative Code Editor**: Embedded Monaco Code Editor with live multi-user cursor sync and code execution via Judge0.
- [ ] **Visual Emotion & Posture Analysis**: Client-side TensorFlow.js model to assess eye contact, facial expressions, and posture during AI mock rounds.
- [ ] **Company-Specific Question Packs**: Curated interview simulations targeting specific FAANG/MAANG and high-growth startup rubrics.
- [ ] **Mobile App**: Native Android and iOS companion apps built using React Native.
- [ ] **Community Practice Hub**: Peer-to-peer free mock interview matching with mutual scoring.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create! Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. **Create your Feature Branch:**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes:**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the Branch:**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

---

## 👨‍💻 Author & Acknowledgements

**Developed by Vansh Nagpal**
- **GitHub**: [@vanshcoder99](https://github.com/vanshcoder99)
- **LinkedIn**: [Vansh Nagpal](https://www.linkedin.com/in/vansh-nagpal-424a28338)
- **X (Twitter)**: [@VanshNagpa81393](https://x.com/VanshNagpa81393)
- **Project Repository**: [https://github.com/vanshcoder99/HireReady-AI](https://github.com/vanshcoder99/HireReady-AI)

Special thanks to the open-source community behind React, Vite, Express, Prisma, Tailwind CSS, and OpenRouter for empowering modern full-stack development.

---

## 📄 License

This project is licensed under the **ISC License**. Feel free to use, modify, and distribute this software for educational and personal projects.

