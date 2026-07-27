import React from 'react'
import { BsFileEarmarkText } from 'react-icons/bs'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import DashboardCard from './DashboardCard'
import resumeImg from '../../assets/resume.png'

// Mock data — replace with API data when backend is ready
const resumeData = {
  score: 72,
  strengths: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
  improvements: ['System Design', 'Testing', 'TypeScript'],
}

function ResumeScore() {
  return (
    <DashboardCard title='Resume Score' icon={<BsFileEarmarkText size={20} />} delay={0.25}>
      <div className='flex items-center gap-5 mb-5'>
        <div className='w-20 h-20 flex-shrink-0'>
          <CircularProgressbar
            value={resumeData.score}
            text={`${resumeData.score}%`}
            styles={buildStyles({
              textSize: '22px',
              pathColor: resumeData.score >= 70 ? '#22c55e' : resumeData.score >= 50 ? '#f59e0b' : '#ef4444',
              textColor: '#1f2937',
              trailColor: '#e5e7eb',
              pathTransitionDuration: 1,
            })}
          />
        </div>
        <div>
          <p className='text-sm font-medium text-gray-700 mb-1'>
            {resumeData.score >= 70 ? 'Strong Resume' : resumeData.score >= 50 ? 'Needs Work' : 'Needs Improvement'}
          </p>
          <p className='text-xs text-gray-500'>Based on AI analysis</p>
          <img src={resumeImg} alt='Resume' className='w-10 h-10 object-contain mt-2 opacity-60' />
        </div>
      </div>

      <div className='space-y-3'>
        <div>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>Matched Skills</p>
          <div className='flex flex-wrap gap-1.5'>
            {resumeData.strengths.map((skill, i) => (
              <span key={i} className='bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium'>
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>To Improve</p>
          <div className='flex flex-wrap gap-1.5'>
            {resumeData.improvements.map((area, i) => (
              <span key={i} className='bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium'>
                {area}
              </span>
            ))}
          </div>
        </div>
      </div>
    </DashboardCard>
  )
}

export default ResumeScore
