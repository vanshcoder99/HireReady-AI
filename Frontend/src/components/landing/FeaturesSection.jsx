import React from 'react'
import { motion } from 'motion/react'
import { BsMic, BsFileEarmarkText, BsLayers, BsRobot, BsQuestionCircle, BsPeople, BsBarChart } from 'react-icons/bs'
import evalImg from '../../assets/ai-ans.png'
import resumeImg from '../../assets/resume.png'
import confiImg from '../../assets/confi.png'
import techImg from '../../assets/tech.png'
import hrImg from '../../assets/HR.png'
import creditImg from '../../assets/credit.png'
import pdfImg from '../../assets/pdf.png'
import historyImg from '../../assets/history.png'

const section1Features = [
  {
    icon: <BsMic size={20} />,
    title: 'AI Mock Interviews',
    desc: 'Scores communication depth, technical accuracy, and voice confidence in live adaptive rounds.',
    image: evalImg,
  },
  {
    icon: <BsFileEarmarkText size={20} />,
    title: 'Resume Based Interview',
    desc: 'Extracts projects & skills from your CV to generate realistic role-aligned technical questions.',
    image: resumeImg,
  },
  {
    icon: <BsFileEarmarkText size={20} />,
    title: 'Downloadable PDF Report',
    desc: 'Comprehensive post-interview feedback breakdown with score trends and targeted improvement areas.',
    image: pdfImg,
  },
  {
    icon: <BsRobot size={20} />,
    title: 'AI Study Assistant',
    desc: 'Ask AI to break down complex interview topics, explain technical concepts, and guide preparation.',
    image: techImg,
  },
]

const section2Features = [
  {
    icon: <BsQuestionCircle size={20} />,
    title: 'Practice Quizzes',
    desc: 'Test technical knowledge with topic-wise quizzes, track performance, and pinpoint weak areas.',
    image: creditImg,
  },
  {
    icon: <BsLayers size={20} />,
    title: 'Smart Flashcards',
    desc: 'Master essential computer science topics, code syntax, and core concepts with smart cards.',
    image: confiImg,
  },
  {
    icon: <BsPeople size={20} />,
    title: 'Human Interview Prep',
    desc: 'Prepare for real human interviews with behavioral guidelines, HR questions, and body language tips.',
    image: hrImg,
    comingSoon: true,
  },
  {
    icon: <BsBarChart size={20} />,
    title: 'Progress & Analytics',
    desc: 'Monitor interview scores, study streaks, and overall placement readiness on a live dashboard.',
    image: historyImg,
  },
]

function FeaturesSection() {
  return (
    <section id='features' className='py-20 px-6'>
      <div className='max-w-6xl mx-auto space-y-28'>
        
        {/* SECTION 1: Advanced AI Capabilities (4 Cards in 2x2 Grid) */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='text-center mb-14'
          >
            <span className='text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/60'>
              Placement Intelligence
            </span>
            <h2 className='text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-3 mb-4 tracking-tight'>
              Advanced AI <span className='text-emerald-600 dark:text-emerald-400'>Capabilities</span>
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto'>
              Real-time evaluation, resume tailoring, and instant AI insights for placement readiness.
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 gap-8 lg:gap-10'>
            {section1Features.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-7 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 relative'
              >
                {/* Left side Image preview */}
                <div className='w-full sm:w-1/2 flex justify-center bg-gray-50/80 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100/90 dark:border-gray-700/60'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='w-full h-auto object-contain max-h-48 transform hover:scale-105 transition-transform duration-300'
                  />
                </div>

                {/* Right side Icon Badge + Title + Description */}
                <div className='w-full sm:w-1/2'>
                  <div className='bg-green-50 dark:bg-emerald-950/60 text-green-600 dark:text-emerald-400 w-11 h-11 rounded-xl flex items-center justify-center mb-4 border border-green-100 dark:border-emerald-800/60'>
                    {item.icon}
                  </div>
                  <h3 className='font-bold text-gray-900 dark:text-white mb-2 text-xl leading-snug'>
                    {item.title}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-normal'>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 2: Practice Modes & Analytics (4 Cards in 2x2 Grid) */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='text-center mb-14'
          >
            <span className='text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/60'>
              Preparation & Practice
            </span>
            <h2 className='text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-3 mb-4 tracking-tight'>
              Practice & Track <span className='text-emerald-600 dark:text-emerald-400'>Tools</span>
            </h2>
            <p className='text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto'>
              Quizzes, flashcards, human prep, and analytics to ensure complete placement readiness.
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 gap-8 lg:gap-10'>
            {section2Features.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-7 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row items-center gap-6 relative'
              >
                {item.comingSoon && (
                  <div className='absolute top-4 right-4 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800'>
                    Soon
                  </div>
                )}

                {/* Left side Image preview */}
                <div className='w-full sm:w-1/2 flex justify-center bg-gray-50/80 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100/90 dark:border-gray-700/60'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='w-full h-auto object-contain max-h-48 transform hover:scale-105 transition-transform duration-300'
                  />
                </div>

                {/* Right side Icon Badge + Title + Description */}
                <div className='w-full sm:w-1/2'>
                  <div className='bg-green-50 dark:bg-emerald-950/60 text-green-600 dark:text-emerald-400 w-11 h-11 rounded-xl flex items-center justify-center mb-4 border border-green-100 dark:border-emerald-800/60'>
                    {item.icon}
                  </div>
                  <h3 className='font-bold text-gray-900 dark:text-white mb-2 text-xl leading-snug'>
                    {item.title}
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-normal'>
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default FeaturesSection
