import React from 'react'
import { BsRobot, BsTwitterX, BsLinkedin, BsGithub } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

function Footer() {
  const navigate = useNavigate()

  return (
    <footer className='bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-400 pt-16 pb-10 px-6 mt-12 relative overflow-hidden border-t border-gray-200/80 dark:border-gray-800/80 transition-colors duration-300'>
      {/* Background ambient lighting */}
      <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-gradient-to-t from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none' />

      <div className='max-w-6xl mx-auto relative z-10'>
        {/* Main Footer Grid */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 pb-14 border-b border-gray-200/80 dark:border-gray-800/80'>
          
          {/* Brand Column */}
          <div className='md:col-span-2 space-y-4'>
            <div 
              onClick={() => navigate('/')}
              className='flex items-center gap-2.5 cursor-pointer inline-flex group'
            >
              <div className='bg-black dark:bg-emerald-600 text-white p-2.5 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 group-hover:scale-105 transition-all duration-300'>
                <BsRobot size={20} />
              </div>
              <span className='font-extrabold text-gray-900 dark:text-white text-xl tracking-tight'>
                HireReady<span className='text-emerald-600 dark:text-emerald-400'>.AI</span>
              </span>
            </div>

            <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-sm font-normal'>
              AI-powered placement preparation platform designed to improve communication skills, technical depth, and professional confidence.
            </p>

            <div className='flex items-center gap-3 pt-2'>
              <a href='#' className='w-9 h-9 bg-gray-100 dark:bg-gray-900 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-emerald-500'>
                <BsTwitterX size={15} />
              </a>
              <a href='#' className='w-9 h-9 bg-gray-100 dark:bg-gray-900 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-emerald-500'>
                <BsLinkedin size={15} />
              </a>
              <a href='#' className='w-9 h-9 bg-gray-100 dark:bg-gray-900 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-emerald-500'>
                <BsGithub size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div className='space-y-3.5'>
            <h4 className='font-bold text-xs tracking-wider uppercase text-emerald-600 dark:text-emerald-400'>Platform</h4>
            <ul className='space-y-2.5 text-sm'>
              <li>
                <button onClick={() => navigate('/interview')} className='hover:text-emerald-600 dark:hover:text-white transition cursor-pointer'>
                  AI Mock Interviews
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/resume')} className='hover:text-emerald-600 dark:hover:text-white transition cursor-pointer'>
                  Resume Analysis
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/flashcards')} className='hover:text-emerald-600 dark:hover:text-white transition cursor-pointer'>
                  Smart Flashcards
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/quizzes')} className='hover:text-emerald-600 dark:hover:text-white transition cursor-pointer'>
                  Practice Quizzes
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div className='space-y-3.5'>
            <h4 className='font-bold text-xs tracking-wider uppercase text-emerald-600 dark:text-emerald-400'>Navigation</h4>
            <ul className='space-y-2.5 text-sm'>
              <li>
                <button onClick={() => navigate('/pricing')} className='hover:text-emerald-600 dark:hover:text-white transition cursor-pointer'>
                  Pricing Plans
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/features')} className='hover:text-emerald-600 dark:hover:text-white transition cursor-pointer'>
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className='hover:text-emerald-600 dark:hover:text-white transition cursor-pointer'>
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/history')} className='hover:text-emerald-600 dark:hover:text-white transition cursor-pointer'>
                  Interview History
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className='space-y-3.5'>
            <h4 className='font-bold text-xs tracking-wider uppercase text-emerald-600 dark:text-emerald-400'>Resources</h4>
            <ul className='space-y-2.5 text-sm'>
              <li>
                <a href='#' className='hover:text-emerald-600 dark:hover:text-white transition'>Privacy Policy</a>
              </li>
              <li>
                <a href='#' className='hover:text-emerald-600 dark:hover:text-white transition'>Terms of Service</a>
              </li>
              <li>
                <div className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60 mt-1'>
                  <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse' />
                  <span>AI Engine Online</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Row */}
        <div className='pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 font-normal'>
          <p>© {new Date().getFullYear()} HireReady.AI. All rights reserved.</p>
          <p className='text-gray-500 dark:text-gray-400'>Designed for Placement Excellence</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer