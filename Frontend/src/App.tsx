import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserData } from './redux/userSlice';
import InterviewPage from './pages/InterviewPage';
import InterviewHistory from './pages/InterviewHistory';
import Pricing from './pages/Pricing';
import FeaturesPage from './pages/FeaturesPage';
import HowItWorksPage from './pages/HowItWorksPage';
import InterviewReport from './pages/InterviewReport';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Flashcards from './pages/Flashcards';
import Quizzes from './pages/Quizzes';
import ResumeAnalysis from './pages/ResumeAnalysis';
import HumanInterviews from './pages/HumanInterviews';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Roadmaps from './pages/Roadmaps';
import InterviewerDashboard from './pages/InterviewerDashboard';
import InterviewerProfile from './pages/InterviewerProfile';
import InterviewRoom from './pages/InterviewRoom';
import AppLayout from './components/layout/AppLayout';

export const ServerUrl = 'http://localhost:8000';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + '/api/user/current-user', {
          withCredentials: true,
        });
        const userObj = result.data.user || result.data;
        dispatch(setUserData(userObj));
      } catch (error) {
        console.error('Fetch current user error:', error);
        dispatch(setUserData(null));
      }
    };
    getUser();
  }, [dispatch]);

  return (
    <Routes>
      {/* Standalone & In-App Studio routes */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/interview/room/:id" element={<InterviewRoom />} />

      {/* Candidate App routes (with layout) */}
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />
      <Route
        path="/documents"
        element={
          <AppLayout>
            <Documents />
          </AppLayout>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <AppLayout>
            <DocumentDetail />
          </AppLayout>
        }
      />
      <Route
        path="/flashcards"
        element={
          <AppLayout>
            <Flashcards />
          </AppLayout>
        }
      />
      <Route
        path="/flashcards/:id"
        element={
          <AppLayout>
            <Flashcards />
          </AppLayout>
        }
      />
      <Route
        path="/quizzes"
        element={
          <AppLayout>
            <Quizzes />
          </AppLayout>
        }
      />
      <Route
        path="/quizzes/:id"
        element={
          <AppLayout>
            <Quizzes />
          </AppLayout>
        }
      />
      <Route
        path="/quizzes/:id/results"
        element={
          <AppLayout>
            <Quizzes />
          </AppLayout>
        }
      />
      <Route
        path="/resume"
        element={
          <AppLayout>
            <ResumeAnalysis />
          </AppLayout>
        }
      />
      <Route
        path="/human-interviews"
        element={
          <AppLayout>
            <HumanInterviews />
          </AppLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <AppLayout>
            <Profile />
          </AppLayout>
        }
      />
      <Route
        path="/analytics"
        element={
          <AppLayout>
            <Analytics />
          </AppLayout>
        }
      />
      <Route
        path="/roadmaps"
        element={
          <AppLayout>
            <Roadmaps />
          </AppLayout>
        }
      />
      <Route
        path="/history"
        element={
          <AppLayout>
            <InterviewHistory />
          </AppLayout>
        }
      />
      <Route
        path="/report/:id"
        element={
          <AppLayout>
            <InterviewReport />
          </AppLayout>
        }
      />

      {/* Interviewer Portal routes (with layout) */}
      <Route
        path="/interviewer/dashboard"
        element={
          <AppLayout>
            <InterviewerDashboard />
          </AppLayout>
        }
      />
      <Route
        path="/interviewer/interviews"
        element={
          <AppLayout>
            <InterviewerDashboard />
          </AppLayout>
        }
      />
      <Route
        path="/interviewer/profile"
        element={
          <AppLayout>
            <InterviewerProfile />
          </AppLayout>
        }
      />

      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  );
}

export default App;
