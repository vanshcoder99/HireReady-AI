import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BsFileEarmarkText, BsLayers, BsQuestionCircle, BsFileEarmark, BsBarChart } from 'react-icons/bs'

function QuickAccess({ stats }) {
  const navigate = useNavigate()

  const docCount = stats?.documentsCount ?? 0
  const flashcardSets = stats?.flashcards?.totalSets ?? 0
  const quizCount = stats?.quizzes?.total ?? 0
  const hasResume = stats?.hasResume ?? false
  const aiCount = stats?.aiInterviews?.total ?? 0

  const accessItems = [
    {
      label: 'Documents',
      icon: <BsFileEarmarkText size={20} />,
      path: '/documents',
      color: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60',
      count: `${docCount} file${docCount === 1 ? '' : 's'}`,
    },
    {
      label: 'Flashcards',
      icon: <BsLayers size={20} />,
      path: '/flashcards',
      color: 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60',
      count: `${flashcardSets} set${flashcardSets === 1 ? '' : 's'}`,
    },
    {
      label: 'Quizzes',
      icon: <BsQuestionCircle size={20} />,
      path: '/quizzes',
      color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60',
      count: `${quizCount} quiz${quizCount === 1 ? '' : 'zes'}`,
    },
    {
      label: 'Resume ATS',
      icon: <BsFileEarmark size={20} />,
      path: '/resume',
      color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
      count: hasResume ? 'Analyzed' : 'Upload Resume',
    },
    {
      label: 'Analytics',
      icon: <BsBarChart size={20} />,
      path: '/analytics',
      color: 'bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/60',
      count: `${aiCount} interview${aiCount === 1 ? '' : 's'}`,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
    >
      <h3 className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4'>Quick Access</h3>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5'>
        {accessItems.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => navigate(item.path)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 hover:shadow-md transition-all duration-200 cursor-pointer`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.color}`}>
              {item.icon}
            </div>
            <div className='text-center'>
              <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>{item.label}</p>
              <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5'>{item.count}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default QuickAccess

