import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BsArrowRight, BsLightning } from 'react-icons/bs'

const recommendation = {
  title: 'Improve Your Resume Score',
  description: 'Your resume score is 72%. Upload an updated version with recent projects and skills to improve your match rate with job descriptions.',
  actionLabel: 'Upload Resume',
  actionPath: '/interview',
  priority: 'medium',
}

const priorityStyles = {
  low: 'border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/40',
  medium: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40',
  high: 'border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/40',
}

function RecommendedStep() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={`border rounded-2xl p-6 mb-6 transition-colors ${priorityStyles[recommendation.priority]}`}
    >
      <div className='flex items-start gap-4'>
        <div className='bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 p-2.5 rounded-xl flex-shrink-0 mt-0.5 border border-emerald-200/50 dark:border-emerald-700/50'>
          <BsLightning size={18} />
        </div>
        <div className='flex-1'>
          <p className='text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1'>Recommended Next Step</p>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white mb-1.5'>{recommendation.title}</h3>
          <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4'>{recommendation.description}</p>
          <motion.button
            onClick={() => navigate(recommendation.actionPath)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition flex items-center gap-2 shadow-md shadow-emerald-600/20'
          >
            {recommendation.actionLabel}
            <BsArrowRight size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default RecommendedStep
