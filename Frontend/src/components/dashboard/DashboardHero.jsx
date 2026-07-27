import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BsArrowRight, BsPlus, BsUpload } from 'react-icons/bs'
import AuthModel from '../AuthModel.jsx'

function DashboardHero() {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  const name = userData?.user?.name?.split(' ')[0] || 'Student'

  const hour = new Date().getHours()
  let greeting = 'Good Morning'
  if (hour >= 12 && hour < 17) greeting = 'Good Afternoon'
  else if (hour >= 17) greeting = 'Good Evening'

  const handleAction = (path) => {
    if (!userData) {
      setShowAuth(true)
      return
    }
    navigate(path)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='mb-8'
      >
        <h1 className='text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1.5'>
          {greeting}, {name} 👋
        </h1>
        <p className='text-gray-600 dark:text-gray-400 text-base'>
          Continue your placement journey. Here's what's next for you.
        </p>

        <div className='flex flex-wrap gap-3 mt-6'>
          <motion.button
            onClick={() => handleAction('/interview')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition flex items-center gap-2 shadow-sm shadow-emerald-600/20'
          >
            Continue Interview
            <BsArrowRight size={14} />
          </motion.button>

          <motion.button
            onClick={() => handleAction('/interview')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2'
          >
            <BsPlus size={18} />
            New Interview
          </motion.button>

          <motion.button
            onClick={() => handleAction('/interview')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2'
          >
            <BsUpload size={14} />
            Upload Resume
          </motion.button>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  )
}

export default DashboardHero
