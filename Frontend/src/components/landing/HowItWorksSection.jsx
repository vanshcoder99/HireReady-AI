import React from 'react'
import { motion } from 'motion/react'
import { BsPersonPlus, BsUpload, BsLightning, BsGraphUpArrow } from 'react-icons/bs'

const steps = [
  {
    icon: <BsPersonPlus size={24} />,
    step: 'STEP 01',
    title: 'Create Account',
    desc: 'Sign up with Google in seconds. No setup required.',
    rotation: 'rotate-[-3deg]',
  },
  {
    icon: <BsUpload size={24} />,
    step: 'STEP 02',
    title: 'Upload Resume & Role',
    desc: 'AI analyzes your resume and tailors questions to your target role.',
    rotation: 'rotate-[2deg] md:-mt-4 shadow-xl',
  },
  {
    icon: <BsLightning size={24} />,
    step: 'STEP 03',
    title: 'Practice & Learn',
    desc: 'Take AI interviews, study flashcards, solve quizzes, and improve daily.',
    rotation: 'rotate-[-2deg]',
  },
  {
    icon: <BsGraphUpArrow size={24} />,
    step: 'STEP 04',
    title: 'Track & Get Hired',
    desc: 'Monitor your readiness with analytics and walk into interviews confidently.',
    rotation: 'rotate-[3deg] md:-mt-4 shadow-xl',
  },
]

function HowItWorksSection() {
  return (
    <section id='how-it-works' className='py-24 px-6 bg-white dark:bg-[#090d16] overflow-hidden transition-colors duration-300'>
      <div className='max-w-7xl mx-auto'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='text-center mb-20'
        >
          <span className='text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/60'>
            How It Works
          </span>
          <h2 className='text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 mb-4 tracking-tight'>
            Get Started in <span className='text-emerald-600 dark:text-emerald-400'>4 Simple Steps</span>
          </h2>
          <p className='text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto'>
            From sign-up to placement — we've simplified every step of your preparation.
          </p>
        </motion.div>

        {/* 4 Step Cards */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-6 pt-6 pb-10 justify-items-center'>
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              className={`
                relative bg-white dark:bg-gray-900 rounded-3xl border-2 border-emerald-100 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 
                p-8 w-full max-w-[290px] shadow-md hover:shadow-2xl transition-all duration-300
                ${item.rotation}
              `}
            >
              {/* Top Floating Badge with icon */}
              <div className='absolute -top-7 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-emerald-500 text-emerald-600 dark:text-emerald-400 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg'>
                {item.icon}
              </div>

              {/* Card Content Centered */}
              <div className='pt-6 text-center'>
                <div className='text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2 tracking-wider'>
                  {item.step}
                </div>
                <h3 className='font-bold text-gray-800 dark:text-white mb-3 text-lg leading-snug'>
                  {item.title}
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
