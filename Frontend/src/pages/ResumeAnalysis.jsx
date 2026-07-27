import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { 
  BsFileEarmarkText, 
  BsCheckCircleFill, 
  BsXCircleFill, 
  BsExclamationTriangleFill,
  BsUpload,
  BsShieldCheck,
  BsLightbulb,
  BsCloudUpload,
  BsArrowRepeat,
  BsCheckLg,
  BsInfoCircle
} from 'react-icons/bs'
import { ServerUrl } from '../App.jsx'

function ResumeAnalysis() {
  const [hasUploaded, setHasUploaded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [data, setData] = useState(null)
  const fileInputRef = useRef(null)

  // Fetch saved resume analysis from MongoDB on mount
  useEffect(() => {
    const fetchSavedAnalysis = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${ServerUrl}/api/interview/saved-resume-analysis`, { withCredentials: true })
        if (res.data?.hasResume && res.data?.data) {
          setData(res.data.data)
          setHasUploaded(true)
        } else {
          setData(null)
          setHasUploaded(false)
        }
      } catch (error) {
        console.error('Fetch saved resume analysis error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSavedAnalysis()
  }, [])

  // Handle Real AI Resume Upload & Analysis via OpenRouter API
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('resume', file)

    try {
      setAnalyzing(true)
      const res = await axios.post(`${ServerUrl}/api/interview/full-resume-analysis`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data?.data) {
        setData(res.data.data)
        setHasUploaded(true)
      }
    } catch (error) {
      console.error('Real resume analysis error:', error)
      alert(error.response?.data?.message || 'Failed to analyze resume with AI.')
    } finally {
      setAnalyzing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-rose-600 dark:text-rose-400'
  }

  const getScoreBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500'
    if (score >= 60) return 'bg-amber-500'
    return 'bg-rose-500'
  }

  return (
    <div className='py-2 space-y-8'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
            AI Resume Analyzer & ATS Score
          </h1>
          <p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
            Get real-time ATS compatibility scores, skill gap analysis, and tailored improvement suggestions.
          </p>
        </div>

        {hasUploaded && (
          <div>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept='application/pdf'
              className='hidden'
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={analyzing}
              className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
            >
              {analyzing ? (
                <>
                  <BsArrowRepeat size={16} className='animate-spin' />
                  <span>Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <BsUpload size={14} />
                  <span>Upload Another Resume</span>
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {loading ? (
        <div className='py-24 text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2'>
          <BsArrowRepeat size={24} className='animate-spin text-emerald-600' />
          <span>Loading your resume analysis...</span>
        </div>
      ) : !hasUploaded ? (
        /* EMPTY STATE: Resume Upload Dropzone (When User Has Not Uploaded Resume Yet) */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-10 md:p-16 text-center space-y-6 shadow-sm transition-colors duration-300'
        >
          <div className='w-20 h-20 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800/60 shadow-xs'>
            <BsCloudUpload size={36} />
          </div>

          <div className='max-w-md mx-auto space-y-2'>
            <h3 className='text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
              Upload Your Resume for AI ATS Evaluation
            </h3>
            <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed'>
              Upload your PDF resume to generate a real-time ATS match score, extract technical skills, identify skill gaps, and get professional improvement suggestions.
            </p>
          </div>

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept='application/pdf'
            className='hidden'
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold px-8 py-3.5 rounded-2xl text-sm cursor-pointer transition shadow-lg shadow-emerald-600/20 inline-flex items-center gap-2'
          >
            {analyzing ? (
              <>
                <BsArrowRepeat size={18} className='animate-spin' />
                <span>Extracting & Analyzing PDF...</span>
              </>
            ) : (
              <>
                <BsUpload size={16} />
                <span>Upload PDF Resume</span>
              </>
            )}
          </motion.button>

          {/* Benefits Bullet Row */}
          <div className='pt-6 border-t border-gray-100 dark:border-gray-800/80 flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-500 dark:text-gray-400'>
            <div className='flex items-center gap-2'>
              <BsCheckLg className='text-emerald-500' />
              <span>Real ATS Match Score</span>
            </div>
            <div className='flex items-center gap-2'>
              <BsCheckLg className='text-emerald-500' />
              <span>Missing Tech Skills Tagging</span>
            </div>
            <div className='flex items-center gap-2'>
              <BsCheckLg className='text-emerald-500' />
              <span>Saved to Your Account</span>
            </div>
          </div>
        </motion.div>
      ) : (
        /* RESULTS VIEW: Real AI Resume Analysis Output */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className='space-y-8'
        >
          {/* Top Score Summary Grid */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* ATS Score Card */}
            <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-xs transition-colors duration-300'>
              <p className='text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-4'>
                Overall ATS Score
              </p>

              <div className='relative w-36 h-36 flex items-center justify-center mb-4'>
                <svg className='w-full h-full transform -rotate-90' viewBox='0 0 100 100'>
                  <circle
                    cx='50'
                    cy='50'
                    r='40'
                    stroke='currentColor'
                    strokeWidth='8'
                    className='text-gray-100 dark:text-gray-800'
                    fill='transparent'
                  />
                  <circle
                    cx='50'
                    cy='50'
                    r='40'
                    stroke='currentColor'
                    strokeWidth='8'
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * (data?.atsScore || 75)) / 100}
                    strokeLinecap='round'
                    className={getScoreColor(data?.atsScore || 75)}
                    fill='transparent'
                  />
                </svg>

                <div className='absolute flex flex-col items-center'>
                  <span className={`text-4xl font-extrabold ${getScoreColor(data?.atsScore || 75)}`}>
                    {data?.atsScore || 75}
                  </span>
                  <span className='text-[10px] text-gray-400 font-bold uppercase tracking-wider'>out of 100</span>
                </div>
              </div>

              <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                {data?.fileName ? `Analyzed: ${data.fileName}` : 'Resume Analyzed'}
              </p>
              <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-0.5'>{data?.uploadDate || 'Today'}</p>
            </div>

            {/* Section Breakdown Scores */}
            <div className='lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xs transition-colors duration-300 flex flex-col justify-between'>
              <div>
                <h3 className='text-lg font-extrabold text-gray-900 dark:text-white mb-1'>Section Analysis Breakdown</h3>
                <p className='text-xs text-gray-500 dark:text-gray-400 mb-6'>
                  Individual section compliance ratings based on technical hiring benchmarks.
                </p>
              </div>

              <div className='grid sm:grid-cols-2 gap-x-8 gap-y-4'>
                {Object.values(data?.sections || {}).map((sec, idx) => (
                  <div key={idx} className='space-y-1.5'>
                    <div className='flex items-center justify-between text-xs font-semibold'>
                      <span className='text-gray-700 dark:text-gray-300'>{sec.label}</span>
                      <span className={getScoreColor(sec.score)}>{sec.score}%</span>
                    </div>
                    <div className='w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(sec.score)}`}
                        style={{ width: `${sec.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matched vs Recommended Skills */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Matched Skills */}
            <div className='bg-white dark:bg-gray-900 border border-emerald-200/80 dark:border-emerald-800/80 rounded-3xl p-6 shadow-xs transition-colors duration-300'>
              <div className='flex items-center gap-2 mb-4'>
                <BsCheckCircleFill className='text-emerald-500' size={18} />
                <h3 className='font-bold text-gray-900 dark:text-white text-base'>
                  Detected Matched Skills ({data?.matchedSkills?.length || 0})
                </h3>
              </div>
              <div className='flex flex-wrap gap-2'>
                {data?.matchedSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200/80 dark:border-emerald-800/80'
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Skills to Add */}
            <div className='bg-white dark:bg-gray-900 border border-rose-200/80 dark:border-rose-800/80 rounded-3xl p-6 shadow-xs transition-colors duration-300'>
              <div className='flex items-center gap-2 mb-4'>
                <BsXCircleFill className='text-rose-500' size={18} />
                <h3 className='font-bold text-gray-900 dark:text-white text-base'>
                  Recommended Skills to Add ({data?.recommendedSkills?.length || 0})
                </h3>
              </div>
              <div className='flex flex-wrap gap-2'>
                {data?.recommendedSkills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className='bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full text-xs font-semibold border border-rose-200/80 dark:border-rose-800/80'
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Improvement Suggestions List */}
          <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 transition-colors duration-300'>
            <div className='flex items-center gap-2.5'>
              <div className='bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-800/60'>
                <BsLightbulb size={20} />
              </div>
              <div>
                <h3 className='text-lg font-extrabold text-gray-900 dark:text-white'>AI ATS Optimization Suggestions</h3>
                <p className='text-xs text-gray-500 dark:text-gray-400'>Actionable changes to increase your resume match score for top tier companies.</p>
              </div>
            </div>

            <div className='space-y-3.5'>
              {data?.suggestions?.map((item, idx) => {
                const text = typeof item === 'string' ? item : item.text
                const type = typeof item === 'string' ? 'tip' : item.type
                return (
                  <div
                    key={idx}
                    className='flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 text-gray-800 dark:text-gray-200 text-xs md:text-sm leading-relaxed font-medium'
                  >
                    {type === 'critical' ? (
                      <BsXCircleFill className='text-rose-500 shrink-0 mt-0.5' size={16} />
                    ) : type === 'warning' ? (
                      <BsExclamationTriangleFill className='text-amber-500 shrink-0 mt-0.5' size={16} />
                    ) : (
                      <BsInfoCircle className='text-emerald-500 shrink-0 mt-0.5' size={16} />
                    )}
                    <span>{text}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ResumeAnalysis
