import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BsCheckCircleFill, BsXCircleFill, BsX } from 'react-icons/bs'

function Toast({ type = 'success', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => {
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  const isSuccess = type === 'success'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className='fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-colors duration-300'
        style={{
          backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          borderColor: isSuccess ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)',
          color: '#ffffff',
        }}
      >
        {isSuccess ? (
          <BsCheckCircleFill size={18} className='text-white shrink-0' />
        ) : (
          <BsXCircleFill size={18} className='text-white shrink-0' />
        )}

        <span className='text-xs md:text-sm font-semibold tracking-wide'>{message}</span>

        <button
          onClick={onClose}
          className='ml-2 text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer'
        >
          <BsX size={18} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default Toast
