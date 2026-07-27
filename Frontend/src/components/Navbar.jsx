import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { BsRobot, BsCoin, BsGrid, BsSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { HiOutlineLogout, HiOutlineMenuAlt3, HiX } from 'react-icons/hi';
import { FaUserAstronaut } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ServerUrl } from '../App.jsx';
import { setUserData } from '../redux/userSlice.js';
import AuthModel from './AuthModel.jsx';

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Default theme is LIGHT mode (white theme). Dark mode active only if explicitly set in localStorage.
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + '/api/auth/logout', { withCredentials: true });
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  const handleNavFeatures = () => {
    navigate('/features');
    setMobileMenu(false);
  };

  const handleNavHowItWorks = () => {
    navigate('/how-it-works');
    setMobileMenu(false);
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <>
      {/* Outer fixed positioning wrapper */}
      <div
        className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-300 pointer-events-none ${
          isScrolled ? 'top-3 md:top-4 px-4 md:px-6' : 'top-0 px-0'
        }`}
      >
        {/* Animated Navbar Box */}
        <motion.div
          layout
          initial={false}
          animate={{
            width: isScrolled ? '100%' : '100%',
            maxWidth: isScrolled ? '72rem' : '100%',
            borderRadius: isScrolled ? '9999px' : '0px',
          }}
          transition={{ type: 'spring', stiffness: 240, damping: 25 }}
          className={`pointer-events-auto flex justify-between items-center relative transition-all duration-300 ${
            isScrolled
              ? 'px-5 md:px-7 py-2.5 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-emerald-950/20 border border-gray-200/90 dark:border-gray-800/90'
              : 'px-6 md:px-12 py-3.5 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80'
          }`}
        >
          {/* Left: Brand Logo & Title */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className='flex items-center gap-3 cursor-pointer group'
          >
            <div className='bg-black dark:bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 transition-all duration-300'>
              <BsRobot size={18} />
            </div>
            <h1 className='font-bold text-gray-900 dark:text-white text-lg tracking-tight'>
              HireReady<span className='text-emerald-600 dark:text-emerald-400'>.AI</span>
            </h1>
          </motion.div>

          {/* Center: Nav Links */}
          <div className='hidden md:flex items-center gap-7 lg:gap-8'>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNavFeatures}
              className='text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer'
            >
              Features
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNavHowItWorks}
              className='text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer'
            >
              How It Works
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/pricing')}
              className='text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer'
            >
              Pricing
            </motion.button>
          </div>

          {/* Right Controls: Theme Mode, Credits, Dashboard Button, User Avatar or Auth */}
          <div className='flex items-center gap-2.5 md:gap-3.5 relative'>
            {/* Theme Toggle Button (Light / Dark) */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className='w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700/80 bg-gray-100/80 dark:bg-gray-800/80 text-gray-700 dark:text-amber-400 hover:bg-gray-200/90 dark:hover:bg-gray-700 cursor-pointer shadow-xs transition-all duration-200'
            >
              {isDark ? <BsSunFill size={16} /> : <BsMoonStarsFill size={15} />}
            </motion.button>

            {userData ? (
              <>
                {/* Credits Badge Pill */}
                <div className='relative'>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setShowCreditPopup(!showCreditPopup);
                      setShowUserPopup(false);
                    }}
                    className='flex items-center gap-2 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/50 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-bold text-gray-800 dark:text-emerald-300 transition-all cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs group'
                  >
                    <BsCoin size={17} className='text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-300' />
                    <span>{userData?.user?.credits ?? 0}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showCreditPopup && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className='absolute right-[-40px] md:right-0 mt-3 w-64 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-5 z-50'
                      >
                        <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                          Need more credits to continue interviews?
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowCreditPopup(false);
                            navigate('/pricing');
                          }}
                          className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-semibold cursor-pointer transition shadow-md shadow-emerald-600/20'
                        >
                          Buy more credits
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Dashboard Button (Only available when logged in) */}
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/dashboard')}
                  className='hidden sm:flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 cursor-pointer shadow-xs group'
                >
                  <BsGrid size={15} className='text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:scale-110 transition-all' />
                  <span>Dashboard</span>
                </motion.button>

                {/* User Avatar Circle */}
                <div className='relative'>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      setShowUserPopup(!showUserPopup);
                      setShowCreditPopup(false);
                    }}
                    className='w-9 h-9 bg-black dark:bg-emerald-600 text-white rounded-full cursor-pointer flex items-center justify-center font-bold text-sm shadow-sm hover:ring-2 hover:ring-emerald-500/50 transition-all'
                  >
                    {userData?.user?.name ? (
                      userData.user.name.slice(0, 1).toUpperCase()
                    ) : (
                      <FaUserAstronaut size={15} />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showUserPopup && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className='absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-4 z-50'
                      >
                        <p className='text-sm text-emerald-600 dark:text-emerald-400 font-bold mb-3 border-b border-gray-100 dark:border-gray-800 pb-2 truncate'>
                          {userData?.user?.name}
                        </p>

                        <motion.button
                          whileHover={{ x: 3 }}
                          onClick={() => {
                            setShowUserPopup(false);
                            navigate('/dashboard');
                          }}
                          className='w-full text-left text-sm py-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2 transition-colors'
                        >
                          <BsGrid size={15} />
                          <span>Dashboard</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ x: 3 }}
                          onClick={() => {
                            setShowUserPopup(false);
                            navigate('/history');
                          }}
                          className='w-full text-left text-sm py-2 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-gray-700 dark:text-gray-300 font-medium transition-colors'
                        >
                          Interview History
                        </motion.button>

                        <motion.button
                          whileHover={{ x: 3 }}
                          onClick={handleLogout}
                          className='w-full text-left text-sm py-2 flex items-center gap-2 cursor-pointer text-rose-500 dark:text-rose-400 font-medium border-t border-gray-100 dark:border-gray-800 mt-2 pt-2 transition-colors'
                        >
                          <HiOutlineLogout size={16} />
                          <span>Logout</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className='flex items-center gap-2 md:gap-3'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuth(true)}
                  className='hidden sm:block text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  Log in
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuth(true)}
                  className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 md:px-5 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-semibold cursor-pointer transition shadow-md shadow-emerald-600/20'
                >
                  Get Started
                </motion.button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenu(!mobileMenu)}
              className='md:hidden text-gray-700 dark:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer transition-colors'
            >
              {mobileMenu ? <HiX size={22} /> : <HiOutlineMenuAlt3 size={22} />}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className='fixed top-20 left-4 right-4 z-40 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-5 md:hidden space-y-3'
          >
            <motion.button
              whileHover={{ x: 4 }}
              onClick={handleNavFeatures}
              className='block w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 py-2 border-b border-gray-100 dark:border-gray-800'
            >
              Features
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              onClick={handleNavHowItWorks}
              className='block w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 py-2 border-b border-gray-100 dark:border-gray-800'
            >
              How It Works
            </motion.button>
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => {
                navigate('/pricing');
                setMobileMenu(false);
              }}
              className='block w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 py-2 border-b border-gray-100 dark:border-gray-800'
            >
              Pricing
            </motion.button>

            {userData && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenu(false);
                }}
                className='w-full flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 py-2.5 rounded-xl text-sm font-semibold cursor-pointer'
              >
                <BsGrid size={16} />
                <span>Dashboard</span>
              </motion.button>
            )}

            {!userData && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowAuth(true);
                  setMobileMenu(false);
                }}
                className='w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer shadow-md shadow-emerald-600/20'
              >
                Get Started
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default Navbar;
