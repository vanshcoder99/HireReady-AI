import React from 'react'
import { motion } from 'motion/react'
import { useSelector } from 'react-redux'
import { HiSparkles } from 'react-icons/hi'
import { BsRobot } from 'react-icons/bs'

function GreetingBanner() {
  const { userData } = useSelector((state) => state.user)
  const name = userData?.user?.name?.split(' ')[0] || 'Student'

  const hour = new Date().getHours()
  let greeting = 'Good Morning'
  let emoji = '☀️'
  if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon'
    emoji = '🌤️'
  } else if (hour >= 17) {
    greeting = 'Good Evening'
    emoji = '🌙'
  }

  const credits = userData?.user?.credits || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 rounded-[24px] p-8 md:p-10 text-white relative overflow-hidden'
    >
      {/* Decorative shapes */}
      <div className='absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3' />
      <div className='absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3' />
      <div className='absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full' />

      <div className='relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6'>
        <div>
          <div className='flex items-center gap-2 mb-3'>
            <HiSparkles size={18} className='text-emerald-200' />
            <span className='text-emerald-100 text-sm font-medium tracking-wide uppercase'>Dashboard</span>
          </div>
          <h1 className='text-3xl md:text-4xl font-bold mb-2'>
            {greeting}, {name}! {emoji}
          </h1>
          <p className='text-emerald-100 text-base md:text-lg max-w-xl'>
            Ready to ace your next interview? Let's track your progress and keep improving.
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-center min-w-[120px]'>
            <div className='flex items-center justify-center gap-2 mb-1'>
              <BsRobot size={18} />
              <span className='text-2xl font-bold'>{credits}</span>
            </div>
            <p className='text-emerald-100 text-xs'>Credits Left</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default GreetingBanner
