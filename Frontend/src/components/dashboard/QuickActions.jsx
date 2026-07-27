import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BsMic, BsFileEarmark, BsClock, BsCoin } from 'react-icons/bs'
import DashboardCard from './DashboardCard'

const actions = [
  {
    label: 'Start Interview',
    icon: <BsMic size={22} />,
    path: '/interview',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    hoverColor: 'hover:bg-emerald-100',
  },
  {
    label: 'Upload Resume',
    icon: <BsFileEarmark size={22} />,
    path: '/interview',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    hoverColor: 'hover:bg-blue-100',
  },
  {
    label: 'View History',
    icon: <BsClock size={22} />,
    path: '/history',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    hoverColor: 'hover:bg-purple-100',
  },
  {
    label: 'Buy Credits',
    icon: <BsCoin size={22} />,
    path: '/pricing',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    hoverColor: 'hover:bg-amber-100',
  },
]

function QuickActions() {
  const navigate = useNavigate()

  return (
    <DashboardCard title='Quick Actions' delay={0.1}>
      <div className='grid grid-cols-2 gap-3'>
        {actions.map((action, index) => (
          <motion.button
            key={index}
            onClick={() => navigate(action.path)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border cursor-pointer transition-colors duration-200 ${action.color} ${action.hoverColor}`}
          >
            {action.icon}
            <span className='text-xs font-semibold'>{action.label}</span>
          </motion.button>
        ))}
      </div>
    </DashboardCard>
  )
}

export default QuickActions
