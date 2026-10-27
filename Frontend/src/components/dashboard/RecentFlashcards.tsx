import React from 'react'
import { BsLayers, BsCheck2Circle } from 'react-icons/bs'
import DashboardCard from './DashboardCard'

// Mock data — replace with API data when backend is ready
const flashcardSets = [
  {
    topic: 'React Hooks',
    cards: 25,
    mastered: 18,
    lastStudied: '2h ago',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    topic: 'JavaScript ES6+',
    cards: 30,
    mastered: 22,
    lastStudied: '1d ago',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    topic: 'System Design',
    cards: 20,
    mastered: 8,
    lastStudied: '3d ago',
    color: 'from-purple-500 to-pink-500',
  },
  {
    topic: 'Data Structures',
    cards: 35,
    mastered: 15,
    lastStudied: '5d ago',
    color: 'from-emerald-500 to-teal-500',
  },
]

function RecentFlashcards() {
  return (
    <DashboardCard
      title='Recent Flashcards'
      icon={<BsLayers size={20} />}
      delay={0.45}
      action={
        <button className='text-xs text-emerald-600 font-semibold hover:underline cursor-pointer'>
          View All
        </button>
      }
    >
      <div className='grid grid-cols-2 gap-3'>
        {flashcardSets.map((set, index) => {
          const masteryPercent = Math.round((set.mastered / set.cards) * 100)
          return (
            <div
              key={index}
              className='relative p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden'
            >
              {/* Gradient accent strip */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${set.color}`} />

              <h4 className='text-sm font-semibold text-gray-800 mt-1 mb-2 truncate'>{set.topic}</h4>

              <div className='flex items-center gap-1 mb-2'>
                <BsCheck2Circle size={12} className='text-emerald-500' />
                <span className='text-xs text-gray-600'>
                  {set.mastered}/{set.cards} mastered
                </span>
              </div>

              <div className='bg-gray-200 h-1.5 rounded-full overflow-hidden mb-2'>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${set.color}`}
                  style={{ width: `${masteryPercent}%` }}
                />
              </div>

              <span className='text-xs text-gray-400'>{set.lastStudied}</span>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}

export default RecentFlashcards
