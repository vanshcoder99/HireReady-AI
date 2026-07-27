import React from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { 
  BsClock, 
  BsTrash, 
  BsPlayFill, 
  BsCheckCircleFill, 
  BsBook
} from 'react-icons/bs'

function FlashcardSetCard({ set, onStudy, onDelete, delay = 0 }) {
  const navigate = useNavigate()
  const setId = set._id || set.id
  const reviewedCount = set.reviewedCount || 0
  const totalCards = set.totalCards || set.cards?.length || 6
  const progressPercent = Math.round((reviewedCount / totalCards) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08)' }}
      className={`bg-white dark:bg-gray-900 rounded-3xl p-6 border transition-all duration-300 relative flex flex-col justify-between group ${
        progressPercent > 0 ? 'border-emerald-200/90 dark:border-emerald-800/80 shadow-sm' : 'border-gray-200/90 dark:border-gray-800 shadow-xs'
      }`}
    >
      <div>
        {/* Top Icon & Category Row */}
        <div className='flex items-start justify-between gap-3 mb-4'>
          <div className='w-12 h-12 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs'>
            <BsBook size={20} />
          </div>

          <div className='flex items-center gap-2'>
            {/* Progress Badge */}
            {progressPercent > 0 && (
              <span className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 inline-flex items-center gap-1'>
                <BsCheckCircleFill size={10} className='text-emerald-500' />
                {progressPercent}%
              </span>
            )}

            {/* Delete button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(setId)
                }}
                className='text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors'
                title='Delete Flashcard Set'
              >
                <BsTrash size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className='font-bold text-gray-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-1 line-clamp-1'>
          {set.title}
        </h3>

        {/* Created Date */}
        <p className='text-xs text-gray-400 font-medium flex items-center gap-1 mb-5'>
          <BsClock size={11} />
          <span>Created {new Date(set.createdAt || Date.now()).toLocaleDateString()}</span>
        </p>

        {/* Card Stats Pills */}
        <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-medium mb-3'>
          <span className='bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full font-semibold border border-gray-200/60 dark:border-gray-700'>
            {totalCards} Cards
          </span>
          <span className='text-gray-400 dark:text-gray-500'>
            {reviewedCount}/{totalCards} reviewed
          </span>
        </div>

        {/* Progress Bar */}
        <div className='w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-6'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, delay: delay + 0.2 }}
            className='bg-emerald-500 h-full rounded-full'
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onStudy ? onStudy(set) : navigate(`/flashcards/${setId}`)}
        className='w-full cursor-pointer py-3 px-4 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white dark:hover:text-white border border-emerald-200/80 dark:border-emerald-800/80 hover:border-emerald-600 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600'
      >
        <BsPlayFill size={18} />
        <span>Study Now</span>
      </button>
    </motion.div>
  )
}

export default FlashcardSetCard
