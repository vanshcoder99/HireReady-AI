import React from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { BsActivity, BsMic, BsArrowRight } from 'react-icons/bs'

function RecentActivity({ activities = [] }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className='bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 mb-6 transition-colors duration-300'
    >
      <div className='flex items-center justify-between mb-5'>
        <div className='flex items-center gap-2.5'>
          <div className='bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2 rounded-xl border border-gray-200/60 dark:border-gray-700'>
            <BsActivity size={16} />
          </div>
          <h3 className='font-semibold text-gray-900 dark:text-white'>Recent Activity</h3>
        </div>
        {activities.length > 0 && (
          <button onClick={() => navigate('/history')} className='text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer'>
            View All
          </button>
        )}
      </div>

      {activities.length > 0 ? (
        <div className='space-y-1'>
          {activities.map((activity, index) => (
            <div
              key={index}
              className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200'
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${activity.color || 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300'}`}>
                {activity.icon || <BsMic size={14} />}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800 dark:text-gray-200 truncate'>{activity.text}</p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>{activity.detail}</p>
              </div>
              <span className='text-xs text-gray-400 flex-shrink-0'>{activity.time}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className='py-6 text-center space-y-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl border border-dashed border-gray-200 dark:border-gray-700'>
          <p className='text-xs font-bold text-gray-800 dark:text-gray-200'>No Activity Recorded Yet</p>
          <p className='text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed'>
            Take your first AI interview or upload a resume to start tracking your placement readiness.
          </p>
          <button
            onClick={() => navigate('/interview')}
            className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5'
          >
            <span>Start First AI Mock Interview</span>
            <BsArrowRight size={12} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default RecentActivity
