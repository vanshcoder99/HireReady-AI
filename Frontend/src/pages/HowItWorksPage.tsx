import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuthModel from '../components/AuthModel'
import { 
  BsPersonPlus, 
  BsUpload, 
  BsLightning, 
  BsGraphUpArrow,
  BsCheckCircleFill,
  BsChevronDown,
  BsQuestionCircle,
  BsArrowRight
} from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'

import evalImg from '../assets/ai-ans.png'
import resumeImg from '../assets/resume.png'
import pdfImg from '../assets/pdf.png'
import historyImg from '../assets/history.png'

const detailedSteps = [
  {
    number: '01',
    title: 'Create Your Candidate Profile',
    icon: <BsPersonPlus size={26} />,
    description: 'Sign up effortlessly with Google. Select your target engineering roles (e.g. SDE, Frontend, Data Analyst, DevOps) and specify your target experience tier.',
    bullets: [
      'One-click Google authentication',
      'Select candidate role & tech domain',
      'Initial 100 free AI interview credits added',
      'No complex configuration needed'
    ],
    image: resumeImg
  },
  {
    number: '02',
    title: 'Upload Resume & Select Practice Track',
    icon: <BsUpload size={26} />,
    description: 'Upload your PDF resume to extract projects, tech stacks, and domain skills. Our AI constructs realistic role-aligned interview questions tailored specifically to you.',
    bullets: [
      'Instant PDF parsing & skills extraction',
      'Choose between Technical & Behavioral HR rounds',
      'System auto-configures question difficulty',
      'Projects deep-dive scenario generation'
    ],
    image: pdfImg
  },
  {
    number: '03',
    title: 'Take Live AI Voice Mock Interview',
    icon: <BsLightning size={26} />,
    description: 'Step into an interactive AI interview room with real-time voice synthesis and speech analysis. Respond naturally while AI evaluates your technical logic and voice confidence.',
    bullets: [
      'Interactive AI voice examiner',
      'Real-time answer speech transcription',
      'Adaptive follow-up questions',
      'Live timer & question navigator'
    ],
    image: evalImg
  },
  {
    number: '04',
    title: 'Receive Detailed Diagnostic Report & Practice',
    icon: <BsGraphUpArrow size={26} />,
    description: 'Analyze your performance report containing score charts, voice confidence meters, and downloadable PDF feedback. Practice targeted quizzes and flashcards to strengthen weak spots.',
    bullets: [
      'Downloadable PDF performance report',
      'Voice confidence & clarity metrics',
      'Topic quizzes & active-recall flashcards',
      'Option to schedule peer human mock rounds'
    ],
    image: historyImg
  }
]

const faqs = [
  {
    q: 'How does the AI evaluate my interview responses?',
    a: 'Our AI engine analyzes your response using advanced natural language understanding and voice analysis. It checks technical correctness against industry standards, communication clarity, depth of explanation, and vocal confidence meters.'
  },
  {
    q: 'Can I tailor questions to a specific job description or company?',
    a: 'Yes! By uploading your PDF resume or selecting target candidate roles, the system extracts your specific tech stack, frameworks, and projects to generate custom, company-relevant technical rounds.'
  },
  {
    q: 'Are the PDF diagnostic reports downloadable?',
    a: 'Absolutely. After completing any AI interview round, you can view the complete diagnostic report on screen and download a formatted PDF summary containing your score breakdown, metrics, and improvement recommendations.'
  },
  {
    q: 'What is the difference between Candidate and Interviewer roles?',
    a: 'Candidates practice AI interviews, study flashcards, solve quizzes, and track readiness. Interviewers can register to conduct human peer mock interviews, create slot availabilities, and assist candidates.'
  },
  {
    q: 'How do interview credits work?',
    a: 'New candidates start with free credits. Taking an AI mock round consumes credits. You can get more credits anytime on the Pricing page or earn credits through candidate milestones.'
  }
]

function HowItWorksPage() {
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)
  const [openFaq, setOpenFaq] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx)
  }

  const handleGetStarted = () => {
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
        {/* Page Hero */}
        <div className='text-center max-w-3xl mx-auto mb-20'>
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold px-4 py-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 tracking-wide uppercase mb-6 shadow-xs'
          >
            <HiSparkles size={16} className='text-emerald-600 dark:text-emerald-400' />
            SIMPLE & INTUITIVE WORKFLOW
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-6'
          >
            How HireReady.AI Powers Your <br />
            <span className='text-emerald-600 dark:text-emerald-400'>Placement Success</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='text-gray-600 dark:text-gray-400 text-lg md:text-xl leading-relaxed font-normal'
          >
            From your initial sign-up to AI mock rounds and performance analysis, learn how our platform guides your step-by-step interview preparation.
          </motion.p>
        </div>

        {/* 4 Step Deep-Dive Sections */}
        <div className='space-y-16 md:space-y-20 mb-24'>
          {detailedSteps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className='bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 p-8 md:p-12 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-center gap-10 lg:gap-14 relative'
            >
              {/* Step Number Circle */}
              <div className='absolute top-6 left-8 text-6xl font-extrabold text-emerald-500/10 dark:text-emerald-500/20 select-none font-mono'>
                {step.number}
              </div>

              {/* Content Side */}
              <div className='flex-1 space-y-4 relative z-10 pt-4 md:pt-0'>
                <div className='flex items-center gap-3'>
                  <div className='bg-emerald-600 text-white p-3 rounded-2xl shadow-md'>
                    {step.icon}
                  </div>
                  <span className='text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400'>
                    STEP {step.number}
                  </span>
                </div>

                <h2 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
                  {step.title}
                </h2>

                <p className='text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed font-normal'>
                  {step.description}
                </p>

                <div className='space-y-2.5 pt-2'>
                  {step.bullets.map((b, i) => (
                    <div key={i} className='flex items-center gap-2.5'>
                      <BsCheckCircleFill size={15} className='text-emerald-600 dark:text-emerald-400 flex-shrink-0' />
                      <span className='text-sm font-semibold text-gray-800 dark:text-gray-200'>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Preview Side */}
              <div className='flex-1 w-full flex justify-center bg-gray-50/80 dark:bg-gray-800/60 p-6 md:p-8 rounded-2xl border border-gray-100/90 dark:border-gray-700/60 relative'>
                <img
                  src={step.image}
                  alt={step.title}
                  className='w-full h-auto object-contain max-h-64 hover:scale-105 transition-transform duration-500 drop-shadow-md'
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Traditional Prep vs HireReady Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 p-8 md:p-12 shadow-lg mb-24'
        >
          <div className='text-center max-w-2xl mx-auto mb-12'>
            <span className='text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/60'>
              ADVANTAGE BREAKDOWN
            </span>
            <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-3'>
              Traditional Prep vs. HireReady.AI
            </h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm border-collapse'>
              <thead>
                <tr className='border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold'>
                  <th className='py-4 px-4'>Preparation Aspect</th>
                  <th className='py-4 px-4 text-gray-400'>Traditional Methods</th>
                  <th className='py-4 px-4 text-emerald-600 dark:text-emerald-400 font-bold'>HireReady.AI Platform</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300'>
                <tr>
                  <td className='py-4 px-4 font-bold text-gray-900 dark:text-white'>Mock Interview Availability</td>
                  <td className='py-4 px-4 text-gray-500'>Requires booking days in advance with mentors</td>
                  <td className='py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2'>
                    <BsCheckCircleFill /> 24/7 Instant AI Voice Mock Interviews
                  </td>
                </tr>
                <tr>
                  <td className='py-4 px-4 font-bold text-gray-900 dark:text-white'>Resume Tailoring</td>
                  <td className='py-4 px-4 text-gray-500'>Generic online question lists</td>
                  <td className='py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2'>
                    <BsCheckCircleFill /> Auto-extracted questions from your PDF CV
                  </td>
                </tr>
                <tr>
                  <td className='py-4 px-4 font-bold text-gray-900 dark:text-white'>Feedback Detail</td>
                  <td className='py-4 px-4 text-gray-500'>Vague subjective comments</td>
                  <td className='py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2'>
                    <BsCheckCircleFill /> Metric scores, speech clarity & downloadable PDF
                  </td>
                </tr>
                <tr>
                  <td className='py-4 px-4 font-bold text-gray-900 dark:text-white'>Preparation Ecosystem</td>
                  <td className='py-4 px-4 text-gray-500'>Scattered tools across multiple sites</td>
                  <td className='py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2'>
                    <BsCheckCircleFill /> All-in-one: AI rounds, quizzes, flashcards & human prep
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ Accordion Section */}
        <div className='max-w-4xl mx-auto mb-20'>
          <div className='text-center mb-12'>
            <span className='text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/60'>
              QUESTIONS & ANSWERS
            </span>
            <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mt-3 tracking-tight'>
              Frequently Asked Questions
            </h2>
          </div>

          <div className='space-y-4'>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl overflow-hidden transition-all'
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className='w-full p-6 text-left font-bold text-gray-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition'
                  >
                    <span className='text-base md:text-lg flex items-center gap-3'>
                      <BsQuestionCircle className='text-emerald-600 dark:text-emerald-400 shrink-0' />
                      {faq.q}
                    </span>
                    <BsChevronDown
                      size={18}
                      className={`text-gray-500 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='px-6 pb-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4'
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className='bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-10 md:p-14 text-white text-center shadow-xl relative overflow-hidden'
        >
          <div className='relative z-10 max-w-2xl mx-auto space-y-6'>
            <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight'>
              Experience the Future of Placement Prep
            </h2>
            <p className='text-emerald-100 text-base md:text-lg font-normal leading-relaxed'>
              Join thousands of candidates who practice smarter and land top tech roles faster.
            </p>
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='bg-white text-emerald-900 hover:bg-emerald-50 px-8 py-4 rounded-full font-bold text-base cursor-pointer transition shadow-lg inline-flex items-center gap-2'
            >
              <span>Get Started Now</span>
              <BsArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </main>

      <Footer />
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default HowItWorksPage
