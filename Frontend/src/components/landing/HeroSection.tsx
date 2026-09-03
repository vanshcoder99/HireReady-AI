import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'motion/react';
import { HiSparkles } from 'react-icons/hi';
import { BsArrowRight } from 'react-icons/bs';
import AuthModel from '../AuthModel';
import RobotMascot from './RobotMascot';
import { RootState } from '../../redux/store';

const secondLineWords = ['Get', 'Hired', 'Faster.'];

const sentenceVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.35,
    },
  },
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0.1,
    y: 20,
    filter: 'blur(8px)',
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      type: 'spring',
      damping: 14,
      stiffness: 110,
    },
  },
};

function HeroSection() {
  const navigate = useNavigate();
  const { userData } = useSelector((state: RootState) => state.user);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleStartPreparing = () => {
    if (userData) {
      navigate('/dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-200/40 to-teal-100/30 dark:from-emerald-950/30 dark:to-teal-900/20 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 text-center relative">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-8 shadow-xs"
        >
          <HiSparkles className="text-emerald-600 dark:text-emerald-400" size={16} />
          <span>AI-Powered Placement Preparation Platform</span>
        </motion.div>

        {/* Main Headline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-6">
            {/* Line 1 */}
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="block"
            >
              Prepare for Placements.
            </motion.span>

            {/* Line 2: Animated Word-by-Word with Robot */}
            <motion.span
              variants={sentenceVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex flex-wrap items-center justify-center text-emerald-600 dark:text-emerald-400 gap-x-2 sm:gap-x-3.5 relative"
            >
              {secondLineWords.map((word, index) => (
                <motion.span key={index} variants={wordVariants} className="inline-block tracking-tight">
                  {word}
                </motion.span>
              ))}

              {/* Robot Character Mascot */}
              <RobotMascot size={56} className="ml-1 sm:ml-2.5 align-middle inline-block" />
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
          >
            Practice real AI mock interviews, analyze your resume against ATS standards, master study flashcards &
            quizzes, and book live 1-on-1 human mock sessions with senior engineers.
          </motion.p>
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartPreparing}
            className="w-full sm:w-auto bg-black dark:bg-emerald-600 hover:bg-gray-900 dark:hover:bg-emerald-700 text-white font-extrabold px-8 py-4 rounded-2xl text-sm md:text-base shadow-xl cursor-pointer transition flex items-center justify-center gap-2 group"
          >
            <span>Start Preparing Free</span>
            <BsArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/how-it-works')}
            className="w-full sm:w-auto bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold px-8 py-4 rounded-2xl text-sm md:text-base cursor-pointer transition shadow-xs"
          >
            Explore Platform Features
          </motion.button>
        </motion.div>

        {/* Key Feature Stats Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left"
        >
          {[
            { title: 'AI Mock Interviews', desc: 'Real-time audio & scoring' },
            { title: 'ATS Resume Audit', desc: 'Instant feedback & tips' },
            { title: 'Human Mock Sessions', desc: '1-on-1 mentor guidance' },
            { title: 'Study Flashcards & Quizzes', desc: 'Master key tech topics' },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/70 dark:border-gray-800/70 shadow-xs"
            >
              <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{stat.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {showAuthModal && <AuthModel onClose={() => setShowAuthModal(false)} />}
    </section>
  );
}

export default HeroSection;
