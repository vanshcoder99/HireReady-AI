import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { ServerUrl } from '../../App.jsx'
import { setUserData } from '../../redux/userSlice.js'
import { 
  BsRobot, 
  BsGrid, 
  BsMic, 
  BsFileEarmarkText, 
  BsFileEarmark, 
  BsLayers, 
  BsQuestionCircle, 
  BsMap, 
  BsPeople, 
  BsBarChart, 
  BsPerson, 
  BsBoxArrowRight, 
  BsCoin, 
  BsList, 
  BsX,
  BsSliders,
  BsSunFill,
  BsMoonStarsFill
} from 'react-icons/bs'

const learnerNavItems = [
  { label: 'Dashboard', icon: <BsGrid size={18} />, path: '/dashboard' },
  { label: 'AI Interviews', icon: <BsMic size={18} />, path: '/interview' },
  { label: 'Documents', icon: <BsFileEarmarkText size={18} />, path: '/documents' },
  { label: 'Resume', icon: <BsFileEarmark size={18} />, path: '/resume' },
  { label: 'Flashcards', icon: <BsLayers size={18} />, path: '/flashcards' },
  { label: 'Quizzes', icon: <BsQuestionCircle size={18} />, path: '/quizzes' },
  { label: 'Roadmaps', icon: <BsMap size={18} />, path: '/roadmaps' },
  { label: 'Human Interviews', icon: <BsPeople size={18} />, path: '/human-interviews' },
  { label: 'Analytics', icon: <BsBarChart size={18} />, path: '/analytics' },
]

const interviewerNavItems = [
  { label: 'Interviewer Portal', icon: <BsGrid size={18} />, path: '/interviewer/dashboard' },
  { label: 'Live Mock Sessions', icon: <BsPeople size={18} />, path: '/human-interviews' },
  { label: 'My Credentials', icon: <BsSliders size={18} />, path: '/interviewer/profile' },
  { label: 'Analytics', icon: <BsBarChart size={18} />, path: '/analytics' },
]

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)

  const currentRole = userData?.user?.role || 'learner'
  const credits = userData?.user?.credits || 0
  const userName = userData?.user?.name || 'User'

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark'
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  const handleToggleRole = async (newRole) => {
    if (newRole === currentRole || switchingRole) return
    setSwitchingRole(true)
    try {
      const res = await axios.post(`${ServerUrl}/api/user/role`, { role: newRole }, { withCredentials: true })
      if (res.data?.user) {
        dispatch(setUserData({ user: res.data.user }))
        navigate(newRole === 'interviewer' ? '/interviewer/dashboard' : '/dashboard')
      }
    } catch (err) {
      console.error('Role switch error:', err)
    } finally {
      setSwitchingRole(false)
    }
  }

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + '/api/auth/logout', { withCredentials: true })
      dispatch(setUserData(null))
      navigate('/')
    } catch (error) {
      console.log(error)
    }
  }

  const handleNavClick = (path) => {
    if (path) {
      navigate(path)
      setMobileOpen(false)
    }
  }

  const isActive = (itemPath) => {
    if (!itemPath) return false
    return location.pathname === itemPath || location.pathname.startsWith(itemPath + '/')
  }

  const activeNavItems = currentRole === 'interviewer' ? interviewerNavItems : learnerNavItems

  const sidebarContent = (
    <div className='flex flex-col h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300'>
      {/* Logo & Brand */}
      <div className='px-5 pt-6 pb-4 space-y-4'>
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/')}
          className='flex items-center gap-2.5 cursor-pointer group'
        >
          <div className='bg-black dark:bg-emerald-600 text-white p-2 rounded-xl shadow-xs group-hover:scale-105 transition-transform'>
            <BsRobot size={18} />
          </div>
          <span className='font-bold text-gray-900 dark:text-white text-lg'>
            HireReady<span className='text-emerald-600 dark:text-emerald-400'>.AI</span>
          </span>
        </motion.div>

        {/* Role Switcher Pill */}
        <div className='bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-gray-200/80 dark:border-gray-700/80'>
          <button
            onClick={() => handleToggleRole('learner')}
            disabled={switchingRole}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              currentRole === 'learner'
                ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-xs border border-gray-200/60 dark:border-gray-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Candidate
          </button>
          <button
            onClick={() => handleToggleRole('interviewer')}
            disabled={switchingRole}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              currentRole === 'interviewer'
                ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-xs border border-gray-200/60 dark:border-gray-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Interviewer
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className='flex-1 px-3 space-y-0.5 overflow-y-auto'>
        {activeNavItems.map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ x: 3 }}
            onClick={() => handleNavClick(item.path)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
              ${
                isActive(item.path)
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/80 font-bold'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <span className={isActive(item.path) ? 'text-emerald-600 dark:text-emerald-400' : ''}>{item.icon}</span>
            <span className='flex-1 text-left'>{item.label}</span>
          </motion.button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className='px-3 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3 mt-2'>
        {currentRole === 'learner' && (
          <div className='flex items-center gap-3 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 dark:border-emerald-800/60'>
            <BsCoin size={16} className='text-emerald-600 dark:text-emerald-400' />
            <div className='flex-1'>
              <p className='text-xs text-gray-500 dark:text-gray-400'>Credits</p>
              <p className='text-sm font-bold text-emerald-700 dark:text-emerald-300'>{credits}</p>
            </div>
            <button
              onClick={() => {
                navigate('/pricing')
                setMobileOpen(false)
              }}
              className='text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition'
            >
              Buy
            </button>
          </div>
        )}

        {/* Theme Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className='w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer'
        >
          <span className='flex items-center gap-2'>
            {isDark ? <BsSunFill size={15} className='text-amber-400' /> : <BsMoonStarsFill size={14} className='text-gray-600' />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </span>
          <span className='text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full'>
            {isDark ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            navigate(currentRole === 'interviewer' ? '/interviewer/profile' : '/profile')
            setMobileOpen(false)
          }}
          className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer'
        >
          <div className='w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold'>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className='flex-1 text-left min-w-0'>
            <p className='font-medium text-gray-800 dark:text-gray-200 text-xs truncate'>{userName}</p>
            <p className='text-[10px] text-gray-400 font-semibold capitalize'>{currentRole}</p>
          </div>
          <BsPerson size={16} />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer'
        >
          <BsBoxArrowRight size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className='hidden lg:flex flex-col w-[260px] h-screen bg-white dark:bg-gray-900 border-r border-gray-200/90 dark:border-gray-800 fixed left-0 top-0 z-30 transition-colors duration-300'>
        {sidebarContent}
      </aside>

      {/* Mobile Top Header */}
      <div className='lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between transition-colors duration-300'>
        <div onClick={() => navigate('/')} className='flex items-center gap-2 cursor-pointer'>
          <div className='bg-black dark:bg-emerald-600 text-white p-1.5 rounded-lg'>
            <BsRobot size={16} />
          </div>
          <span className='font-bold text-gray-900 dark:text-white text-base'>
            HireReady<span className='text-emerald-600 dark:text-emerald-400'>.AI</span>
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={toggleTheme}
            className='p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer'
          >
            {isDark ? <BsSunFill size={16} className='text-amber-400' /> : <BsMoonStarsFill size={15} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className='p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition cursor-pointer'
          >
            {mobileOpen ? <BsX size={24} /> : <BsList size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className='lg:hidden fixed inset-0 z-50 flex'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className='fixed inset-0 bg-black/40 backdrop-blur-xs'
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='relative w-[270px] h-full bg-white dark:bg-gray-900 z-10 shadow-2xl flex flex-col'
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar
