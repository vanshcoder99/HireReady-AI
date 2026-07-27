import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BsFileEarmarkText, BsLayers, BsQuestionCircle, BsFileEarmark, BsBarChart } from 'react-icons/bs'

const accessItems = [
  {
    label: 'Documents',
    icon: <BsFileEarmarkText size={20} />,
    path: '/documents',
    color: 'bg-blue-50 text-blue-600 border-blue-200/60',
    count: '3 files',
  },
  {
    label: 'Flashcards',
    icon: <BsLayers size={20} />,
    path: '/flashcards',
    color: 'bg-purple-50 text-purple-600 border-purple-200/60',
    count: '4 sets',
  },
  {
    label: 'Quizzes',
    icon: <BsQuestionCircle size={20} />,
    path: '/quizzes',
    color: 'bg-amber-50 text-amber-600 border-amber-200/60',
    count: '6 taken',
  },
  {
    label: 'Resume',
    icon: <BsFileEarmark size={20} />,
    path: '/interview',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    count: 'v3 uploaded',
  },
  {
    label: 'Analytics',
    icon: <BsBarChart size={20} />,
    path: '/history',
    color: 'bg-teal-50 text-teal-600 border-teal-200/60',
    count: '12 interviews',
  },
]

function QuickAccess() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
    >
      <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4'>Quick Access</h3>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
        {accessItems.map((item, index) => (
          <motion.button
            key={index}
            onClick={() => navigate(item.path)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex flex-col items-center gap-2.5 p-5 rounded-2xl border bg-white hover:shadow-md transition-all duration-200 cursor-pointer`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${item.color}`}>
              {item.icon}
            </div>
            <div className='text-center'>
              <p className='text-sm font-semibold text-gray-800'>{item.label}</p>
              <p className='text-xs text-gray-400 mt-0.5'>{item.count}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default QuickAccess
