import React from 'react'
import { BsBarChart } from 'react-icons/bs'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'
import DashboardCard from './DashboardCard'
import aiImg from '../../assets/ai-ans.png'

// Mock data — replace with API data when backend is ready
const weeklyData = [
  { day: 'Mon', score: 6.5 },
  { day: 'Tue', score: 7.0 },
  { day: 'Wed', score: 6.8 },
  { day: 'Thu', score: 7.5 },
  { day: 'Fri', score: 7.2 },
  { day: 'Sat', score: 8.0 },
  { day: 'Sun', score: 7.8 },
]

const stats = {
  total: 12,
  completed: 8,
  avgScore: 7.2,
  improvement: '+1.3',
}

function InterviewProgress() {
  return (
    <DashboardCard title='Interview Progress' icon={<BsBarChart size={20} />} delay={0.15}>
      <div className='flex items-center gap-4 mb-5'>
        <img src={aiImg} alt='AI Evaluation' className='w-16 h-16 object-contain rounded-xl' />
        <div>
          <p className='text-3xl font-bold text-gray-800'>{stats.avgScore}<span className='text-lg text-gray-400'>/10</span></p>
          <p className='text-sm text-emerald-600 font-medium'>{stats.improvement} this week</p>
        </div>
      </div>

      <div className='h-24 mb-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={weeklyData}>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [`${value}/10`, 'Score']}
            />
            <Area
              type='monotone'
              dataKey='score'
              stroke='#22c55e'
              fill='#dcfce7'
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='bg-gray-50 rounded-xl p-3 text-center'>
          <p className='text-xl font-bold text-gray-800'>{stats.total}</p>
          <p className='text-xs text-gray-500'>Total</p>
        </div>
        <div className='bg-emerald-50 rounded-xl p-3 text-center'>
          <p className='text-xl font-bold text-emerald-600'>{stats.completed}</p>
          <p className='text-xs text-gray-500'>Completed</p>
        </div>
      </div>
    </DashboardCard>
  )
}

export default InterviewProgress
