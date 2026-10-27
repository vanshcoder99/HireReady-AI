import React from 'react'
import { BsQuestionCircle, BsCheckCircleFill } from 'react-icons/bs'
import DashboardCard from './DashboardCard'

// Mock data — replace with API data when backend is ready
const quizzes = [
  {
    title: 'JavaScript Fundamentals',
    score: 8,
    total: 10,
    date: 'Jul 22',
    category: 'JavaScript',
  },
  {
    title: 'React Hooks & State',
    score: 7,
    total: 10,
    date: 'Jul 20',
    category: 'React',
  },
  {
    title: 'CSS Flexbox & Grid',
    score: 9,
    total: 10,
    date: 'Jul 18',
    category: 'CSS',
  },
  {
    title: 'Node.js Basics',
    score: 6,
    total: 10,
    date: 'Jul 16',
    category: 'Backend',
  },
]

const categoryColors = {
  JavaScript: 'bg-yellow-100 text-yellow-700',
  React: 'bg-cyan-100 text-cyan-700',
  CSS: 'bg-pink-100 text-pink-700',
  Backend: 'bg-green-100 text-green-700',
}

function RecentQuizzes() {
  return (
    <DashboardCard
      title='Recent Quizzes'
      icon={<BsQuestionCircle size={20} />}
      delay={0.35}
      action={
        <button className='text-xs text-emerald-600 font-semibold hover:underline cursor-pointer'>
          View All
        </button>
      }
    >
      <div className='space-y-3'>
        {quizzes.map((quiz, index) => {
          const percent = (quiz.score / quiz.total) * 100
          return (
            <div
              key={index}
              className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200'
            >
              <div className='flex-shrink-0'>
                <BsCheckCircleFill
                  size={20}
                  className={percent >= 80 ? 'text-emerald-500' : percent >= 60 ? 'text-amber-500' : 'text-red-400'}
                />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800 truncate'>{quiz.title}</p>
                <div className='flex items-center gap-2 mt-1'>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[quiz.category] || 'bg-gray-100 text-gray-600'}`}>
                    {quiz.category}
                  </span>
                  <span className='text-xs text-gray-400'>{quiz.date}</span>
                </div>
              </div>
              <div className='text-right flex-shrink-0'>
                <p className='text-sm font-bold text-gray-800'>{quiz.score}/{quiz.total}</p>
                <div className='w-16 bg-gray-200 h-1.5 rounded-full mt-1'>
                  <div
                    className={`h-full rounded-full ${percent >= 80 ? 'bg-emerald-500' : percent >= 60 ? 'bg-amber-500' : 'bg-red-400'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardCard>
  )
}

export default RecentQuizzes
