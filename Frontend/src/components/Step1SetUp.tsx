import React, { useState } from 'react'
import { motion } from 'motion/react'
import { 
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
 } from 'react-icons/fa'
import axios from 'axios'
import { ServerUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/userSlice';

function Step1SetUp({ onStart }) {
    const { userData } = useSelector((state: any) => state.user)
    const dispatch = useDispatch();
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState([]);
    const [projects, setProjects] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)

        const formData = new FormData()
        formData.append("resume", resumeFile)
        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formData, { withCredentials: true })

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true)
            setAnalyzing(false)
        } catch (error) {
            console.log(error)
            setAnalyzing(false)
        }
    }

    const handleStart = async () => {
        setLoading(true)
        try {
            const result = await axios.post(ServerUrl + "/api/interview/generate-questions", { role, experience, mode, resumeText, projects, skills }, { withCredentials: true })

            if (userData) {
                dispatch(setUserData({ ...userData, credits: result.data.creditsLeft }))
            }

            setLoading(false)
            onStart(result.data)

        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#0b0f19] px-4 py-12 transition-colors duration-300'
    >
        <div className='w-full max-w-6xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden border border-gray-200/80 dark:border-gray-800 transition-colors duration-300'>
            {/* Left Banner Section */}
            <motion.div
                initial={{ x: -80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className='relative bg-emerald-50 dark:bg-emerald-950/60 p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-emerald-100 dark:border-emerald-900/40'
            >
                <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-emerald-300 mb-4 tracking-tight'>
                    Start Your AI Interview
                </h2>

                <p className='text-gray-600 dark:text-emerald-200/90 mb-8 leading-relaxed text-sm md:text-base font-normal'>
                    Practice real interview scenarios powered by AI.
                    Improve communication, technical skills, and confidence.
                </p>
                
                <div className='space-y-4'>
                    {
                        [
                            {
                                icon: <FaUserTie className='text-emerald-600 dark:text-emerald-400 text-xl'/>,
                                text: "Choose Role & Experience",
                            },
                            {
                                icon: <FaMicrophoneAlt className='text-emerald-600 dark:text-emerald-400 text-xl'/>,
                                text: "Smart Voice Interview",
                            },
                            {
                                icon: <FaChartLine className='text-emerald-600 dark:text-emerald-400 text-xl'/>,
                                text: "Performance Analytics",
                            }
                        ].map((item, index) => (
                            <motion.div key={index}
                                className='flex items-center space-x-4 bg-white dark:bg-gray-900/90 p-4 rounded-2xl shadow-xs border border-emerald-100/80 dark:border-emerald-800/40 cursor-pointer'
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.15 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                {item.icon}
                                <span className='text-gray-800 dark:text-gray-200 font-semibold text-sm md:text-base'>{item.text}</span>
                            </motion.div>
                        ))
                    }
                </div>
            </motion.div>

            {/* Right Setup Form Section */}
            <motion.div
                className='p-8 md:p-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}                
            >
                <h2 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-8 tracking-tight'>
                    Interview SetUp
                </h2>

                <div className='space-y-6'>
                    <div className='relative'>
                        <FaUserTie className='absolute top-4 left-4 text-gray-400 dark:text-gray-500'/>
                        <input type='text' placeholder='Enter Role (e.g. Frontend Developer)' 
                            className='w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition'
                            onChange={(e) => setRole(e.target.value)}
                            value={role}
                        />
                    </div>

                    <div className='relative'>
                        <FaBriefcase className='absolute top-4 left-4 text-gray-400 dark:text-gray-500'/>
                        <input type='text' placeholder='Experience (e.g. 2 years)' 
                            className='w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition'
                            onChange={(e) => setExperience(e.target.value)}
                            value={experience}
                        />
                    </div>

                    <select value={mode} onChange={(e) => setMode(e.target.value)}
                        className='w-full py-3 px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition cursor-pointer'>
                        <option value="Technical">Technical Interview</option>
                        <option value="HR">HR Interview</option>
                    </select>

                    {!analysisDone && (
                        <motion.div 
                            whileHover={{ scale: 1.01 }}
                            onClick={() => document.getElementById("resumeUpload").click()}
                            className='border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition'>
                            <FaFileUpload className='text-4xl mx-auto text-emerald-600 dark:text-emerald-400 mb-3' />
                            <input type="file" id='resumeUpload' 
                                accept='application/pdf' className='hidden cursor-pointer'
                                onChange={(e) => setResumeFile(e.target.files[0])}
                            />

                            <p className='text-gray-600 dark:text-gray-300 font-medium text-sm'>
                                {resumeFile ? resumeFile.name : "Click to upload Resume (Optional)"}
                            </p>

                            {resumeFile && (
                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleUploadResume()
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    className='mt-4 bg-gray-900 dark:bg-emerald-600 hover:bg-gray-800 dark:hover:bg-emerald-700 cursor-pointer text-white px-5 py-2 rounded-lg transition text-xs font-semibold'
                                >
                                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                                </motion.button>
                            )}

                        </motion.div>
                    )}

                    {analysisDone && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4'
                        >
                            <h3 className='text-base font-bold text-gray-800 dark:text-white'>Resume Analysis Result</h3>   

                            {projects.length > 0 && (
                                <div>
                                    <p className='font-medium text-gray-700 dark:text-gray-300 mb-1 text-sm'>
                                        Projects:
                                    </p>
                                    <ul className='list-disc list-inside text-gray-600 dark:text-gray-400 text-xs space-y-1'>
                                        {projects.map((p, i) => (
                                            <li key={i}> {p} </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {skills.length > 0 && (
                                <div>
                                    <p className='font-medium text-gray-700 dark:text-gray-300 mb-1 text-sm'>
                                        Skills:
                                    </p>
                                    <div className='flex flex-wrap gap-2'>
                                        {skills.map((s, i) => (
                                            <span className='bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold' key={i}> {s} </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}

                    <motion.button
                        onClick={handleStart}
                        disabled={!role || !experience || loading}
                        className='w-full disabled:bg-gray-400 dark:disabled:bg-gray-700 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white py-3.5 rounded-2xl text-base font-semibold transition duration-300 shadow-md shadow-emerald-600/20'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? "Starting..." : "Start Interview"}
                    </motion.button>
                
                </div>

            </motion.div>
        </div>
    </motion.div>
  )
}

export default Step1SetUp
