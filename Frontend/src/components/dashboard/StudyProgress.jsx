import React from 'react'
import { BsBook, BsFire, BsLightning } from 'react-icons/bs'
import DashboardCard from './DashboardCard'
import confiImg from '../../assets/confi.png'

// Mock data — replace with API data when backend is ready
const studyStats = {
  topicsCovered: 15,
  totalTopics: 25,
  practiceHours: 24,
  streak: 5,
  flashcardsReviewed: 120,
}

function StudyProgress() {
  const progressPercent = (studyStats.topicsCovered / studyStats.totalTopics) * 100

  return (
    <DashboardCard title='Study Progress' icon={<BsBook size={20} />} delay={0.2}>
      <div className='flex items-center gap-4 mb-5'>
        <img src={confiImg} alt='Confidence' className='w-14 h-14 object-contain rounded-xl' />
        <div className='flex-1'>
          <div className='flex justify-between items-center mb-1.5'>
            <span className='text-sm font-medium text-gray-700'>Topics Mastered</span>
            <span className='text-sm font-bold text-emerald-600'>{studyStats.topicsCovered}/{studyStats.totalTopics}</span>
          </div>
          <div className='bg-gray-200 h-2.5 rounded-full overflow-hidden'>
            <div
              className='bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500'
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-3'>
        <div className='bg-orange-50 rounded-xl p-3 text-center'>
          <div className='flex items-center justify-center gap-1 mb-1'>
            <BsFire className='text-orange-500' size={14} />
            <span className='text-lg font-bold text-gray-800'>{studyStats.streak}</span>
          </div>
          <p className='text-xs text-gray-500'>Day Streak</p>
        </div>
        <div className='bg-blue-50 rounded-xl p-3 text-center'>
          <div className='flex items-center justify-center gap-1 mb-1'>
            <BsLightning className='text-blue-500' size={14} />
            <span className='text-lg font-bold text-gray-800'>{studyStats.practiceHours}</span>
          </div>
          <p className='text-xs text-gray-500'>Hours</p>
        </div>
        <div className='bg-green-50 rounded-xl p-3 text-center'>
          <div className='flex items-center justify-center gap-1 mb-1'>
            <BsBook className='text-green-500' size={14} />
            <span className='text-lg font-bold text-gray-800'>{studyStats.flashcardsReviewed}</span>
          </div>
          <p className='text-xs text-gray-500'>Cards</p>
        </div>
      </div>
    </DashboardCard>
  )
}

export default StudyProgress
