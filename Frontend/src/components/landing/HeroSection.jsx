import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { HiSparkles } from 'react-icons/hi'
import { BsArrowRight } from 'react-icons/bs'
import AuthModel from '../AuthModel.jsx'
import RobotMascot from './RobotMascot.jsx'

const secondLineWords = ['Get', 'Hired', 'Faster.']

const sentenceVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.35,
    },
  },
}

const wordVariants = {
  hidden: { 
    opacity: 0.1, 
    y: 20,
    filter: 'blur(8px)',
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: { 
      type: 'spring', 
      damping: 14, 
      stiffness: 110 
    } 
  },
}

function HeroSection() {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  const handleGetStarted = () => {
    if (userData) {
      navigate('/dashboard')
    } else {
      setShowAuth(true)
    }
  }

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className='pt-36 pb-20 md:pt-44 md:pb-28 px-6 overflow-hidden'>
        <div className='max-w-5xl mx-auto text-center'>
          {/* Top Platform Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='inline-flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-extrabold px-4 py-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 mb-8 tracking-wide uppercase shadow-xs'
          >
            <HiSparkles size={16} className='text-emerald-600 dark:text-emerald-400 shrink-0' />
            <span className='leading-none py-0.5'>AI-POWERED PLACEMENT PREPARATION PLATFORM</span>
          </motion.div>

          {/* Headline */}
          <h1 className='text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.15] tracking-tight mb-6'>
            {/* Line 1 */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className='block mb-2'
            >
              Prepare Smarter.
            </motion.span>

            {/* Line 2: Animated Word-by-Word with 100% Transparent Moving Video-Style Robot */}
            <motion.span
              variants={sentenceVariants}
              initial='hidden'
              animate='visible'
              className='inline-flex flex-wrap items-center justify-center text-emerald-600 dark:text-emerald-400 gap-x-2 sm:gap-x-3.5 relative'
            >
              {secondLineWords.map((word, index) => (
                <motion.span
                  key={index}
                  variants={wordVariants}
                  className='inline-block tracking-tight'
                >
                  {word}
                </motion.span>
              ))}

              {/* 100% Transparent Moving Animated Robot Character Mascot */}
              <RobotMascot size={56} className='ml-1 sm:ml-2.5 align-middle inline-block' />
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className='text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-normal'
          >
            Your AI-powered placement companion — mock interviews, resume analysis, 
            flashcards, quizzes, and progress tracking in one platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className='flex flex-wrap justify-center gap-4'
          >
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className='bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-lg shadow-emerald-600/20 flex items-center gap-2'
            >
              Get Started
              <BsArrowRight size={16} />
            </motion.button>

            <motion.button
              onClick={scrollToFeatures}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 px-8 py-3.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition'
            >
              Explore Platform
            </motion.button>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className='flex flex-wrap justify-center gap-8 md:gap-12 mt-16 pt-8 border-t border-gray-200/60 dark:border-gray-800/80'
          >
            {[
              { value: '1,000+', label: 'Students Preparing' },
              { value: '5,000+', label: 'AI Interviews Taken' },
              { value: '92%', label: 'Placement Rate' },
            ].map((stat, i) => (
              <div key={i} className='text-center'>
                <p className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white'>{stat.value}</p>
                <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  )
}

export default HeroSection
