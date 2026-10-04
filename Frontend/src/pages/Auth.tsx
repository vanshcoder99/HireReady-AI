import React, { useState } from 'react'
import { BsRobot, BsPerson, BsBriefcase } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react";
import axios from "axios"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

function Auth({ isModel = false }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('learner');

    const handleGoogleAuth = async () => {
        try {
            const response = await signInWithPopup(auth, provider);
            let User = response.user
            let name = User.displayName
            let email = User.email
            
            // 1. Google OAuth
            const result = await axios.post(
                ServerUrl + "/api/auth/google",
                { name, email },
                { withCredentials: true }
            )

            // 2. Set User Role
            const roleRes = await axios.post(
                ServerUrl + "/api/user/role",
                { role: selectedRole },
                { withCredentials: true }
            )

            // Always dispatch the flat User object (not nested { user: {...} })
            // The role-switch response is the authoritative final state (includes updated role)
            const finalUser = roleRes.data?.user || result.data?.user || result.data;
            dispatch(setUserData(finalUser))

            // Redirect based on selected role
            if (selectedRole === 'interviewer') {
                navigate('/interviewer/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.log(error)
            dispatch(setUserData(null))
        }
    }

    return (
        <div className={
            `w-full ${isModel ? "py-2" : "min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] flex items-center justify-center px-6 py-20 transition-colors duration-300"} 
        `}>
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={
                    `w-full ${isModel ? "max-w-md rounded-3xl p-7 md:p-9" : "max-w-lg p-10 md:p-12 rounded-[32px]"}
                 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xl border border-gray-200/90 dark:border-gray-800 relative z-10 transition-colors duration-300
                `}>
                {/* Logo & Brand Header */}
                <div className='flex items-center justify-center gap-2.5 mb-4'>
                    <div className='bg-black dark:bg-emerald-600 text-white p-2 rounded-xl shadow-xs transition-colors duration-300'>
                        <BsRobot size={18} />
                    </div>
                    <h2 className='font-bold text-gray-900 dark:text-white text-lg tracking-tight'>
                        HireReady<span className='text-emerald-600 dark:text-emerald-400'>.AI</span>
                    </h2>
                </div>

                {/* Role Selection Step */}
                <div className='mb-6 space-y-2'>
                    <label className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block text-center'>Select Your Account Role</label>
                    <div className='grid grid-cols-2 gap-3 p-1.5 bg-gray-100/80 dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700'>
                        <button
                            type='button'
                            onClick={() => setSelectedRole('learner')}
                            className={`py-3 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                selectedRole === 'learner'
                                    ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-md border border-gray-200/80 dark:border-gray-600'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <BsPerson size={18} />
                            <span>Learner / Candidate</span>
                        </button>

                        <button
                            type='button'
                            onClick={() => setSelectedRole('interviewer')}
                            className={`py-3 px-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                                selectedRole === 'interviewer'
                                    ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-md border border-gray-200/80 dark:border-gray-600'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <BsBriefcase size={18} />
                            <span>Tech Interviewer</span>
                        </button>
                    </div>
                </div>

                {/* Headline & Sparkle Badge */}
                <div className='text-center mb-6'>
                    <span className='bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-3.5 py-1.5 rounded-full inline-flex items-center justify-center gap-2 text-xs font-extrabold tracking-wide uppercase shadow-xs max-w-full text-center'>
                        <IoSparkles className='text-emerald-600 dark:text-emerald-400 flex-shrink-0' size={14} />
                        <span className='truncate'>AI-POWERED PLACEMENT PREPARATION PLATFORM</span>
                    </span>
                </div>

                {/* Subtitle */}
                <p className='text-gray-600 dark:text-gray-400 text-xs md:text-sm text-center mb-6 font-normal leading-relaxed max-w-xs mx-auto'>
                    Sign in to {selectedRole === 'interviewer' ? 'conduct live mock interviews & manage slots' : 'start AI mock interviews, analyze resume, and track readiness'}.
                </p>

                {/* Google Sign-in Button */}
                <button
                    onClick={handleGoogleAuth}
                    className='w-full py-3.5 px-5 bg-black dark:bg-emerald-600 hover:bg-gray-800 dark:hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs md:text-sm cursor-pointer transition-all duration-200 flex items-center justify-center gap-3 shadow-md shadow-black/10 dark:shadow-emerald-600/20 active:scale-[0.99]'
                >
                    <FcGoogle size={20} className='bg-white rounded-full p-0.5' />
                    <span>Continue with Google</span>
                </button>

                {/* Footer Note */}
                <p className='text-[11px] text-gray-400 dark:text-gray-400 text-center mt-6 font-normal'>
                    By continuing, you agree to HireReady.AI's <span className='underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-200'>Terms</span> & <span className='underline cursor-pointer hover:text-gray-600 dark:hover:text-gray-200'>Privacy Policy</span>.
                </p>
            </motion.div>
        </div>
    )
}

export default Auth
