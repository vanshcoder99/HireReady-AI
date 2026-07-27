import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { BsRobot } from 'react-icons/bs'
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi'
import AuthModel from '../AuthModel.jsx'

function LandingNavbar() {
  const { userData } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)

  const handleCTA = () => {
    if (userData) {
      navigate('/dashboard')
    } else {
      setShowAuth(true)
    }
  }

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  const scrollToPricing = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenu(false)
  }

  return (
    <>
      <nav className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className='flex items-center gap-2.5 cursor-pointer'
          >
            <div className='bg-black dark:bg-emerald-600 text-white p-2 rounded-xl shadow-xs'>
              <BsRobot size={18} />
            </div>
            <span className='font-bold text-gray-900 dark:text-white text-lg'>
              HireReady<span className='text-emerald-600 dark:text-emerald-400'>.AI</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className='hidden md:flex items-center gap-8'>
            <button
              onClick={scrollToFeatures}
              className='text-sm text-gray-600 hover:text-gray-900 transition cursor-pointer'
            >
              Features
            </button>
            <button
              onClick={scrollToPricing}
              className='text-sm text-gray-600 hover:text-gray-900 transition cursor-pointer'
            >
              How It Works
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className='text-sm text-gray-600 hover:text-gray-900 transition cursor-pointer'
            >
              Pricing
            </button>
          </div>

          {/* Desktop CTA */}
          <div className='hidden md:flex items-center gap-3'>
            {userData ? (
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-700 transition'
              >
                Dashboard
              </motion.button>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth(true)}
                  className='text-sm text-gray-600 hover:text-gray-900 transition cursor-pointer'
                >
                  Log in
                </button>
                <motion.button
                  onClick={handleCTA}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:bg-emerald-700 transition'
                >
                  Get Started
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className='md:hidden text-gray-700 cursor-pointer'
          >
            {mobileMenu ? <HiX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3'
          >
            <button onClick={scrollToFeatures} className='block w-full text-left text-sm text-gray-600 py-2 cursor-pointer'>Features</button>
            <button onClick={scrollToPricing} className='block w-full text-left text-sm text-gray-600 py-2 cursor-pointer'>How It Works</button>
            <button onClick={() => { navigate('/pricing'); setMobileMenu(false) }} className='block w-full text-left text-sm text-gray-600 py-2 cursor-pointer'>Pricing</button>
            <button
              onClick={() => { handleCTA(); setMobileMenu(false) }}
              className='w-full bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-semibold cursor-pointer'
            >
              {userData ? 'Dashboard' : 'Get Started'}
            </button>
          </motion.div>
        )}
      </nav>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  )
}

export default LandingNavbar
