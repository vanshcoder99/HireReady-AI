import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BsArrowRight, BsPlus, BsUpload, BsLightningChargeFill, BsPeople } from 'react-icons/bs'
import AuthModel from '../AuthModel'

function DashboardHero({ stats }) {
  const { userData } = useSelector((state: any) => state.user)
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)

  const name = userData?.name?.split(' ')[0] || 'Learner'
  const credits = stats?.credits ?? userData?.credits ?? 0

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
        className='mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4'
      >
        <div>
          <div className='flex items-center gap-2 mb-1.5'>
            <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
              {greeting}, {name} 👋
            </h1>
            <span className='inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80'>
              <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse'></span>
              Live Sync
            </span>
          </div>
          <p className='text-gray-600 dark:text-gray-400 text-sm md:text-base'>
            Track your real-time interview performance & placement readiness.
          </p>

          <div className='flex flex-wrap gap-3 mt-5'>
            <motion.button
              onClick={() => handleAction('/interview')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition flex items-center gap-2 shadow-sm shadow-emerald-600/20'
            >
              <BsPlus size={18} />
              Start AI Interview
            </motion.button>

            <motion.button
              onClick={() => handleAction('/resume')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2'
            >
              <BsUpload size={14} />
              Analyze Resume
            </motion.button>

            <motion.button
              onClick={() => handleAction('/human-interviews')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2'
            >
              <BsPeople size={16} className='text-purple-500' />
              Book Live Interview
            </motion.button>
          </div>
        </div>

        {/* Real User Credits Card */}
        <div className='bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/40 dark:via-gray-900 dark:to-gray-900 border border-emerald-200/70 dark:border-emerald-800/50 p-4 rounded-2xl flex items-center gap-3.5 min-w-[200px] self-start md:self-auto'>
          <div className='w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs'>
            <BsLightningChargeFill size={20} />
          </div>
          <div>
            <p className='text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>AI Credits</p>
            <p className='text-xl font-black text-gray-900 dark:text-white'>{credits} <span className='text-xs font-normal text-gray-500'>Available</span></p>
          </div>
        </div>
      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  )
}

export default DashboardHero

