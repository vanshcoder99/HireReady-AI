import React, { useState } from 'react'
import { motion } from 'motion/react'
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
  BsChevronUp
} from 'react-icons/bs'

const roadmaps = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    desc: 'Master modern frontend technologies from HTML/CSS to React.js.',
    icon: <BsCodeSlash size={22} />,
    color: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
    progressColor: 'bg-blue-500',
    progress: 65,
    steps: [
      { title: 'HTML5 & Semantic Markup', status: 'completed' },
      { title: 'CSS3, Flexbox & Grid', status: 'completed' },
      { title: 'JavaScript ES6+ Fundamentals', status: 'completed' },
      { title: 'DOM Manipulation & Events', status: 'completed' },
      { title: 'React.js Core (Components, Hooks, State)', status: 'in_progress' },
      { title: 'React Router & Navigation', status: 'in_progress' },
      { title: 'State Management (Redux Toolkit / Context)', status: 'locked' },
      { title: 'Testing (Jest, React Testing Library)', status: 'locked' },
      { title: 'Performance Optimization & Lazy Loading', status: 'locked' },
      { title: 'TypeScript Integration', status: 'locked' },
    ]
  },
  {
    id: 'backend',
    title: 'Backend Development',
    desc: 'Build scalable server-side applications with Node.js & databases.',
    icon: <BsServer size={22} />,
    color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    progressColor: 'bg-emerald-500',
    progress: 40,
    steps: [
      { title: 'Node.js Runtime & Event Loop', status: 'completed' },
      { title: 'Express.js RESTful API Design', status: 'completed' },
      { title: 'MongoDB & Mongoose ODM', status: 'completed' },
      { title: 'Authentication (JWT, bcrypt, Sessions)', status: 'in_progress' },
      { title: 'Error Handling & Middleware Patterns', status: 'locked' },
      { title: 'File Upload & Cloud Storage (S3)', status: 'locked' },
      { title: 'Rate Limiting & Security Headers', status: 'locked' },
      { title: 'Redis Caching & Message Queues', status: 'locked' },
      { title: 'Microservices Architecture', status: 'locked' },
      { title: 'Docker & CI/CD Deployment', status: 'locked' },
    ]
  },
  {
    id: 'ai',
    title: 'AI & Machine Learning',
    desc: 'Fundamentals of AI, ML algorithms, and practical applications.',
    icon: <BsCpu size={22} />,
    color: 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
    progressColor: 'bg-purple-500',
    progress: 20,
    steps: [
      { title: 'Python Programming Essentials', status: 'completed' },
      { title: 'NumPy, Pandas & Data Wrangling', status: 'completed' },
      { title: 'Statistics & Probability for ML', status: 'in_progress' },
      { title: 'Supervised Learning (Regression, Classification)', status: 'locked' },
      { title: 'Unsupervised Learning (Clustering, PCA)', status: 'locked' },
      { title: 'Neural Networks & Deep Learning Basics', status: 'locked' },
      { title: 'NLP Fundamentals & Transformers', status: 'locked' },
      { title: 'Computer Vision Basics', status: 'locked' },
      { title: 'Model Deployment & APIs (Flask / FastAPI)', status: 'locked' },
      { title: 'Prompt Engineering & LLM Applications', status: 'locked' },
    ]
  },
  {
    id: 'placement',
    title: 'Placement Preparation',
    desc: 'End-to-end placement readiness including aptitude and HR rounds.',
    icon: <BsBriefcase size={22} />,
    color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    progressColor: 'bg-amber-500',
    progress: 50,
    steps: [
      { title: 'Resume Building & ATS Optimization', status: 'completed' },
      { title: 'Aptitude & Logical Reasoning', status: 'completed' },
      { title: 'Verbal Ability & Communication', status: 'completed' },
      { title: 'Technical Interview Fundamentals', status: 'completed' },
      { title: 'Behavioral & HR Interview Prep (STAR Method)', status: 'completed' },
      { title: 'Group Discussion Strategies', status: 'in_progress' },
      { title: 'System Design Interview Basics', status: 'locked' },
      { title: 'Salary Negotiation & Offer Evaluation', status: 'locked' },
      { title: 'Mock Interview Practice (10+ rounds)', status: 'locked' },
      { title: 'Company-Specific Prep (MAANG, Product, Startup)', status: 'locked' },
    ]
  },
  {
    id: 'dsa',
    title: 'DSA & Problem Solving',
    desc: 'Data Structures and Algorithms for competitive coding & interviews.',
    icon: <BsDiagram3 size={22} />,
    color: 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    progressColor: 'bg-rose-500',
    progress: 35,
    steps: [
      { title: 'Arrays, Strings & Hashing', status: 'completed' },
      { title: 'Linked Lists (Singly, Doubly, Circular)', status: 'completed' },
      { title: 'Stacks & Queues', status: 'completed' },
      { title: 'Binary Trees & BST', status: 'in_progress' },
      { title: 'Recursion & Backtracking', status: 'locked' },
      { title: 'Graphs (BFS, DFS, Shortest Path)', status: 'locked' },
      { title: 'Dynamic Programming (Memoization & Tabulation)', status: 'locked' },
      { title: 'Greedy Algorithms', status: 'locked' },
      { title: 'Sliding Window & Two Pointer', status: 'locked' },
    ]
  }
]

function Roadmaps() {
  const [expandedId, setExpandedId] = useState(null)

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className='py-2 space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
          Learning Roadmaps
        </h1>
        <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
          Structured learning paths with step-by-step progress tracking.
        </p>
      </div>

      {/* Roadmap Cards */}
      <div className='space-y-5'>
        {roadmaps.map((roadmap, i) => {
          const isExpanded = expandedId === roadmap.id
          const completedSteps = roadmap.steps.filter(s => s.status === 'completed').length
          const inProgressSteps = roadmap.steps.filter(s => s.status === 'in_progress').length

          return (
            <motion.div
              key={roadmap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl shadow-xs overflow-hidden transition-colors duration-300'
            >
              {/* Roadmap Header (Click to Expand) */}
              <button
                onClick={() => toggleExpand(roadmap.id)}
                className='w-full text-left p-6 sm:p-8 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors'
              >
                <div className='flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row'>
                  <div className='flex items-center gap-4'>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${roadmap.color} flex-shrink-0`}>
                      {roadmap.icon}
                    </div>
                    <div>
                      <h3 className='font-bold text-gray-900 dark:text-white text-lg'>{roadmap.title}</h3>
                      <p className='text-gray-500 dark:text-gray-400 text-sm mt-0.5'>{roadmap.desc}</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-4 flex-shrink-0'>
                    {/* Progress Stats */}
                    <div className='text-right hidden sm:block'>
                      <p className='text-xs text-gray-400 dark:text-gray-400 font-medium'>Progress</p>
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

                {/* Progress Bar */}
                <div className='mt-5 w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${roadmap.progress}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                    className={`h-full rounded-full ${roadmap.progressColor}`}
                  />
                </div>
              </button>

              {/* Expandable Steps List */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='border-t border-gray-100 dark:border-gray-800 px-6 sm:px-8 py-6'
                >
                  <div className='space-y-2.5 relative'>
                    {/* Vertical Timeline Line */}
                    <div className='absolute left-[15px] top-3 bottom-3 w-px bg-gray-200 dark:bg-gray-800' />

                    {roadmap.steps.map((step, si) => (
                      <div key={si} className='flex items-center gap-4 relative'>
                        {/* Step Icon */}
                        <div className='relative z-10 flex-shrink-0'>
                          {step.status === 'completed' ? (
                            <BsCheckCircleFill size={18} className='text-emerald-500' />
                          ) : step.status === 'in_progress' ? (
                            <BsPlayCircle size={18} className='text-amber-500' />
                          ) : (
                            <BsLockFill size={16} className='text-gray-300 dark:text-gray-600 ml-px' />
                          )}
                        </div>

                        {/* Step Text */}
                        <div className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                          step.status === 'completed'
                            ? 'text-gray-700 dark:text-gray-300 bg-emerald-50/50 dark:bg-emerald-950/40'
                            : step.status === 'in_progress'
                              ? 'text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/40 font-semibold'
                              : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {step.title}
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                          step.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                          step.status === 'in_progress' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-300 dark:text-gray-600'
                        }`}>
                          {step.status === 'completed' ? 'Done' : step.status === 'in_progress' ? 'Active' : 'Locked'}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Roadmaps
