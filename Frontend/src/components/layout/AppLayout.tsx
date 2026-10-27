import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from '../Navbar';
import Footer from '../Footer';
import AuthModel from '../AuthModel';
import InterviewReminder from '../common/InterviewReminder';
import { BsRobot, BsGrid, BsPlusCircle, BsBank, BsBoxArrowRight, BsSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { ServerUrl } from '../../App';
import { setUserData } from '../../redux/userSlice';
import { RootState } from '../../redux/store';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.user);
  const isInterviewer = userData?.role === 'interviewer';
  const userName = userData?.name || 'Interviewer';

  const [isScrolled, setIsScrolled] = useState(false);

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

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + '/api/auth/logout', { withCredentials: true });
      dispatch(setUserData(null));
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  const handleSwitchRole = async (newRole: string) => {
    try {
      const res = await axios.post(`${ServerUrl}/api/user/role`, { role: newRole }, { withCredentials: true });
      if (res.data?.user) {
        dispatch(setUserData(res.data.user));
        navigate(newRole === 'interviewer' ? '/interviewer/dashboard' : '/dashboard');
      }
    } catch (err) {
      console.error('Role switch error:', err);
    }
  };

  // Protect all AppLayout routes: Block access if user is not authenticated!
  if (!userData) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] transition-colors duration-300 relative">
        <Navbar />
        <AuthModel onClose={() => {}} />
      </div>
    );
  }

  if (isInterviewer) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 flex flex-col justify-between transition-colors duration-300 relative">
        {/* Scroll-triggered floating pill header for Interviewers */}
        <div
          className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-300 pointer-events-none ${
            isScrolled ? 'top-3 md:top-4 px-4 md:px-6' : 'top-0 px-0'
          }`}
        >
          <motion.header
            layout
            initial={false}
            animate={{
              width: isScrolled ? '100%' : '100%',
              maxWidth: isScrolled ? '72rem' : '100%',
              borderRadius: isScrolled ? '9999px' : '0px',
            }}
            transition={{ type: 'spring', stiffness: 240, damping: 25 }}
            className={`pointer-events-auto flex justify-between items-center relative transition-all duration-300 w-full ${
              isScrolled
                ? 'px-5 md:px-7 py-2.5 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-emerald-950/20 border border-gray-200/90 dark:border-gray-800/90'
                : 'px-6 md:px-12 py-3.5 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80'
            }`}
          >
            {/* Brand Logo */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/interviewer/dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="bg-black dark:bg-emerald-600 text-white p-2 rounded-xl shadow-xs group-hover:scale-105 transition-transform">
                <BsRobot size={18} />
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white text-base">
                  HireReady<span className="text-emerald-600 dark:text-emerald-400">.AI</span>
                </span>
                <span className="ml-2 text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  INTERVIEWER PORTAL
                </span>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/interviewer/dashboard')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  location.pathname === '/interviewer/dashboard'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/80'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <BsGrid size={14} />
                <span>Dashboard</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/interviewer/create-slots')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  location.pathname === '/interviewer/create-slots' || location.pathname === '/interviewer/slots'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/80'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <BsPlusCircle size={14} />
                <span>Manage & Create Slots</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/interviewer/profile')}
                className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  location.pathname === '/interviewer/profile'
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/80'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <BsBank size={14} />
                <span>Profile & KYC Bank</span>
              </motion.button>
            </nav>

            {/* User Controls, Theme Toggle & Role Switcher */}
            <div className="flex items-center gap-3">
              {/* Segmented Theme Switcher Pill */}
              <div className="bg-gray-100 dark:bg-gray-800/90 p-1 rounded-full border border-gray-200/90 dark:border-gray-700/80 flex items-center shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsDark(false)}
                  className={`flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                    !isDark
                      ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <BsSunFill size={12} className={!isDark ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDark(true)}
                  className={`flex items-center gap-1 py-1 px-2.5 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                    isDark
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <BsMoonStarsFill size={12} className={isDark ? 'text-amber-300' : 'text-gray-400 dark:text-gray-500'} />
                  <span>Dark</span>
                </button>
              </div>

              {/* Role Switcher Pill */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSwitchRole('learner')}
                className="text-[11px] bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition"
              >
                Switch to Candidate
              </motion.button>

              <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-xs">
                {userName.charAt(0).toUpperCase()}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition"
                title="Logout"
              >
                <BsBoxArrowRight size={16} />
              </motion.button>
            </div>
          </motion.header>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 w-full pt-20 flex flex-col justify-between">
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    );
  }

  // Learner Default Layout (With Sidebar)
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar />
      <InterviewReminder />

      {/* Main content area — offset by sidebar width on desktop */}
      <main className="lg:ml-[260px] pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default AppLayout;
