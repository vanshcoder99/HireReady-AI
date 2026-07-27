import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'motion/react'
import { 
  BsPerson, 
  BsEnvelope, 
  BsCoin, 
  BsTrophy, 
  BsMic, 
  BsFileEarmark,
  BsShieldLock,
  BsCheckCircleFill,
  BsStarFill,
  BsLightning,
  BsGraphUp,
  BsLayers,
  BsBook,
  BsCalendar3
} from 'react-icons/bs'

const mockAchievements = [
  { id: 1, title: 'First Interview', desc: 'Completed your first AI mock interview', icon: <BsMic size={16} />, unlocked: true, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 2, title: '10 Interviews', desc: 'Completed 10 AI mock interviews', icon: <BsLightning size={16} />, unlocked: true, color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { id: 3, title: 'Resume Uploaded', desc: 'Uploaded and analyzed your resume', icon: <BsFileEarmark size={16} />, unlocked: true, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 4, title: 'Quiz Master', desc: 'Scored 100% on any quiz', icon: <BsTrophy size={16} />, unlocked: false, color: 'bg-gray-100 text-gray-400 border-gray-200' },
  { id: 5, title: 'Flashcard Pro', desc: 'Mastered 50 flashcards', icon: <BsLayers size={16} />, unlocked: false, color: 'bg-gray-100 text-gray-400 border-gray-200' },
  { id: 6, title: '30-Day Streak', desc: 'Practiced 30 days in a row', icon: <BsCalendar3 size={16} />, unlocked: false, color: 'bg-gray-100 text-gray-400 border-gray-200' },
]

function Profile() {
  const { userData } = useSelector((state) => state.user)
  const user = userData?.user || { name: 'Vansh Nagpal', email: 'vansh@example.com', credits: 350 }

  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showSuccess, setShowSuccess] = useState(false)

  const handlePasswordChange = (e) => {
    e.preventDefault()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    setPasswordForm({ current: '', newPass: '', confirm: '' })
  }

  const interviewStats = { total: 12, avgScore: 78, bestScore: 94, recentTrend: '+5%' }
  const resumeStats = { version: 3, atsScore: 68, lastAnalyzed: 'Jul 22, 2026' }

  return (
    <div className='py-2 space-y-8'>
      {/* Page Header */}
      <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight'>Profile</h1>

      {/* Top Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white border border-gray-200/90 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6'
      >
        {/* Avatar */}
        <div className='w-24 h-24 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-emerald-600/20 flex-shrink-0'>
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        <div className='flex-1 text-center sm:text-left space-y-3'>
          <div>
            <h2 className='text-2xl font-extrabold text-gray-900'>{user.name}</h2>
            <p className='text-gray-500 text-sm flex items-center gap-1.5 justify-center sm:justify-start mt-1'>
              <BsEnvelope size={13} />
              <span>{user.email}</span>
            </p>
          </div>

          {/* Quick Stat Pills */}
          <div className='flex flex-wrap gap-3 justify-center sm:justify-start pt-2'>
            <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-4 py-2 rounded-full border border-emerald-200 inline-flex items-center gap-1.5'>
              <BsCoin size={13} />
              {user.credits} Credits
            </span>
            <span className='bg-blue-50 text-blue-700 text-xs font-bold px-4 py-2 rounded-full border border-blue-200 inline-flex items-center gap-1.5'>
              <BsMic size={13} />
              {interviewStats.total} Interviews
            </span>
            <span className='bg-purple-50 text-purple-700 text-xs font-bold px-4 py-2 rounded-full border border-purple-200 inline-flex items-center gap-1.5'>
              <BsStarFill size={13} />
              3 Achievements
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        {[
          { label: 'Total Interviews', value: interviewStats.total, sub: `Avg Score: ${interviewStats.avgScore}%`, icon: <BsMic size={18} />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
          { label: 'Best Score', value: `${interviewStats.bestScore}%`, sub: `Trend: ${interviewStats.recentTrend}`, icon: <BsGraphUp size={18} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
          { label: 'Resume Version', value: `v${resumeStats.version}`, sub: `ATS: ${resumeStats.atsScore}%`, icon: <BsFileEarmark size={18} />, color: 'bg-amber-50 text-amber-600 border-amber-100' },
          { label: 'Last Analyzed', value: resumeStats.lastAnalyzed, sub: 'Resume Analysis', icon: <BsBook size={18} />, color: 'bg-purple-50 text-purple-600 border-purple-100' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className='bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-2'
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
              {stat.icon}
            </div>
            <p className='text-xs text-gray-400 font-semibold uppercase tracking-wider'>{stat.label}</p>
            <p className='text-xl font-extrabold text-gray-900'>{stat.value}</p>
            <p className='text-xs text-gray-500'>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='bg-white border border-gray-200/90 rounded-3xl p-8 shadow-sm space-y-6'
      >
        <div className='flex items-center gap-2'>
          <BsTrophy size={18} className='text-amber-500' />
          <h3 className='font-bold text-gray-900 text-lg'>Achievements</h3>
        </div>

        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {mockAchievements.map((ach, i) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border ${ach.color} ${!ach.unlocked ? 'opacity-50' : ''}`}
            >
              <div className='mt-0.5 flex-shrink-0'>{ach.icon}</div>
              <div>
                <p className='text-sm font-bold'>{ach.title}</p>
                <p className='text-xs opacity-70 mt-0.5'>{ach.desc}</p>
              </div>
              {ach.unlocked && <BsCheckCircleFill size={14} className='text-emerald-500 ml-auto flex-shrink-0 mt-1' />}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='bg-white border border-gray-200/90 rounded-3xl p-8 shadow-sm space-y-6 max-w-xl'
      >
        <div className='flex items-center gap-2'>
          <BsShieldLock size={18} className='text-gray-600' />
          <h3 className='font-bold text-gray-900 text-lg'>Change Password</h3>
        </div>

        {showSuccess && (
          <div className='bg-emerald-50 text-emerald-700 text-sm font-semibold p-3 rounded-xl border border-emerald-200 flex items-center gap-2'>
            <BsCheckCircleFill size={14} />
            Password updated successfully.
          </div>
        )}

        <form onSubmit={handlePasswordChange} className='space-y-4'>
          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Current Password</label>
            <input
              type='password'
              value={passwordForm.current}
              onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition'
              placeholder='Enter current password'
              required
            />
          </div>
          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>New Password</label>
            <input
              type='password'
              value={passwordForm.newPass}
              onChange={(e) => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition'
              placeholder='Enter new password'
              required
            />
          </div>
          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Confirm New Password</label>
            <input
              type='password'
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition'
              placeholder='Confirm new password'
              required
            />
          </div>
          <button
            type='submit'
            className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs'
          >
            Update Password
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default Profile
