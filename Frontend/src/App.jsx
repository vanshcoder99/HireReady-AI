import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice.js'
import InterviewPage from './pages/InterviewPage.jsx'
import InterviewHistory from './pages/InterviewHistory.jsx'
import Pricing from './pages/Pricing.jsx'
import FeaturesPage from './pages/FeaturesPage.jsx'
import HowItWorksPage from './pages/HowItWorksPage.jsx'
import InterviewReport from './pages/InterviewReport.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Documents from './pages/Documents.jsx'
import DocumentDetail from './pages/DocumentDetail.jsx'
import Flashcards from './pages/Flashcards.jsx'
import Quizzes from './pages/Quizzes.jsx'
import ResumeAnalysis from './pages/ResumeAnalysis.jsx'
import HumanInterviews from './pages/HumanInterviews.jsx'
import Profile from './pages/Profile.jsx'
import Analytics from './pages/Analytics.jsx'
import Roadmaps from './pages/Roadmaps.jsx'
import InterviewerDashboard from './pages/InterviewerDashboard.jsx'
import InterviewerProfile from './pages/InterviewerProfile.jsx'
import InterviewRoom from './pages/InterviewRoom.jsx'
import AppLayout from './components/layout/AppLayout.jsx'

export const ServerUrl = "http://localhost:8000"

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user",{
          withCredentials: true
        })
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
    getUser()
  },[dispatch])

  return (
    <Routes>
      {/* Standalone & In-App Studio routes */}
      <Route path='/' element={<Home/>} />
      <Route path='/auth' element={<Auth/>} />
      <Route path='/features' element={<FeaturesPage/>} />
      <Route path='/how-it-works' element={<HowItWorksPage/>} />
      <Route path='/interview' element={<InterviewPage/>} />
      <Route path='/interview/room/:id' element={<InterviewRoom/>} />

      {/* Candidate App routes (with layout) */}
      <Route path='/dashboard' element={<AppLayout><Dashboard/></AppLayout>} />
      <Route path='/documents' element={<AppLayout><Documents/></AppLayout>} />
      <Route path='/documents/:id' element={<AppLayout><DocumentDetail/></AppLayout>} />
      <Route path='/flashcards' element={<AppLayout><Flashcards/></AppLayout>} />
      <Route path='/flashcards/:id' element={<AppLayout><Flashcards/></AppLayout>} />
      <Route path='/quizzes' element={<AppLayout><Quizzes/></AppLayout>} />
      <Route path='/quizzes/:id' element={<AppLayout><Quizzes/></AppLayout>} />
      <Route path='/quizzes/:id/results' element={<AppLayout><Quizzes/></AppLayout>} />
      <Route path='/resume' element={<AppLayout><ResumeAnalysis/></AppLayout>} />
      <Route path='/human-interviews' element={<AppLayout><HumanInterviews/></AppLayout>} />
      <Route path='/profile' element={<AppLayout><Profile/></AppLayout>} />
      <Route path='/analytics' element={<AppLayout><Analytics/></AppLayout>} />
      <Route path='/roadmaps' element={<AppLayout><Roadmaps/></AppLayout>} />
      <Route path='/history' element={<AppLayout><InterviewHistory/></AppLayout>} />
      <Route path='/report/:id' element={<AppLayout><InterviewReport/></AppLayout>} />

      {/* Interviewer Portal routes (with layout) */}
      <Route path='/interviewer/dashboard' element={<AppLayout><InterviewerDashboard/></AppLayout>} />
      <Route path='/interviewer/interviews' element={<AppLayout><InterviewerDashboard/></AppLayout>} />
      <Route path='/interviewer/profile' element={<AppLayout><InterviewerProfile/></AppLayout>} />

      <Route path='/pricing' element={<Pricing/>} />
    </Routes>
  )
}

export default App
