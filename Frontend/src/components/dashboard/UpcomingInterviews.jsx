import React from 'react'
import { BsCalendar3 } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import DashboardCard from './DashboardCard'
import techImg from '../../assets/tech.png'
import hrImg from '../../assets/HR.png'

// Mock data — replace with API data when backend is ready
const upcoming = [
  {
    role: 'Frontend Developer',
    mode: 'Technical',
    date: 'Tomorrow, 10:00 AM',
    difficulty: 'Medium',
    image: techImg,
  },
  {
    role: 'Full Stack Engineer',
    mode: 'HR',
    date: 'Jul 28, 2:00 PM',
    difficulty: 'Easy',
    image: hrImg,
  },
  {
    role: 'React Developer',
    mode: 'Technical',
    date: 'Jul 30, 11:00 AM',
    difficulty: 'Hard',
    image: techImg,
  },
]

const difficultyColor = {
  Easy: 'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-red-100 text-red-700',
}

function UpcomingInterviews() {
  const navigate = useNavigate()

  return (
    <DashboardCard
      title='Upcoming Interviews'
      icon={<BsCalendar3 size={20} />}
      delay={0.3}
      action={
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/interview')}
          className='text-xs bg-emerald-600 text-white px-4 py-1.5 rounded-full font-semibold cursor-pointer hover:bg-emerald-700 transition'
        >
          + Schedule
        </motion.button>
      }
    >
      <div className='space-y-3'>
        {upcoming.map((item, index) => (
          <div
            key={index}
            className='flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50/50 transition-colors duration-200 cursor-pointer'
            onClick={() => navigate('/interview')}
          >
            <img
              src={item.image}
              alt={item.mode}
              className='w-11 h-11 object-contain rounded-lg'
            />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-semibold text-gray-800 truncate'>{item.role}</p>
              <p className='text-xs text-gray-500 mt-0.5'>{item.date}</p>
            </div>
            <div className='flex flex-col items-end gap-1'>
              <span className='text-xs text-gray-500 font-medium'>{item.mode}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${difficultyColor[item.difficulty]}`}>
                {item.difficulty}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}

export default UpcomingInterviews
