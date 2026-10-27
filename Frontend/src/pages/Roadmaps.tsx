import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BsMap, 
  BsCheckCircleFill, 
  BsCircle,
  BsPlayCircle,
  BsLockFill,
  BsCodeSlash,
  BsServer,
  BsCpu,
  BsBriefcase,
  BsDiagram3,
  BsChevronDown,
  BsChevronUp,
  BsStars,
  BsArrowRepeat,
  BsFileEarmarkText,
  BsPlusLg,
  BsBook,
  BsCheckLg,
  BsUpload,
  BsX,
  BsLightningChargeFill,
  BsRocketTakeoffFill,
  BsBoxSeam,
  BsArrowRight
} from 'react-icons/bs'
import { ServerUrl } from '../App'

// Curated Preset Roadmaps for General Exploration
const curatedRoadmaps = [
  {
    id: 'frontend',
    title: 'Frontend Engineering Path',
    desc: 'Master modern frontend development from HTML5/CSS3 to React 19, TypeScript, & State Architecture.',
    icon: <BsCodeSlash size={22} />,
    color: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    progressColor: 'bg-blue-500',
    progress: 65,
    steps: [
      { title: 'HTML5 Semantic Elements & Accessibility (a11y)', status: 'completed' },
      { title: 'CSS Layouts: Flexbox, CSS Grid & Responsive Design', status: 'completed' },
      { title: 'Modern JavaScript ES6+, Async/Await & Closures', status: 'completed' },
      { title: 'DOM Events & Client-Side Storage Patterns', status: 'completed' },
      { title: 'React.js Core: Components, Custom Hooks & State', status: 'in_progress' },
      { title: 'State Management: Redux Toolkit & Context API', status: 'in_progress' },
      { title: 'TypeScript Integration in Next.js/React', status: 'locked' },
      { title: 'Testing Frameworks: Jest, React Testing Library & Cypress', status: 'locked' },
      { title: 'Frontend Performance & Bundle Optimization', status: 'locked' },
      { title: 'CI/CD & Vercel / Netlify Edge Deployments', status: 'locked' },
    ]
  },
  {
    id: 'backend',
    title: 'Backend & Systems Path',
    desc: 'Build scalable APIs, microservices, databases, caching layers, and containerized backends.',
    icon: <BsServer size={22} />,
    color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    progressColor: 'bg-emerald-500',
    progress: 40,
    steps: [
      { title: 'Node.js Event Loop & Non-Blocking I/O Architecture', status: 'completed' },
      { title: 'RESTful API Design & Express.js Middleware Patterns', status: 'completed' },
      { title: 'Relational & Document Databases (PostgreSQL / MongoDB)', status: 'completed' },
      { title: 'Authentication: OAuth2, JWT Refresh Tokens & Sessions', status: 'in_progress' },
      { title: 'Data Modeling, Indexing & Query Optimization', status: 'locked' },
      { title: 'Caching Strategies with Redis & In-Memory Stores', status: 'locked' },
      { title: 'Docker Containerization & Multi-Stage Builds', status: 'locked' },
      { title: 'Message Queues: RabbitMQ & Apache Kafka', status: 'locked' },
      { title: 'System Security, Rate Limiting & OWASP Mitigation', status: 'locked' },
      { title: 'AWS/GCP Infrastructure & Kubernetes Orchestration', status: 'locked' },
    ]
  },
  {
    id: 'ai',
    title: 'AI & Machine Learning Track',
    desc: 'Fundamentals of AI models, Deep Learning, Data Science, Prompt Engineering & LLM APIs.',
    icon: <BsCpu size={22} />,
    color: 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    progressColor: 'bg-purple-500',
    progress: 25,
    steps: [
      { title: 'Python Programming Essentials & Data Structures', status: 'completed' },
      { title: 'NumPy, Pandas & Exploratory Data Analysis (EDA)', status: 'completed' },
      { title: 'Linear Algebra, Calculus & Statistics for AI', status: 'in_progress' },
      { title: 'Supervised ML: Regression, Decision Trees & SVMs', status: 'locked' },
      { title: 'Unsupervised ML: Dimensionality Reduction & Clustering', status: 'locked' },
      { title: 'Deep Learning Basics: PyTorch & Neural Networks', status: 'locked' },
      { title: 'Natural Language Processing (NLP) & Transformers', status: 'locked' },
      { title: 'LLM Fine-Tuning, RAG Architecture & Vector DBs', status: 'locked' },
      { title: 'Model Deployment via FastAPI & Cloud Inference', status: 'locked' },
    ]
  },
  {
    id: 'placement',
    title: 'Placement & Behavioral Prep',
    desc: 'End-to-end job placement readiness: ATS resume tailoring, aptitude, & HR interview mastery.',
    icon: <BsBriefcase size={22} />,
    color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    progressColor: 'bg-amber-500',
    progress: 50,
    steps: [
      { title: 'ATS Resume Building & Technical Keyword Auditing', status: 'completed' },
      { title: 'Aptitude, Logical Reasoning & Verbal Speed Tests', status: 'completed' },
      { title: 'Technical Interview Foundations & Core CS Theory', status: 'completed' },
      { title: 'Behavioral Prep with STAR Technique Framework', status: 'completed' },
      { title: 'Mock AI Voice & Video Interview Rounds', status: 'in_progress' },
      { title: 'System Design Interview Fundamentals', status: 'locked' },
      { title: 'Live Coding Interview Strategy & Debugging Under Pressure', status: 'locked' },
      { title: 'Offer Evaluation & Salary Negotiation Strategies', status: 'locked' },
    ]
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    desc: 'Master problem solving, time complexity analysis, and coding interview algorithm patterns.',
    icon: <BsDiagram3 size={22} />,
    color: 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    progressColor: 'bg-rose-500',
    progress: 35,
    steps: [
      { title: 'Arrays, Strings & Hash Maps (Two Pointer / Sliding Window)', status: 'completed' },
      { title: 'Stacks, Queues & Priority Queues', status: 'completed' },
      { title: 'Linked Lists (Singly, Doubly, Reversal & Fast/Slow)', status: 'completed' },
      { title: 'Binary Trees, BST Operations & Tree Traversals', status: 'in_progress' },
      { title: 'Recursion, Backtracking & Constraint Satisfaction', status: 'locked' },
      { title: 'Graph Algorithms: BFS, DFS, Dijkstra & Topological Sort', status: 'locked' },
      { title: 'Dynamic Programming: Memoization & Tabulation Patterns', status: 'locked' },
      { title: 'Tries, Disjoint Set Union (DSU) & Segment Trees', status: 'locked' },
    ]
  }
]

// Preset Role Recommendations for AI Roadmap Generation
const PRESET_ROLES = [
  'Full-Stack Web Engineer',
  'Frontend React Developer',
  'Backend Node.js Engineer',
  'DevOps & Cloud Engineer',
  'AI / Machine Learning Engineer',
  'Data Scientist & Analytics',
  'Mobile App Developer (React Native / Flutter)',
  'Cybersecurity Analyst'
]

function Roadmaps() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('personal') // 'personal' | 'curated'
  
  // Personal AI Roadmap State
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [personalData, setPersonalData] = useState(null)
  const [resumeData, setResumeData] = useState(null)
  const [expandedTopicId, setExpandedTopicId] = useState(null)
  
  // Curated Roadmaps State
  const [curatedExpandedId, setCuratedExpandedId] = useState(null)

  // Modals
  const [showRegenModal, setShowRegenModal] = useState(false)
  const [customRoleInput, setCustomRoleInput] = useState('')
  const [customFocusInput, setCustomFocusInput] = useState('')
  
  const [showAddTopicModal, setShowAddTopicModal] = useState(false)
  const [selectedPhaseId, setSelectedPhaseId] = useState('')
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicDesc, setNewTopicDesc] = useState('')
  const [newTopicConcepts, setNewTopicConcepts] = useState('')
  const [newTopicProject, setNewTopicProject] = useState('')
  const [addingTopic, setAddingTopic] = useState(false)

  // Fetch Personal Roadmap on Mount
  useEffect(() => {
    fetchPersonalRoadmap()
  }, [])

  const fetchPersonalRoadmap = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${ServerUrl}/api/interview/personal-roadmap`, { withCredentials: true })
      if (res.data?.hasRoadmap && res.data?.roadmap) {
        setPersonalData(res.data.roadmap)
      } else {
        setPersonalData(null)
      }

      if (res.data?.resume) {
        setResumeData(res.data.resume)
        if (!customRoleInput) {
          setCustomRoleInput(res.data.resume.extractedRole || '')
        }
      }
    } catch (error) {
      console.error('Fetch personal roadmap error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate or Regenerate Personalized AI Roadmap
  const handleGenerateRoadmap = async (e) => {
    if (e) e.preventDefault()
    try {
      setGenerating(true)
      const payload = {
        targetRole: customRoleInput.trim() || resumeData?.extractedRole || 'Full-Stack Software Engineer',
        customFocusAreas: customFocusInput.trim()
      }
      const res = await axios.post(`${ServerUrl}/api/interview/generate-roadmap`, payload, { withCredentials: true })
      if (res.data?.roadmap) {
        setPersonalData(res.data.roadmap)
        setShowRegenModal(false)
        setCustomFocusInput('')
      }
    } catch (error) {
      console.error('Generate roadmap error:', error)
      alert(error.response?.data?.message || 'Failed to generate AI roadmap.')
    } finally {
      setGenerating(false)
    }
  }

  // Real-Time Update Step Status (Completed / In Progress / Pending)
  const handleToggleStepStatus = async (topicId, currentStatus) => {
    const statusCycle = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending'
    }
    const nextStatus = statusCycle[currentStatus] || 'in_progress'

    // Optimistic UI update
    setPersonalData(prev => {
      if (!prev) return prev
      const updatedPhases = prev.phases.map(phase => ({
        ...phase,
        topics: phase.topics.map(topic => 
          topic.id === topicId ? { ...topic, status: nextStatus } : topic
        )
      }))

      // Recalculate local readiness score
      let total = 0
      let points = 0
      updatedPhases.forEach(p => {
        p.topics.forEach(t => {
          total++
          if (t.status === 'completed') points += 100
          else if (t.status === 'in_progress') points += 45
        })
      })
      const newScore = total > 0 ? Math.min(98, Math.max(30, Math.round(points / total))) : prev.readinessScore

      return {
        ...prev,
        readinessScore: newScore,
        phases: updatedPhases
      }
    })

    try {
      const res = await axios.put(
        `${ServerUrl}/api/interview/update-roadmap-step`,
        { topicId, newStatus: nextStatus },
        { withCredentials: true }
      )
      if (res.data?.roadmap) {
        setPersonalData(res.data.roadmap)
      }
    } catch (error) {
      console.error('Update step error:', error)
      fetchPersonalRoadmap() // Revert to backend state on error
    }
  }

  // Add Custom Topic to Phase
  const handleAddTopicSubmit = async (e) => {
    e.preventDefault()
    if (!selectedPhaseId || !newTopicTitle.trim()) return

    try {
      setAddingTopic(true)
      const payload = {
        phaseId: selectedPhaseId,
        title: newTopicTitle.trim(),
        description: newTopicDesc.trim(),
        keyConcepts: newTopicConcepts ? newTopicConcepts.split(',').map(s => s.trim()) : [],
        practicalProject: newTopicProject.trim()
      }
      const res = await axios.post(`${ServerUrl}/api/interview/add-roadmap-topic`, payload, { withCredentials: true })
      if (res.data?.roadmap) {
        setPersonalData(res.data.roadmap)
        setShowAddTopicModal(false)
        setNewTopicTitle('')
        setNewTopicDesc('')
        setNewTopicConcepts('')
        setNewTopicProject('')
      }
    } catch (error) {
      console.error('Add topic error:', error)
      alert(error.response?.data?.message || 'Failed to add topic.')
    } finally {
      setAddingTopic(false)
    }
  }

  // Helper calculations for personal roadmap progress
  const getPersonalRoadmapStats = () => {
    if (!personalData?.phases) return { completed: 0, total: 0, percentage: 0 }
    let completed = 0
    let total = 0
    personalData.phases.forEach(phase => {
      phase.topics?.forEach(topic => {
        total++
        if (topic.status === 'completed') completed++
      })
    })
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, percentage }
  }

  const stats = getPersonalRoadmapStats()

  return (
    <div className='py-2 space-y-8 max-w-7xl mx-auto'>
      {/* Top Header & Tab Switcher */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-gray-800 pb-6'>
        <div>
          <div className='flex items-center gap-2.5 mb-1'>
            <div className='w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs'>
              <BsMap size={18} />
            </div>
            <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
              Learning Roadmaps
            </h1>
          </div>
          <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1'>
            Real-time personalized learning paths created from your resume analysis, detected skills, and target role goals.
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className='flex items-center p-1.5 bg-gray-100 dark:bg-gray-800/90 rounded-2xl border border-gray-200/70 dark:border-gray-700/70 shrink-0 self-start lg:self-center'>
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BsStars size={14} className='text-emerald-500' />
            <span>Personal AI Resume Roadmap</span>
          </button>
          <button
            onClick={() => setActiveTab('curated')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'curated'
                ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <BsBook size={14} />
            <span>Explore Popular Roadmaps</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PERSONAL AI RESUME ROADMAP */}
      {activeTab === 'personal' && (
        <div className='space-y-8'>
          {loading ? (
            <div className='py-24 text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2'>
              <BsArrowRepeat size={24} className='animate-spin text-emerald-600' />
              <span className='font-medium text-sm'>Loading your personalized AI learning roadmap...</span>
            </div>
          ) : !personalData ? (
            /* EMPTY STATE: Generate Personal Roadmap */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-8 md:p-14 text-center space-y-6 shadow-xs'
            >
              <div className='w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs'>
                <BsRocketTakeoffFill size={36} />
              </div>

              <div className='max-w-lg mx-auto space-y-2'>
                <h3 className='text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
                  Generate Your Tailored AI Learning Path
                </h3>
                <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed'>
                  We turn your extracted resume skills and identified skill gaps into a structured, step-by-step milestone roadmap to achieve your target job role.
                </p>
              </div>

              {resumeData ? (
                <div className='bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-4 rounded-2xl max-w-md mx-auto text-left flex items-start gap-3'>
                  <BsFileEarmarkText className='text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5' size={20} />
                  <div>
                    <p className='text-xs font-bold text-emerald-950 dark:text-emerald-200'>
                      Resume Detected: {resumeData.fileName || 'Uploaded PDF'}
                    </p>
                    <p className='text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5'>
                      Detected Role: <strong>{resumeData.extractedRole}</strong> • {resumeData.matchedSkills?.length || 0} Matched Skills • {resumeData.recommendedSkills?.length || 0} Skill Gaps
                    </p>
                  </div>
                </div>
              ) : (
                <div className='bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 p-4 rounded-2xl max-w-md mx-auto text-left flex items-start gap-3'>
                  <BsLightningChargeFill className='text-amber-600 dark:text-amber-400 shrink-0 mt-0.5' size={18} />
                  <div>
                    <p className='text-xs font-bold text-amber-950 dark:text-amber-200'>
                      No Resume Uploaded Yet
                    </p>
                    <p className='text-[11px] text-amber-800 dark:text-amber-300 mt-0.5'>
                      Upload your PDF resume on the <Link to='/resume' className='underline font-bold hover:text-amber-600'>Resume Analyzer Page</Link> for automatic skill extraction, or generate directly below by typing your target role.
                    </p>
                  </div>
                </div>
              )}

              <div className='max-w-md mx-auto space-y-4 pt-2'>
                <div>
                  <label className='block text-left text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                    Target Career Role / Skill Goal
                  </label>
                  <input
                    type='text'
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder='e.g., Senior Full-Stack Engineer, DevOps Specialist'
                    className='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-xs md:text-sm focus:outline-none focus:border-emerald-500 font-medium'
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerateRoadmap}
                  disabled={generating}
                  className='w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-2xl text-sm cursor-pointer transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2'
                >
                  {generating ? (
                    <>
                      <BsArrowRepeat size={18} className='animate-spin' />
                      <span>Synthesizing AI Roadmap...</span>
                    </>
                  ) : (
                    <>
                      <BsStars size={16} />
                      <span>Generate Personalized AI Roadmap</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ACTIVE PERSONALIZED ROADMAP DASHBOARD */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className='space-y-8'
            >
              {/* Context Banner */}
              {resumeData ? (
                <div className='bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200/80 dark:border-emerald-800/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs'>
                  <div className='flex items-center gap-3.5'>
                    <div className='w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20'>
                      <BsFileEarmarkText size={22} />
                    </div>
                    <div>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className='text-xs font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full'>
                          Resume Synced
                        </span>
                        <h3 className='font-bold text-gray-900 dark:text-white text-sm sm:text-base'>
                          {personalData.targetRole}
                        </h3>
                      </div>
                      <p className='text-xs text-gray-600 dark:text-gray-400 mt-1'>
                        Tailored for <strong className='text-gray-800 dark:text-gray-200'>{resumeData.fileName || 'Your Resume'}</strong> • {personalData.matchedSkillsCount || 0} Matched Skills • {personalData.skillGapCount || 0} Skill Gaps Identified
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2 shrink-0 self-end sm:self-center'>
                    <Link
                      to='/resume'
                      className='bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5'
                    >
                      <BsUpload size={12} />
                      <span>Update Resume</span>
                    </Link>
                    <button
                      onClick={() => {
                        setCustomRoleInput(personalData.targetRole || '')
                        setShowRegenModal(true)
                      }}
                      className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer'
                    >
                      <BsStars size={13} />
                      <span>Adjust AI Goal</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className='bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-3xl p-5 flex items-center justify-between gap-4 text-xs font-medium text-amber-900 dark:text-amber-200'>
                  <div className='flex items-center gap-3'>
                    <BsLightningChargeFill className='text-amber-500 shrink-0' size={20} />
                    <span>Upload a resume to automatically align roadmap milestones with your verified project & work history.</span>
                  </div>
                  <Link to='/resume' className='bg-amber-600 text-white font-bold px-3.5 py-1.5 rounded-xl shrink-0 hover:bg-amber-700 transition'>
                    Upload PDF
                  </Link>
                </div>
              )}

              {/* Metrics Summary Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                {/* 1. Readiness Score */}
                <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 flex items-center gap-4 shadow-xs transition-colors'>
                  <div className='relative w-16 h-16 shrink-0 flex items-center justify-center'>
                    <svg className='w-full h-full transform -rotate-90' viewBox='0 0 100 100'>
                      <circle cx='50' cy='50' r='40' stroke='currentColor' strokeWidth='8' className='text-gray-100 dark:text-gray-800' fill='transparent' />
                      <circle
                        cx='50'
                        cy='50'
                        r='40'
                        stroke='currentColor'
                        strokeWidth='8'
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * (personalData.readinessScore || 65)) / 100}
                        strokeLinecap='round'
                        className='text-emerald-500'
                        fill='transparent'
                      />
                    </svg>
                    <span className='absolute text-sm font-extrabold text-gray-900 dark:text-white'>
                      {personalData.readinessScore || 65}%
                    </span>
                  </div>
                  <div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Career Readiness</p>
                    <p className='text-sm font-extrabold text-gray-900 dark:text-white mt-0.5'>
                      {personalData.readinessScore >= 80 ? 'Job Interview Ready' : 'In Active Preparation'}
                    </p>
                  </div>
                </div>

                {/* 2. Completion Progress */}
                <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs transition-colors'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Topics Completed</p>
                    <span className='text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80'>
                      {stats.percentage}% Done
                    </span>
                  </div>
                  <div className='my-2'>
                    <span className='text-2xl font-extrabold text-gray-900 dark:text-white'>
                      {stats.completed} <span className='text-xs text-gray-400 font-normal'>/ {stats.total} Topics</span>
                    </span>
                  </div>
                  <div className='w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-emerald-500 rounded-full transition-all duration-500'
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                </div>

                {/* 3. Skill Origin Breakdown */}
                <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 flex flex-col justify-between shadow-xs transition-colors'>
                  <p className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2'>Skill Origin Audit</p>
                  <div className='flex items-center justify-between text-xs font-semibold space-x-2'>
                    <div className='flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 w-1/2 justify-center'>
                      <BsCheckLg size={12} />
                      <span>{personalData.matchedSkillsCount || 0} In Resume</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-200/80 dark:border-amber-800/60 w-1/2 justify-center'>
                      <BsLightningChargeFill size={12} />
                      <span>{personalData.skillGapCount || 0} Gaps</span>
                    </div>
                  </div>
                </div>

                {/* 4. Estimated Timeframe */}
                <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 flex items-center justify-between shadow-xs transition-colors'>
                  <div>
                    <p className='text-xs font-bold text-gray-400 uppercase tracking-wider'>Estimated Timeline</p>
                    <p className='text-2xl font-extrabold text-gray-900 dark:text-white mt-1'>
                      {personalData.estimatedWeeks || 8} <span className='text-xs text-gray-400 font-normal'>Weeks</span>
                    </p>
                    <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>Target: {personalData.targetRole}</p>
                  </div>
                  <div className='w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/80 dark:border-indigo-800/80 shrink-0'>
                    <BsBoxSeam size={22} />
                  </div>
                </div>
              </div>

              {/* REAL-TIME PHASED ROADMAP TIMELINE */}
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='text-xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
                      Milestone Learning Path
                    </h2>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                      Click topic status badges to toggle progress (Completed / In Progress / Pending) in real-time.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (personalData.phases?.[0]) {
                        setSelectedPhaseId(personalData.phases[0].id)
                      }
                      setShowAddTopicModal(true)
                    }}
                    className='bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs'
                  >
                    <BsPlusLg size={13} className='text-emerald-500' />
                    <span>Add Custom Skill</span>
                  </button>
                </div>

                <div className='space-y-8 relative'>
                  {personalData.phases?.map((phase, pIdx) => (
                    <motion.div
                      key={phase.id || pIdx}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: pIdx * 0.08 }}
                      className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors'
                    >
                      {/* Top Phase Header Accent */}
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-5 mb-6'>
                        <div className='flex items-center gap-3'>
                          <span className='w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm'>
                            {pIdx + 1}
                          </span>
                          <div>
                            <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                              {phase.phaseName}
                            </h3>
                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                              {phase.description}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center gap-3 self-start sm:self-center shrink-0'>
                          <span className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700'>
                            ⏱️ {phase.duration}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedPhaseId(phase.id)
                              setShowAddTopicModal(true)
                            }}
                            className='text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer'
                          >
                            <BsPlusLg size={11} />
                            <span>Add Topic</span>
                          </button>
                        </div>
                      </div>

                      {/* Phase Topics List */}
                      <div className='space-y-4 relative'>
                        {/* Connecting Line */}
                        <div className='absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-800 hidden sm:block' />

                        {phase.topics?.map((topic, tIdx) => {
                          const isExpanded = expandedTopicId === topic.id
                          return (
                            <div
                              key={topic.id || tIdx}
                              className='relative sm:pl-10 space-y-3'
                            >
                              {/* Step Timeline Indicator Node */}
                              <div className='absolute left-[11px] top-4 z-10 hidden sm:flex items-center justify-center w-4 h-4 rounded-full bg-white dark:bg-gray-900'>
                                {topic.status === 'completed' ? (
                                  <BsCheckCircleFill size={16} className='text-emerald-500' />
                                ) : topic.status === 'in_progress' ? (
                                  <BsPlayCircle size={16} className='text-amber-500' />
                                ) : (
                                  <BsCircle size={14} className='text-gray-300 dark:text-gray-600' />
                                )}
                              </div>

                              {/* Card Body */}
                              <div className={`border rounded-2xl p-4 sm:p-5 transition-all duration-300 ${
                                topic.status === 'completed'
                                  ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60'
                                  : topic.status === 'in_progress'
                                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60'
                                    : 'bg-gray-50/50 dark:bg-gray-800/40 border-gray-200/80 dark:border-gray-700/80'
                              }`}>
                                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                                  <div className='space-y-1.5 flex-1'>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                      <h4 className='font-bold text-gray-900 dark:text-white text-base'>
                                        {topic.title}
                                      </h4>

                                      {/* Skill Origin Badge */}
                                      {topic.isFromResume ? (
                                        <span className='bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1'>
                                          <BsCheckLg size={10} /> Verified In Resume
                                        </span>
                                      ) : topic.isSkillGap ? (
                                        <span className='bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-amber-200 dark:border-amber-800 flex items-center gap-1'>
                                          <BsLightningChargeFill size={10} /> Skill Gap to Learn
                                        </span>
                                      ) : (
                                        <span className='bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-purple-200 dark:border-purple-800'>
                                          Custom Skill
                                        </span>
                                      )}
                                    </div>

                                    <p className='text-xs text-gray-600 dark:text-gray-400 font-normal leading-relaxed'>
                                      {topic.description}
                                    </p>
                                  </div>

                                  {/* Right Action Controls */}
                                  <div className='flex items-center gap-3 shrink-0 self-start sm:self-center'>
                                    {/* Real-Time Interactive Status Toggle Button */}
                                    <button
                                      onClick={() => handleToggleStepStatus(topic.id, topic.status)}
                                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                                        topic.status === 'completed'
                                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                          : topic.status === 'in_progress'
                                            ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      {topic.status === 'completed' ? (
                                        <>
                                          <BsCheckLg size={12} />
                                          <span>Completed</span>
                                        </>
                                      ) : topic.status === 'in_progress' ? (
                                        <>
                                          <BsPlayCircle size={12} />
                                          <span>In Progress</span>
                                        </>
                                      ) : (
                                        <>
                                          <BsCircle size={12} />
                                          <span>Mark Active</span>
                                        </>
                                      )}
                                    </button>

                                    {/* Expand Button */}
                                    <button
                                      onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                                      className='p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition'
                                    >
                                      {isExpanded ? <BsChevronUp size={16} /> : <BsChevronDown size={16} />}
                                    </button>
                                  </div>
                                </div>

                                {/* Expandable Topic Details */}
                                <AnimatePresence>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className='pt-4 mt-4 border-t border-gray-200/80 dark:border-gray-700/80 space-y-4 text-xs'
                                    >
                                      {/* Key Concepts */}
                                      {topic.keyConcepts?.length > 0 && (
                                        <div>
                                          <p className='font-bold text-gray-800 dark:text-gray-200 mb-2 uppercase tracking-wider text-[11px]'>
                                            Key Concepts & Sub-topics:
                                          </p>
                                          <div className='flex flex-wrap gap-2'>
                                            {topic.keyConcepts.map((concept, cIdx) => (
                                              <span
                                                key={cIdx}
                                                className='bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 font-medium'
                                              >
                                                • {concept}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Practical Project Recommendation */}
                                      {topic.practicalProject && (
                                        <div className='bg-white dark:bg-gray-800/90 p-3.5 rounded-xl border border-gray-200/80 dark:border-gray-700/80 space-y-1'>
                                          <p className='font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5'>
                                            <BsCodeSlash size={14} />
                                            <span>Recommended Hands-on Project:</span>
                                          </p>
                                          <p className='text-gray-700 dark:text-gray-300 leading-relaxed font-medium'>
                                            {topic.practicalProject}
                                          </p>
                                        </div>
                                      )}

                                      {/* Resource Link & Practice Action */}
                                      <div className='flex items-center justify-between gap-4 pt-1'>
                                        {topic.resourceLink && (
                                          <a
                                            href={topic.resourceLink}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1'
                                          >
                                            <span>Read Documentation & Guides</span>
                                            <BsArrowRight size={12} />
                                          </a>
                                        )}

                                        <button
                                          onClick={() => navigate('/interview')}
                                          className='bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 cursor-pointer transition'
                                        >
                                          Practice Interview Questions on this Topic →
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* TAB 2: EXPLORE POPULAR ROADMAPS */}
      {activeTab === 'curated' && (
        <div className='space-y-6'>
          <div>
            <h2 className='text-xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
              Curated Industry Tech Roadmaps
            </h2>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              Explore standardized, comprehensive learning paths for major developer roles and placement interview tracks.
            </p>
          </div>

          <div className='space-y-5'>
            {curatedRoadmaps.map((roadmap, i) => {
              const isExpanded = curatedExpandedId === roadmap.id
              const completedSteps = roadmap.steps.filter(s => s.status === 'completed').length
              const inProgressSteps = roadmap.steps.filter(s => s.status === 'in_progress').length

              return (
                <motion.div
                  key={roadmap.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl shadow-xs overflow-hidden transition-colors'
                >
                  <button
                    onClick={() => setCuratedExpandedId(isExpanded ? null : roadmap.id)}
                    className='w-full text-left p-6 sm:p-8 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors'
                  >
                    <div className='flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row'>
                      <div className='flex items-center gap-4'>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${roadmap.color} flex-shrink-0`}>
                          {roadmap.icon}
                        </div>
                        <div>
                          <h3 className='font-bold text-gray-900 dark:text-white text-lg'>{roadmap.title}</h3>
                          <p className='text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5'>{roadmap.desc}</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 shrink-0'>
                        <div className='text-right hidden sm:block'>
                          <p className='text-xs text-gray-400 font-medium'>Progress</p>
                          <p className='text-lg font-extrabold text-gray-900 dark:text-white'>{roadmap.progress}%</p>
                        </div>

                        <div className='flex items-center gap-2 text-xs text-gray-400'>
                          <span className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/80'>
                            {completedSteps} Done
                          </span>
                          {inProgressSteps > 0 && (
                            <span className='bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/80'>
                              {inProgressSteps} Active
                            </span>
                          )}
                        </div>

                        {isExpanded ? <BsChevronUp size={18} className='text-gray-400' /> : <BsChevronDown size={18} className='text-gray-400' />}
                      </div>
                    </div>

                    <div className='mt-5 w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden'>
                      <div className={`h-full rounded-full ${roadmap.progressColor}`} style={{ width: `${roadmap.progress}%` }} />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className='border-t border-gray-100 dark:border-gray-800 px-6 sm:px-8 py-6 bg-gray-50/30 dark:bg-gray-900/50'>
                      <div className='space-y-2.5 relative'>
                        <div className='absolute left-[15px] top-3 bottom-3 w-px bg-gray-200 dark:bg-gray-800' />
                        {roadmap.steps.map((step, si) => (
                          <div key={si} className='flex items-center gap-4 relative z-10'>
                            <div className='flex-shrink-0'>
                              {step.status === 'completed' ? (
                                <BsCheckCircleFill size={18} className='text-emerald-500' />
                              ) : step.status === 'in_progress' ? (
                                <BsPlayCircle size={18} className='text-amber-500' />
                              ) : (
                                <BsLockFill size={16} className='text-gray-300 dark:text-gray-600' />
                              )}
                            </div>
                            <div className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-medium transition-colors ${
                              step.status === 'completed'
                                ? 'text-gray-700 dark:text-gray-300 bg-emerald-50/50 dark:bg-emerald-950/40'
                                : step.status === 'in_progress'
                                  ? 'text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/40 font-semibold'
                                  : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {step.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: AI REGENERATE / TARGET ROLE CUSTOMIZER */}
      {showRegenModal && (
        <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative'
          >
            <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4'>
              <div className='flex items-center gap-2'>
                <BsStars className='text-emerald-500' size={20} />
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Adjust AI Roadmap Target</h3>
              </div>
              <button
                onClick={() => setShowRegenModal(false)}
                className='text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer'
              >
                <BsX size={24} />
              </button>
            </div>

            <div className='space-y-4 text-xs sm:text-sm'>
              <div>
                <label className='block font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                  Target Job Role / Specialization
                </label>
                <input
                  type='text'
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder='e.g., Senior React Engineer'
                  className='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium'
                />
              </div>

              <div>
                <label className='block font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                  Quick Select Common Tech Roles:
                </label>
                <div className='flex flex-wrap gap-1.5'>
                  {PRESET_ROLES.map((role, idx) => (
                    <button
                      key={idx}
                      type='button'
                      onClick={() => setCustomRoleInput(role)}
                      className='bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-300 text-xs px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 font-medium transition cursor-pointer'
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                  Specific Focus Areas / Skill Gaps to Prioritize (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customFocusInput}
                  onChange={(e) => setCustomFocusInput(e.target.value)}
                  placeholder='e.g., Focus on GraphQL, Redis Caching, and AWS Deployment Pipelines'
                  className='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium'
                />
              </div>
            </div>

            <div className='flex items-center justify-end gap-3 pt-2'>
              <button
                type='button'
                onClick={() => setShowRegenModal(false)}
                className='px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleGenerateRoadmap}
                disabled={generating}
                className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
              >
                {generating ? (
                  <>
                    <BsArrowRepeat size={16} className='animate-spin' />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <BsStars size={14} />
                    <span>Generate AI Roadmap</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: ADD CUSTOM TOPIC */}
      {showAddTopicModal && (
        <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative'
          >
            <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4'>
              <div className='flex items-center gap-2'>
                <BsPlusLg className='text-emerald-500' size={18} />
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Add Custom Skill Topic</h3>
              </div>
              <button
                onClick={() => setShowAddTopicModal(false)}
                className='text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer'
              >
                <BsX size={24} />
              </button>
            </div>

            <form onSubmit={handleAddTopicSubmit} className='space-y-4 text-xs sm:text-sm'>
              <div>
                <label className='block font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                  Select Phase Milestone
                </label>
                <select
                  value={selectedPhaseId}
                  onChange={(e) => setSelectedPhaseId(e.target.value)}
                  className='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium'
                >
                  {personalData?.phases?.map(p => (
                    <option key={p.id} value={p.id}>{p.phaseName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                  Topic Title *
                </label>
                <input
                  type='text'
                  required
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder='e.g., GraphQL API Design & Schema Stitching'
                  className='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium'
                />
              </div>

              <div>
                <label className='block font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                  Short Description
                </label>
                <input
                  type='text'
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  placeholder='Brief summary of what will be learned...'
                  className='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium'
                />
              </div>

              <div>
                <label className='block font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                  Key Concepts (Comma Separated)
                </label>
                <input
                  type='text'
                  value={newTopicConcepts}
                  onChange={(e) => setNewTopicConcepts(e.target.value)}
                  placeholder='Queries & Mutations, Resolvers, Apollo Server'
                  className='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium'
                />
              </div>

              <div>
                <label className='block font-bold text-gray-700 dark:text-gray-300 mb-1.5'>
                  Recommended Project Idea
                </label>
                <input
                  type='text'
                  value={newTopicProject}
                  onChange={(e) => setNewTopicProject(e.target.value)}
                  placeholder='e.g., Build a GraphQL proxy server over REST endpoints'
                  className='w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium'
                />
              </div>

              <div className='flex items-center justify-end gap-3 pt-3'>
                <button
                  type='button'
                  onClick={() => setShowAddTopicModal(false)}
                  className='px-5 py-2.5 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={addingTopic}
                  className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold px-6 py-2.5 rounded-2xl text-xs sm:text-sm cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
                >
                  {addingTopic ? (
                    <>
                      <BsArrowRepeat size={16} className='animate-spin' />
                      <span>Adding Topic...</span>
                    </>
                  ) : (
                    <>
                      <BsPlusLg size={14} />
                      <span>Save Topic</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Roadmaps
