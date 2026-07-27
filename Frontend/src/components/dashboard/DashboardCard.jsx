import React from 'react'
import { motion } from 'motion/react'

function DashboardCard({ title, icon, children, className = '', delay = 0, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white dark:bg-gray-900 rounded-[24px] shadow-sm border border-gray-200/80 dark:border-gray-800 p-6 hover:shadow-md transition-all duration-300 ${className}`}
    >
      {(title || icon || action) && (
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center gap-3'>
            {icon && (
              <div className='bg-green-50 dark:bg-emerald-950/60 text-green-600 dark:text-emerald-400 p-2.5 rounded-xl border border-green-100 dark:border-emerald-800/60'>
                {icon}
              </div>
            )}
            {title && <h3 className='font-bold text-gray-900 dark:text-white text-lg tracking-tight'>{title}</h3>}
          </div>
          {action && action}
        </div>
      )}
      {children}
    </motion.div>
  )
}

export default DashboardCard
