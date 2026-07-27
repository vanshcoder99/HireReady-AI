import React from 'react'
import { motion } from 'motion/react'
import { BsMic, BsFileEarmarkText, BsShieldCheck, BsBook } from 'react-icons/bs'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

const progressData = [
  {
    label: 'Interview Progress',
    value: '8/12',
    subtext: 'Completed',
    percent: 67,
    icon: <BsMic size={18} />,
    color: '#10b981',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    label: 'Resume Score',
    value: '72%',
    subtext: 'Strong',
    percent: 72,
    icon: <BsFileEarmarkText size={18} />,
    color: '#3b82f6',
    bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    label: 'Placement Readiness',
    value: '68%',
    subtext: 'Almost Ready',
    percent: 68,
    icon: <BsShieldCheck size={18} />,
    color: '#a855f7',
    bgColor: 'bg-purple-50 dark:bg-purple-950/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    label: 'Study Progress',
    value: '15/25',
    subtext: 'Topics',
    percent: 60,
    icon: <BsBook size={18} />,
    color: '#f59e0b',
    bgColor: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
]

function ProgressOverview() {
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
      {progressData.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          className='bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-5 hover:shadow-md transition-all duration-300'
        >
          <div className='flex items-start justify-between mb-4'>
            <div className={`p-2.5 rounded-xl ${item.bgColor}`}>
              <span className={item.iconColor}>{item.icon}</span>
            </div>
            <div className='w-11 h-11'>
              <CircularProgressbar
                value={item.percent}
                strokeWidth={10}
                styles={buildStyles({
                  pathColor: item.color,
                  trailColor: isDark ? '#1f2937' : '#f3f4f6',
                  pathTransitionDuration: 0.8,
                })}
              />
            </div>
          </div>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>{item.value}</p>
          <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{item.label} · {item.subtext}</p>
        </motion.div>
      ))}
    </div>
  )
}

export default ProgressOverview
