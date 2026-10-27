import React from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { BsActivity, BsMic, BsArrowRight, BsPerson, BsQuestionCircle, BsFileEarmarkText, BsFolder } from 'react-icons/bs'

function getIcon(iconType) {
  switch (iconType) {
    case 'mic':
      return <BsMic size={15} />
    case 'person':
      return <BsPerson size={15} />
    case 'quiz':
      return <BsQuestionCircle size={15} />
    case 'file':
    case 'document':
      return <BsFileEarmarkText size={15} />
    default:
      return <BsFolder size={15} />
  }
}

function getColorStyle(color) {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
    case 'purple':
      return 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
    case 'blue':
      return 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
    case 'amber':
      return 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
    case 'teal':
      return 'bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
  }
}

function formatTime(dateStr) {
  if (!dateStr) return 'Recently'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 2) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

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
            View History
          </button>
        )}
      </div>

      {activities.length > 0 ? (
        <div className='space-y-1.5'>
          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => activity.actionPath && navigate(activity.actionPath)}
              className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-200 cursor-pointer group border border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/60'
            >
              <div className={`p-2 rounded-xl flex-shrink-0 ${getColorStyle(activity.color)}`}>
                {getIcon(activity.iconType)}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'>
                  {activity.text}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{activity.detail}</p>
              </div>
              <span className='text-xs font-medium text-gray-400 dark:text-gray-500 flex-shrink-0'>
                {formatTime(activity.time)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className='py-8 text-center space-y-3 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl border border-dashed border-gray-200 dark:border-gray-700'>
          <p className='text-xs font-bold text-gray-800 dark:text-gray-200'>No Activity Recorded Yet</p>
          <p className='text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed'>
            Take your first AI interview or upload a resume to start tracking your real placement readiness.
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

