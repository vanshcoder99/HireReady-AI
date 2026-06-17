import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import { BsRobot,
         BsMic,
         BsClock,
         BsBarChart,
         BsFileEarmark
 } from 'react-icons/bs';
 import { HiSparkles } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import AuthModel from '../components/AuthModel.jsx';
function Home() {
  const {userData} = useSelector((state) => state.user)
  const [showAuth,setShowAuth] = useState(false)
  const navigate = useNavigate();
  return (
    <div className='min-h-screen flex flex-col bg-[#f3f3f3]'>
      <Navbar/>
      <div className='flex-1 px-6 py-20'>
        <div className='flex justify-center mb-6'>
          <div className='bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full flex items-center gap-2'>
            <HiSparkles size={16} className='bg-green-50 text-green-600' />
            AI Powered Smart Interview Platform 
          </div>
        </div>
        <div className='text-center mb-28'>
            <motion.h1 
              initial={{opacity: 0, y:30}}
              animate={{opacity: 1, y:0}}
              transition={{duration: 0.6}}
              className='text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto'>
              Practice Interviews with
              <span className='relative inline-block'>
                <span className='bg-green-100 text-green-600 px-5 py-1 rounded-full'>
                  AI Intelligence
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.8}}
              className='text-gray-500 mt-6 max-w-2xl mx-auto text-lg'
            >
              Role-based mock interviews with smart follow-ups, adaptive difficulty and real-time performance evaluation.
            </motion.p>

            <div className='flex flex-wrap justify-center gap-4 mt-10'>
              <motion.button 
                onClick={() => {
                  if(!userData){
                    setShowAuth(true);
                    return;
                  }
                  navigate("/interview")
                }}
                whileHover={{opacity:0.9, scale:1.03}}
                whileTap={{opacity:1, scale: 0.98}}
                className="bg-black cursor-pointer  text-white px-10 py-3 rounded-full hover:opacity-90 transition shawdow-md"
                >
                  Start Interview
                </motion.button>

                <motion.button 
                onClick={() => {
                  if(!userData){
                    setShowAuth(true);
                    return;
                  }
                  navigate("/history")
                }}
                whileHover={{opacity:0.9, scale:1.03}}
                whileTap={{opacity:1, scale: 0.98}}
                className="border-gray-300 cursor-pointer  px-10 py-3 rounded-full hover:bg-gray-100 transition"
                >
                  View History
                </motion.button>

            </div>
          </div>

          <div className='flex flex-col md:flex-row justify-center items-center gap-10 mb-28'>
            {
              [
                {
                  icon: <BsRobot size={24} />,
                  step: "STEP 1",
                  title: "Role & Experience Selection",
                  desc: "AI adjusts difficulty based on selected job role."
                },
                {
                  icon: <BsMic size={24} />,
                  step: "STEP 2",
                  title: "Smart Voice Interview",
                  desc: "Dynamic follow-up questions based on your answers."
                },
                {
                  icon: <BsClock size={24} />,
                  step: "STEP 3",
                  title: "Timer Based Simulation",
                  desc: "Real Interview pressure with time tracking."
                }
              ]
            }

          </div>

      </div>

        {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

    </div>
  )
}

export default Home
