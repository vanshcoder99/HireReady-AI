import React, { useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuthModel from '../components/AuthModel'
import { 
  BsMic as MicIcon, 
  BsFileEarmarkText as FileIcon, 
  BsRobot as RobotIcon, 
  BsLayers as LayersIcon, 
  BsQuestionCircle as QuizIcon, 
  BsPeople as PeopleIcon, 
  BsLightning as SparkIcon, 
  BsCheckCircleFill as CheckIcon,
  BsDownload as DownloadIcon,
  BsGraphUpArrow as TrendIcon,
  BsArrowRight as ArrowIcon
} from 'react-icons/bs'

import evalImg from '../assets/ai-ans.png'
import resumeImg from '../assets/resume.png'
import pdfImg from '../assets/pdf.png'
import techImg from '../assets/tech.png'
import creditImg from '../assets/credit.png'
import confiImg from '../assets/confi.png'
import historyImg from '../assets/history.png'
import hrImg from '../assets/HR.png'

const coreFeatures = [
  {
    icon: <MicIcon size={24} />,
    title: 'Adaptive AI Mock Interviews',
    badge: 'Core Feature',
    description: 'Experience real-time voice interview rounds tailored to your role. Our AI evaluates technical correctness, communication clarity, and voice confidence depth dynamically.',
    image: evalImg,
    highlights: [
      'Real-time voice & speech analysis',
      'Technical accuracy scoring',
      'Communication & confidence rating',
      'Dynamic question adaptation'
    ]
  },
  {
    icon: <FileIcon size={24} />,
    title: 'Resume-Based Question Generation',
    badge: 'AI Powered',
    description: 'Upload your PDF resume to generate hyper-realistic questions based on your actual projects, tech stacks, experience level, and listed skills.',
    image: resumeImg,
    highlights: [
      'PDF resume parsing & project extraction',
      'Custom role-aligned technical questions',
      'Skill gap identification',
      'Targeted project deep-dive prompts'
    ]
  },
  {
    icon: <DownloadIcon size={24} />,
    title: 'Instant Diagnostic PDF Reports',
    badge: 'Analytics',
    description: 'Get immediate downloadable PDF feedback reports detailing score breakdowns, metric graphs, exact answer suggestions, and action plans after every round.',
    image: pdfImg,
    highlights: [
      'Comprehensive performance breakdown',
      'Strengths & improvement roadmap',
      'Sample ideal responses',
      'Downloadable PDF export'
    ]
  },
  {
    icon: <RobotIcon size={24} />,
    title: 'AI Placement Assistant',
    badge: '24/7 Companion',
    description: 'Ask questions, clarify complex data structures or system design topics, and request tailored interview tips from your personal AI study mentor.',
    image: techImg,
    highlights: [
      'Instant concept explanations',
      'Code syntax & logic breakdown',
      'Customized interview prep tips',
      '24/7 interactive guidance'
    ]
  },
  {
    icon: <QuizIcon size={24} />,
    title: 'Topic-Wise Technical Quizzes',
    badge: 'Practice Mode',
    description: 'Test your domain knowledge in Data Structures, Web Development, DBMS, OS, and Networking with interactive timed quizzes and instant score metrics.',
    image: creditImg,
    highlights: [
      'Subject-specific quiz banks',
      'Instant answer verification',
      'Timed speed challenges',
      'Weak area tagging'
    ]
  },
  {
    icon: <LayersIcon size={24} />,
    title: 'Smart Revision Flashcards',
    badge: 'Quick Learn',
    description: 'Master core concepts quickly with active-recall flashcards designed for rapid pre-interview revision of key syntax, definitions, and formulas.',
    image: confiImg,
    highlights: [
      'Active recall methodology',
      'Categorized tech stacks',
      'Streak & memory tracking',
      'Quick pre-interview warmups'
    ]
  },
  {
    icon: <TrendIcon size={24} />,
    title: 'Progress & Readiness Dashboard',
    badge: 'Tracking',
    description: 'Track your placement readiness score over time. View completed interviews, quiz accuracy, study streaks, and performance growth history.',
    image: historyImg,
    highlights: [
      'Live readiness percentage score',
      'Historical performance graphs',
      'Daily prep streak counters',
      'Target job match evaluation'
    ]
  },
  {
    icon: <PeopleIcon size={24} />,
    title: 'Human Mock Interview Portal',
    badge: 'Live Network',
    description: 'Connect with experienced mentors and peers for live 1-on-1 mock interviews, behavioral HR practice, and personalized expert review.',
    image: hrImg,
    highlights: [
      'Verified interviewer profiles',
      'Seamless slot scheduling',
      'Live video & code collaboration',
      'Constructive peer feedback'
    ]
  }
]

function FeaturesPage() {
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)
  const [showAuth, setShowAuth] = useState(false)

  const handleAction = () => {
    if (userData) {
      navigate('/interview')
    } else {
      setShowAuth(true)
    }
  }

  return (
    <div className='min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden transition-colors duration-300'>
      {/* Background Decorative Ambient Lighting */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10 dark:from-emerald-500/20 dark:via-teal-500/10' />

      <Navbar />

      <main className='pt-32 pb-24 px-6 max-w-7xl mx-auto'>
        {/* Page Header */}
        <div className='text-center max-w-3xl mx-auto mb-20'>
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold px-4 py-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 tracking-wide uppercase mb-6 shadow-xs'
          >
            <SparkIcon size={16} className='text-emerald-600 dark:text-emerald-400' />
            PLATFORM FEATURES & CAPABILITIES
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-6'
          >
            Everything You Need to <br />
            <span className='text-emerald-600 dark:text-emerald-400'>Ace Your Placements</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed font-normal'
          >
            Explore our comprehensive suite of AI mock interviews, resume diagnostic tools, active recall flashcards, quizzes, and live peer practice.
          </motion.p>
        </div>

        {/* Features List */}
        <div className='space-y-16 md:space-y-24'>
          {coreFeatures.map((feat, idx) => {
            const isEven = idx % 2 === 0
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 p-8 md:p-12 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } items-center gap-10 lg:gap-14 relative overflow-hidden`}
              >
                {/* Content Column */}
                <div className='flex-1 space-y-5'>
                  <div className='flex items-center gap-3'>
                    <div className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/60 shadow-xs'>
                      {feat.icon}
                    </div>
                    <span className='text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/60'>
                      {feat.badge}
                    </span>
                  </div>

                  <h2 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug'>
                    {feat.title}
                  </h2>

                  <p className='text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed font-normal'>
                    {feat.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className='grid sm:grid-cols-2 gap-3 pt-3'>
                    {feat.highlights.map((h, i) => (
                      <div key={i} className='flex items-center gap-2.5'>
                        <CheckIcon size={16} className='text-emerald-600 dark:text-emerald-400 flex-shrink-0' />
                        <span className='text-sm font-semibold text-gray-800 dark:text-gray-200'>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Showcase Column */}
                <div className='flex-1 w-full flex justify-center bg-gray-50/80 dark:bg-gray-800/60 p-6 md:p-8 rounded-2xl border border-gray-100/90 dark:border-gray-700/60 relative group'>
                  <img
                    src={feat.image}
                    alt={feat.title}
                    className='w-full h-auto object-contain max-h-72 transform group-hover:scale-105 transition-transform duration-500 drop-shadow-md'
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='mt-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-10 md:p-14 text-white text-center shadow-xl relative overflow-hidden'
        >
          <div className='relative z-10 max-w-2xl mx-auto space-y-6'>
            <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight'>
              Ready to Practice Your Placement Round?
            </h2>
            <p className='text-emerald-100 text-base md:text-lg font-normal leading-relaxed'>
              Start your first AI mock interview session in less than 2 minutes. No setup required.
            </p>
            <motion.button
              onClick={handleAction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-4 rounded-full font-bold text-base cursor-pointer transition shadow-lg inline-flex items-center gap-2'
            >
              <span>Start Free AI Mock Round</span>
              <ArrowIcon size={18} />
            </motion.button>
          </div>
        </motion.div>
      </main>

      <Footer />
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default FeaturesPage
