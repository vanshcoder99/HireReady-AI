import React from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { 
  BsFileEarmarkPdf, 
  BsLayers, 
  BsQuestionCircle, 
  BsCheckCircleFill, 
  BsArrowRight,
  BsCalendar3,
  BsFileEarmark,
  BsTrash
} from 'react-icons/bs'

function DocumentCard({ doc, onDelete, delay = 0 }) {
  const navigate = useNavigate()
  const docId = doc._id || doc.id
  const dateStr = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (doc.uploadDate || 'Recently')
  const pagesCount = doc.pageCount || doc.pages || 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08)' }}
      className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative group'
    >
      {/* Top Header Row */}
      <div>
        <div className='flex items-start justify-between gap-3 mb-4'>
          <div className='flex items-center gap-3 min-w-0 flex-1'>
            <div className='w-11 h-11 bg-rose-50 dark:bg-rose-950/80 border border-rose-100 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs'>
              <BsFileEarmarkPdf size={22} />
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='font-bold text-gray-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate'>
                {doc.title}
              </h3>
              <div className='flex items-center gap-2 text-xs text-gray-400 dark:text-gray-400 mt-0.5'>
                <span className='flex items-center gap-1'>
                  <BsCalendar3 size={11} />
                  {dateStr}
                </span>
                <span>•</span>
                <span className='flex items-center gap-1'>
                  <BsFileEarmark size={11} />
                  {pagesCount} {pagesCount === 1 ? 'Page' : 'Pages'}
                </span>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-2 flex-shrink-0'>
            {doc.summaryAvailable && (
              <span className='inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80'>
                <BsCheckCircleFill size={10} className='text-emerald-500' />
                Summary
              </span>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(docId)
                }}
                title='Delete Document'
                className='text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer'
              >
                <BsTrash size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-2 gap-2.5 my-5'>
          <div className='bg-purple-50/60 dark:bg-purple-950/40 border border-purple-100/80 dark:border-purple-800/60 rounded-2xl p-3 flex items-center gap-2.5'>
            <div className='p-1.5 bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 rounded-xl'>
              <BsLayers size={14} />
            </div>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>Flashcards</p>
              <p className='text-sm font-bold text-gray-800 dark:text-gray-200'>{doc.flashcardsCount || 0} Cards</p>
            </div>
          </div>

          <div className='bg-amber-50/60 dark:bg-amber-950/40 border border-amber-100/80 dark:border-amber-800/60 rounded-2xl p-3 flex items-center gap-2.5'>
            <div className='p-1.5 bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 rounded-xl'>
              <BsQuestionCircle size={14} />
            </div>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>Quizzes</p>
              <p className='text-sm font-bold text-gray-800 dark:text-gray-200'>{doc.quizzesCount || 0} Quizzes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Button */}
      <button
        onClick={() => navigate(`/documents/${docId}`)}
        className='w-full cursor-pointer mt-2 py-2.5 px-4 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-gray-700 dark:text-gray-200 hover:text-white dark:hover:text-white border border-gray-200 dark:border-gray-700 hover:border-emerald-600 dark:hover:border-emerald-600 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600'
      >
        <span>Open Document</span>
        <BsArrowRight size={15} />
      </button>
    </motion.div>
  )
}

export default DocumentCard
