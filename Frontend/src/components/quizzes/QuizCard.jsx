import React from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { 
  BsQuestionCircle, 
  BsPlayFill, 
  BsTrophy, 
  BsClockHistory, 
  BsTrash
} from 'react-icons/bs'

function QuizCard({ quiz, onStart, onViewResults, onDelete, delay = 0 }) {
  const navigate = useNavigate()
  const quizId = quiz._id || quiz.id
  const isCompleted = quiz.status === 'completed' || (quiz.attemptsCount || 0) > 0
  const isInProgress = quiz.status === 'in_progress'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08)' }}
      className='bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200/90 dark:border-gray-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between group relative'
    >
      {/* Delete Trash Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(quizId)
          }}
          className='absolute top-5 right-5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer'
          title='Delete Quiz'
        >
          <BsTrash size={16} />
        </button>
      )}

      <div>
        {/* Score Badge Header */}
        <div className='flex items-center justify-between mb-4 pr-6'>
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
            isCompleted 
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
          }`}>
            <BsTrophy size={13} className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'} />
            <span>Score: {quiz.bestScore || quiz.lastAttemptScore || 0}/{quiz.totalQuestions || 5}</span>
          </div>

          <span className='text-[11px] font-semibold text-gray-400 uppercase tracking-wider'>
            {quiz.category || 'Quiz'}
          </span>
        </div>

        {/* Title */}
        <h3 className='font-bold text-gray-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-1 line-clamp-1'>
          {quiz.title}
        </h3>

        {/* Created Date */}
        <p className='text-xs text-gray-400 font-medium mb-5'>
          CREATED {new Date(quiz.createdAt || Date.now()).toLocaleDateString()}
        </p>

        {/* Questions Pill */}
        <div className='mb-6'>
          <span className='text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 px-3 py-1.5 rounded-xl inline-block'>
            {quiz.totalQuestions || 5} Questions
          </span>
        </div>
      </div>

      {/* Button Action */}
      <div>
        {isCompleted ? (
          <div className='flex items-center gap-2'>
            <button
              onClick={() => onViewResults ? onViewResults(quizId) : navigate(`/quizzes/${quizId}/results`)}
              className='flex-1 cursor-pointer py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-2'
            >
              <BsClockHistory size={15} />
              <span>Results</span>
            </button>
            <button
              onClick={() => onStart ? onStart(quizId) : navigate(`/quizzes/${quizId}`)}
              className='flex-1 cursor-pointer py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-xs md:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs'
            >
              <BsPlayFill size={18} />
              <span>Retake</span>
            </button>
          </div>
        ) : isInProgress ? (
          <button
            onClick={() => onStart ? onStart(quizId) : navigate(`/quizzes/${quizId}`)}
            className='w-full cursor-pointer py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs'
          >
            <BsPlayFill size={18} />
            <span>Continue Quiz</span>
          </button>
        ) : (
          <button
            onClick={() => onStart ? onStart(quizId) : navigate(`/quizzes/${quizId}`)}
            className='w-full cursor-pointer py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-xs'
          >
            <BsPlayFill size={18} />
            <span>Start Quiz</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default QuizCard
