import React from 'react'
import { motion } from 'motion/react'
import { 
  BsGraphUp, 
  BsCalendar3, 
  BsClock, 
  BsLightning, 
  BsTrophy,
  BsStarFill,
  BsCheckCircleFill,
  BsArrowUpRight,
  BsBarChart,
  BsBook,
  BsLayers
} from 'react-icons/bs'

const weeklyData = [
  { day: 'Mon', interviews: 2, studyHrs: 1.5 },
  { day: 'Tue', interviews: 1, studyHrs: 2.0 },
  { day: 'Wed', interviews: 3, studyHrs: 1.0 },
  { day: 'Thu', interviews: 0, studyHrs: 0.5 },
  { day: 'Fri', interviews: 2, studyHrs: 2.5 },
  { day: 'Sat', interviews: 4, studyHrs: 3.0 },
  { day: 'Sun', interviews: 1, studyHrs: 1.5 },
]

const heatmapWeeks = Array.from({ length: 12 }, () =>
  Array.from({ length: 7 }, () => Math.floor(Math.random() * 4))
)

const skillsMastered = [
  { name: 'JavaScript', level: 92, color: 'bg-amber-500' },
  { name: 'React.js', level: 85, color: 'bg-blue-500' },
  { name: 'Node.js', level: 78, color: 'bg-emerald-500' },
  { name: 'System Design', level: 55, color: 'bg-purple-500' },
  { name: 'DSA', level: 68, color: 'bg-rose-500' },
  { name: 'MongoDB', level: 72, color: 'bg-teal-500' },
]

const achievements = [
  { title: 'First Interview', unlocked: true },
  { title: '10 Interviews', unlocked: true },
  { title: 'Resume Pro', unlocked: true },
  { title: 'Quiz Master', unlocked: false },
  { title: '50 Flashcards', unlocked: false },
  { title: '30-Day Streak', unlocked: false },
]

function Analytics() {
  const maxInterviews = Math.max(...weeklyData.map(d => d.interviews), 1)
  const maxStudy = Math.max(...weeklyData.map(d => d.studyHrs), 1)

  return (
    <div className='py-2 space-y-8'>
      {/* Page Header */}
      <div>
        <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
          Analytics & Progress
        </h1>
        <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
          Track your placement preparation journey with detailed insights.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        {[
          { label: 'Total Interviews', value: '13', change: '+3 this week', icon: <BsBarChart size={18} />, color: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800/60' },
          { label: 'Study Hours', value: '12h', change: '+4h this week', icon: <BsClock size={18} />, color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/60' },
          { label: 'Skills Mastered', value: '6', change: '78% avg level', icon: <BsLightning size={18} />, color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-800/60' },
          { label: 'Current Streak', value: '7 days', change: 'Best: 14 days', icon: <BsCalendar3 size={18} />, color: 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800/60' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-2 transition-colors duration-300'
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${stat.color}`}>
              {stat.icon}
            </div>
            <p className='text-xs text-gray-400 dark:text-gray-400 font-semibold uppercase tracking-wider'>{stat.label}</p>
            <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>{stat.value}</p>
            <p className='text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1'>
              <BsArrowUpRight size={10} />
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Interview Bar Graph + Study Time */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* Weekly Interviews Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-7 shadow-sm space-y-6 transition-colors duration-300'
        >
          <div className='flex items-center justify-between'>
            <h3 className='font-bold text-gray-900 dark:text-white text-base'>Weekly Interviews</h3>
            <span className='text-xs text-gray-400 dark:text-gray-400 font-medium'>This Week</span>
          </div>
          <div className='flex items-end justify-between gap-3 h-40'>
            {weeklyData.map((d, i) => (
              <div key={i} className='flex-1 flex flex-col items-center gap-2'>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.interviews / maxInterviews) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
                  className='w-full bg-emerald-500 rounded-xl min-h-[4px] relative group cursor-pointer hover:bg-emerald-600 transition-colors'
                >
                  <span className='absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity'>
                    {d.interviews}
                  </span>
                </motion.div>
                <span className='text-[10px] text-gray-500 dark:text-gray-400 font-semibold'>{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Study Time Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-7 shadow-sm space-y-6 transition-colors duration-300'
        >
          <div className='flex items-center justify-between'>
            <h3 className='font-bold text-gray-900 dark:text-white text-base'>Study Time</h3>
            <span className='text-xs text-gray-400 dark:text-gray-400 font-medium'>Hours / Day</span>
          </div>
          <div className='flex items-end justify-between gap-3 h-40'>
            {weeklyData.map((d, i) => (
              <div key={i} className='flex-1 flex flex-col items-center gap-2'>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.studyHrs / maxStudy) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.05 }}
                  className='w-full bg-blue-500 rounded-xl min-h-[4px] relative group cursor-pointer hover:bg-blue-600 transition-colors'
                >
                  <span className='absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity'>
                    {d.studyHrs}h
                  </span>
                </motion.div>
                <span className='text-[10px] text-gray-500 dark:text-gray-400 font-semibold'>{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Skills Mastered */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-6 transition-colors duration-300'
      >
        <div className='flex items-center gap-2'>
          <BsLightning size={18} className='text-amber-500' />
          <h3 className='font-bold text-gray-900 dark:text-white text-lg'>Skills Mastered</h3>
        </div>
        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {skillsMastered.map((skill, i) => (
            <div key={i} className='space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='font-semibold text-gray-800 dark:text-gray-200'>{skill.name}</span>
                <span className='font-bold text-gray-600 dark:text-gray-400'>{skill.level}%</span>
              </div>
              <div className='w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                  className={`h-full rounded-full ${skill.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-6 transition-colors duration-300'
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <BsCalendar3 size={16} className='text-emerald-600 dark:text-emerald-400' />
            <h3 className='font-bold text-gray-900 dark:text-white text-lg'>Activity Heatmap</h3>
          </div>
          <div className='flex items-center gap-2 text-[10px] text-gray-400 font-medium'>
            <span>Less</span>
            <div className='flex gap-0.5'>
              <div className='w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm' />
              <div className='w-3 h-3 bg-emerald-200 dark:bg-emerald-900 rounded-sm' />
              <div className='w-3 h-3 bg-emerald-400 dark:bg-emerald-700 rounded-sm' />
              <div className='w-3 h-3 bg-emerald-600 dark:bg-emerald-500 rounded-sm' />
            </div>
            <span>More</span>
          </div>
        </div>

        <div className='flex gap-1.5 overflow-x-auto pb-2'>
          {heatmapWeeks.map((week, wi) => (
            <div key={wi} className='flex flex-col gap-1.5'>
              {week.map((level, di) => {
                const colors = ['bg-gray-100 dark:bg-gray-800', 'bg-emerald-200 dark:bg-emerald-900/60', 'bg-emerald-400 dark:bg-emerald-700', 'bg-emerald-600 dark:bg-emerald-500']
                return (
                  <div
                    key={di}
                    className={`w-4 h-4 rounded-sm ${colors[level]} transition-colors cursor-pointer hover:ring-2 hover:ring-emerald-300`}
                    title={`Week ${wi + 1}, Day ${di + 1}: ${level} activity`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-5 transition-colors duration-300'
      >
        <div className='flex items-center gap-2'>
          <BsTrophy size={18} className='text-amber-500' />
          <h3 className='font-bold text-gray-900 dark:text-white text-lg'>Achievements</h3>
        </div>
        <div className='flex flex-wrap gap-3'>
          {achievements.map((a, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border ${
                a.unlocked
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
              }`}
            >
              {a.unlocked ? <BsCheckCircleFill size={12} className='text-emerald-500' /> : <BsStarFill size={12} className='text-gray-300 dark:text-gray-600' />}
              {a.title}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Analytics
