import React from 'react'
import { motion } from 'motion/react'

function RobotMascot({ size = 56, className = '' }) {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -8, 0, -5, 0],
        rotate: [0, 5, -5, 2, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay: 0.8 },
        scale: { duration: 0.5, delay: 0.8, type: 'spring', stiffness: 200 },
        y: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 1.2 },
        rotate: { repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 1.2 },
      }}
    >
      {/* Background Soft Glow - 100% transparent edges */}
      <motion.div
        className='absolute inset-0 rounded-full bg-emerald-400/30 dark:bg-emerald-400/40 blur-md pointer-events-none'
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.2,
          ease: 'easeInOut',
        }}
      />

      {/* Vector 3D Animated Robot (100% Transparent SVG) */}
      <svg
        width={size}
        height={size}
        viewBox='0 0 100 100'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className='relative z-10 drop-shadow-md select-none pointer-events-none'
      >
        <defs>
          {/* Main Metallic Body Gradient */}
          <linearGradient id='robotBody' x1='10' y1='10' x2='90' y2='90' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#10b981' />
            <stop offset='50%' stopColor='#059669' />
            <stop offset='100%' stopColor='#047857' />
          </linearGradient>

          {/* Visor Cyan Glow */}
          <linearGradient id='visorGrad' x1='25' y1='30' x2='75' y2='45' gradientUnits='userSpaceOnUse'>
            <stop offset='0%' stopColor='#06b6d4' />
            <stop offset='100%' stopColor='#3b82f6' />
          </linearGradient>

          {/* Antenna Glow */}
          <radialGradient id='antennaGlow' cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stopColor='#34d399' />
            <stop offset='100%' stopColor='#059669' />
          </radialGradient>
        </defs>

        {/* Antenna Beam & Ball */}
        <motion.path
          d='M 50 22 L 50 12'
          stroke='#059669'
          strokeWidth='4'
          strokeLinecap='round'
        />
        <motion.circle
          cx='50'
          cy='10'
          r='5.5'
          fill='url(#antennaGlow)'
          animate={{
            r: [4.5, 6.5, 4.5],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Head Shell */}
        <rect
          x='20'
          y='22'
          width='60'
          height='40'
          rx='18'
          fill='url(#robotBody)'
          stroke='#ecfdf5'
          strokeWidth='2'
        />

        {/* Face Screen Visor */}
        <rect
          x='26'
          y='28'
          width='48'
          height='26'
          rx='12'
          fill='#090d16'
        />

        {/* Glowing Eyes */}
        <motion.circle
          cx='40'
          cy='41'
          r='4.5'
          fill='#38bdf8'
          animate={{
            scaleY: [1, 0.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.5,
            repeatDelay: 2,
          }}
        />
        <motion.circle
          cx='60'
          cy='41'
          r='4.5'
          fill='#38bdf8'
          animate={{
            scaleY: [1, 0.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3.5,
            repeatDelay: 2,
          }}
        />

        {/* Cute Smile Line */}
        <path
          d='M 45 48 Q 50 51 55 48'
          stroke='#38bdf8'
          strokeWidth='2'
          strokeLinecap='round'
          fill='none'
        />

        {/* Robot Torso */}
        <path
          d='M 30 64 L 70 64 C 74 64 76 68 74 74 L 68 88 C 67 92 63 94 58 94 L 42 94 C 37 94 33 92 32 88 L 26 74 C 24 68 26 64 30 64 Z'
          fill='url(#robotBody)'
          stroke='#ecfdf5'
          strokeWidth='2'
        />

        {/* Chest Power Core */}
        <motion.circle
          cx='50'
          cy='78'
          r='5'
          fill='#6ee7b7'
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        />

        {/* Left Waving Arm */}
        <motion.path
          d='M 24 68 Q 14 62 10 52'
          stroke='#059669'
          strokeWidth='5'
          strokeLinecap='round'
          fill='none'
          animate={{
            rotate: [0, 15, -10, 15, 0],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{ transformOrigin: '24px 68px' }}
        />
        <circle cx='10' cy='52' r='3.5' fill='#34d399' />

        {/* Right Arm */}
        <path
          d='M 76 68 Q 84 74 88 82'
          stroke='#059669'
          strokeWidth='5'
          strokeLinecap='round'
          fill='none'
        />
        <circle cx='88' cy='82' r='3.5' fill='#34d399' />
      </svg>
    </motion.div>
  )
}

export default RobotMascot
