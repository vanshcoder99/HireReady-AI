import React, { useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { 
  BsCheckCircleFill, 
  BsXCircleFill,
  BsExclamationTriangleFill,
  BsPerson, 
  BsBriefcase, 
  BsBank,
  BsShieldCheck,
  BsX,
  BsUpload,
  BsFileEarmarkText,
  BsMortarboard,
  BsArrowRepeat,
  BsCheckLg,
  BsChevronRight,
  BsChevronLeft,
  BsLink45Deg,
  BsTelephone,
  BsCalendarDate,
  BsCreditCard2Front,
  BsPatchCheckFill
} from 'react-icons/bs'
import { ServerUrl } from '../App'
import { setUserData } from '../redux/userSlice'

function InterviewerProfile() {
  const dispatch = useDispatch()
  const { userData } = useSelector((state: any) => state.user)

  const user = userData?.user || userData
  const profile = user?.interviewerProfile || {}
  const bankDetails = profile.bankDetails || {}
  const verification = profile.verificationDetails || { status: 'unverified' }

  // Step Tracker State (1 to 5)
  const [activeStep, setActiveStep] = useState(1)

  const formatDateForInput = (dateVal?: string) => {
    if (!dateVal) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) return dateVal
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return dateVal
    return d.toISOString().split('T')[0]
  }

  // Step 1: Personal Details
  const [personalDetails, setPersonalDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: verification.phoneNumber || '',
    dob: formatDateForInput(verification.dob),
  })

  // Step 2: Professional Details
  const [profDetails, setProfDetails] = useState({
    company: profile.company || 'Tech Enterprise',
    title: profile.title || 'Senior Tech Interviewer',
    yearsOfExperience: profile.yearsOfExperience || 5,
    linkedinUrl: verification.linkedinUrl || '',
    githubUrl: verification.githubUrl || '',
    bio: profile.bio || '',
  })

  const [skillInput, setSkillInput] = useState('')
  const [skillsList, setSkillsList] = useState<string[]>(
    profile.skills?.length ? profile.skills : ['System Design', 'React.js', 'Node.js', 'DSA']
  )

  // Step 3: Files & Identity
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [degreeFile, setDegreeFile] = useState<File | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const degreeInputRef = useRef<HTMLInputElement>(null)

  // Step 4: Bank & Payout Details
  const [bankForm, setBankForm] = useState({
    accountHolderName: bankDetails.accountHolderName || user?.name || '',
    bankName: bankDetails.bankName || '',
    accountNumber: bankDetails.accountNumber || '',
    ifscCode: bankDetails.ifscCode || '',
    upiId: bankDetails.upiId || '',
  })

  const [submittingKYC, setSubmittingKYC] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState('')
  const [verifyError, setVerifyError] = useState('')

  const isVerified = verification.status === 'verified' && profile.isApproved
  const isRejected = verification.status === 'rejected'
  const isPending = verification.status === 'pending' || verification.status === 'unverified'

  const handleAddSkill = () => {
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList((prev) => [...prev, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSkillsList((prev) => prev.filter((s) => s !== skill))
  }

  // Submit complete 5-step KYC verification
  const handleFinalKYCSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyError('')

    if (!bankForm.accountHolderName.trim()) {
      setVerifyError('Bank Account Holder Name is required for KYC payout verification.')
      setActiveStep(4)
      return
    }

    if (!resumeFile && !verification.resumeUrl) {
      setVerifyError('Please upload your Resume PDF to complete identity verification.')
      setActiveStep(3)
      return
    }

    const formData = new FormData()
    if (resumeFile) formData.append('resume', resumeFile)
    if (degreeFile) formData.append('degree', degreeFile)
    
    // Step 1 data
    formData.append('phoneNumber', personalDetails.phoneNumber)
    formData.append('dob', personalDetails.dob)
    
    // Step 2 data
    formData.append('title', profDetails.title)
    formData.append('company', profDetails.company)
    formData.append('yearsOfExperience', String(profDetails.yearsOfExperience))
    formData.append('linkedinUrl', profDetails.linkedinUrl)
    formData.append('githubUrl', profDetails.githubUrl)
    
    // Step 4 data
    formData.append('accountHolderName', bankForm.accountHolderName)
    formData.append('bankName', bankForm.bankName)
    formData.append('accountNumber', bankForm.accountNumber)
    formData.append('ifscCode', bankForm.ifscCode)
    formData.append('upiId', bankForm.upiId)

    try {
      setSubmittingKYC(true)
      const res = await axios.post(
        `${ServerUrl}/api/human-interview/verify-credentials`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      if (res.data?.user) {
        dispatch(setUserData(res.data.user))
        setSavedSuccess(res.data.message || 'KYC verification submitted successfully!')
        setActiveStep(5)
        setTimeout(() => setSavedSuccess(''), 5000)
      }
    } catch (error: any) {
      console.error('KYC submit error:', error)
      setVerifyError(error.response?.data?.message || 'Failed to submit KYC verification.')
    } finally {
      setSubmittingKYC(false)
    }
  }

  const steps = [
    { id: 1, title: 'Personal Details', icon: <BsPerson /> },
    { id: 2, title: 'Professional Details', icon: <BsBriefcase /> },
    { id: 3, title: 'Identity & Files', icon: <BsCreditCard2Front /> },
    { id: 4, title: 'Payment Details', icon: <BsBank /> },
    { id: 5, title: 'Verification Status', icon: <BsShieldCheck /> },
  ]

  return (
    <div className='py-2 space-y-8 max-w-4xl mx-auto'>
      <div>
        <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
          Interviewer Onboarding & KYC Verification
        </h1>
        <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1'>
          Complete the 5-step interviewer verification to start accepting paid mock interview bookings.
        </p>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 text-xs md:text-sm font-semibold p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 flex items-center gap-2.5'
        >
          <BsCheckCircleFill size={18} className='text-emerald-600 dark:text-emerald-400 shrink-0' />
          <span>{savedSuccess}</span>
        </motion.div>
      )}

      {verifyError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 text-xs md:text-sm font-semibold p-4 rounded-2xl border border-rose-200/80 dark:border-rose-800/80 flex items-center gap-2.5'
        >
          <BsExclamationTriangleFill size={18} className='text-rose-600 dark:text-rose-400 shrink-0' />
          <span>{verifyError}</span>
        </motion.div>
      )}

      {/* 5-Step Progress Tracker Bar */}
      <div className='bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-4 md:p-6 shadow-sm'>
        <div className='grid grid-cols-5 gap-2 text-center'>
          {steps.map((step) => {
            const isActive = activeStep === step.id
            const isCompleted = activeStep > step.id || (step.id === 5 && isVerified)

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/80'
                    : isCompleted
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}>
                  {isCompleted ? <BsCheckLg size={13} /> : step.id}
                </div>
                <span className='text-[10px] md:text-xs truncate w-full hidden sm:block'>{step.title}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* STEP CONTENT BODY */}
      <div className='bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6'>
        
        {/* STEP 1: Personal Details */}
        {activeStep === 1 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className='space-y-5'>
            <div className='border-b border-gray-100 dark:border-gray-800 pb-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                <BsPerson className='text-emerald-600' /> Step 1: Personal Details
              </h2>
              <p className='text-xs text-gray-500 mt-1'>Provide your basic contact information.</p>
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Full Name</label>
                <input
                  type='text'
                  value={personalDetails.name}
                  disabled
                  className='w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Email Address</label>
                <input
                  type='email'
                  value={personalDetails.email}
                  disabled
                  className='w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Phone Number</label>
                <div className='relative'>
                  <BsTelephone className='absolute left-3.5 top-3.5 text-gray-400 pointer-events-none' size={14} />
                  <input
                    type='tel'
                    value={personalDetails.phoneNumber}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, phoneNumber: e.target.value })}
                    placeholder='+91 9XXXX XXXXX'
                    className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Date of Birth</label>
                <div className='relative'>
                  <BsCalendarDate className='absolute left-3.5 top-3.5 text-gray-400 pointer-events-none' size={14} />
                  <input
                    type='date'
                    value={formatDateForInput(personalDetails.dob)}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, dob: e.target.value })}
                    onClick={(e) => (e.target as any).showPicker?.()}
                    className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer dark:[color-scheme:dark]'
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800'>
              <button
                onClick={() => setActiveStep(2)}
                className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition'
              >
                <span>Next: Professional Details</span>
                <BsChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Professional Details */}
        {activeStep === 2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className='space-y-5'>
            <div className='border-b border-gray-100 dark:border-gray-800 pb-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                <BsBriefcase className='text-emerald-600' /> Step 2: Professional Details
              </h2>
              <p className='text-xs text-gray-500 mt-1'>Highlight your engineering experience and domain skills.</p>
            </div>

            <div className='grid md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Current Company</label>
                <input
                  type='text'
                  value={profDetails.company}
                  onChange={(e) => setProfDetails({ ...profDetails, company: e.target.value })}
                  placeholder='e.g., Google, Amazon, Tech Enterprise'
                  className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Job Title</label>
                <input
                  type='text'
                  value={profDetails.title}
                  onChange={(e) => setProfDetails({ ...profDetails, title: e.target.value })}
                  placeholder='e.g., Senior Software Engineer'
                  className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Years of Experience</label>
                <input
                  type='number'
                  min={1}
                  max={40}
                  value={profDetails.yearsOfExperience}
                  onChange={(e) => setProfDetails({ ...profDetails, yearsOfExperience: Number(e.target.value) })}
                  className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                />
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>LinkedIn Profile URL</label>
                <div className='relative'>
                  <BsLink45Deg className='absolute left-3.5 top-3.5 text-gray-400 pointer-events-none' size={16} />
                  <input
                    type='url'
                    value={profDetails.linkedinUrl}
                    onChange={(e) => setProfDetails({ ...profDetails, linkedinUrl: e.target.value })}
                    placeholder='https://linkedin.com/in/username'
                    className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>GitHub / Portfolio URL</label>
                <div className='relative'>
                  <BsLink45Deg className='absolute left-3.5 top-3.5 text-gray-400 pointer-events-none' size={16} />
                  <input
                    type='url'
                    value={profDetails.githubUrl}
                    onChange={(e) => setProfDetails({ ...profDetails, githubUrl: e.target.value })}
                    placeholder='https://github.com/username'
                    className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                  />
                </div>
              </div>
            </div>

            {/* Tech Skills */}
            <div>
              <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Skills & Technologies</label>
              <div className='flex gap-2 mb-2'>
                <input
                  type='text'
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder='e.g., System Design, React, Node.js'
                  className='flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                />
                <button
                  type='button'
                  onClick={handleAddSkill}
                  className='bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer'
                >
                  Add Skill
                </button>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                {skillsList.map((skill, i) => (
                  <span
                    key={i}
                    className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5'
                  >
                    {skill}
                    <button type='button' onClick={() => handleRemoveSkill(skill)} className='hover:text-rose-500 cursor-pointer'>
                      <BsX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className='flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800'>
              <button
                onClick={() => setActiveStep(1)}
                className='bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer'
              >
                <BsChevronLeft size={12} />
                <span>Back</span>
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition'
              >
                <span>Next: Identity & Documents</span>
                <BsChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Identity & Files */}
        {activeStep === 3 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className='space-y-5'>
            <div className='border-b border-gray-100 dark:border-gray-800 pb-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                <BsCreditCard2Front className='text-emerald-600' /> Step 3: Identity & Document Verification
              </h2>
              <p className='text-xs text-gray-500 mt-1'>Upload your Resume & Degree / Certification PDF documents for verification audit.</p>
            </div>

            <div className='grid md:grid-cols-2 gap-6'>
              {/* Resume File Drop Box */}
              <div className='border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center space-y-3 bg-gray-50/50 dark:bg-gray-800/40'>
                <div className='w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto'>
                  <BsFileEarmarkText size={24} />
                </div>
                <div>
                  <h4 className='text-xs font-bold text-gray-900 dark:text-white'>Verified Resume PDF</h4>
                  <p className='text-[11px] text-gray-500 mt-0.5'>Max file size 10MB</p>
                </div>
                <input
                  type='file'
                  ref={resumeInputRef}
                  accept='.pdf'
                  className='hidden'
                  onChange={(e) => e.target.files?.[0] && setResumeFile(e.target.files[0])}
                />
                <button
                  type='button'
                  onClick={() => resumeInputRef.current?.click()}
                  className='bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer shadow-xs hover:border-emerald-500'
                >
                  <BsUpload size={14} />
                  <span>{resumeFile ? resumeFile.name : verification.resumeOriginalName || 'Select Resume PDF'}</span>
                </button>
              </div>

              {/* Degree / Certificate Drop Box */}
              <div className='border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center space-y-3 bg-gray-50/50 dark:bg-gray-800/40'>
                <div className='w-12 h-12 bg-teal-100 dark:bg-teal-950 text-teal-600 rounded-2xl flex items-center justify-center mx-auto'>
                  <BsMortarboard size={24} />
                </div>
                <div>
                  <h4 className='text-xs font-bold text-gray-900 dark:text-white'>Degree / Certificate PDF</h4>
                  <p className='text-[11px] text-gray-500 mt-0.5'>Degree or Technical Cert PDF</p>
                </div>
                <input
                  type='file'
                  ref={degreeInputRef}
                  accept='.pdf'
                  className='hidden'
                  onChange={(e) => e.target.files?.[0] && setDegreeFile(e.target.files[0])}
                />
                <button
                  type='button'
                  onClick={() => degreeInputRef.current?.click()}
                  className='bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer shadow-xs hover:border-emerald-500'
                >
                  <BsUpload size={14} />
                  <span>{degreeFile ? degreeFile.name : verification.degreeOriginalName || 'Select Degree PDF'}</span>
                </button>
              </div>
            </div>

            <div className='flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800'>
              <button
                onClick={() => setActiveStep(2)}
                className='bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer'
              >
                <BsChevronLeft size={12} />
                <span>Back</span>
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition'
              >
                <span>Next: Payment Details</span>
                <BsChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Payment Details */}
        {activeStep === 4 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className='space-y-5'>
            <div className='border-b border-gray-100 dark:border-gray-800 pb-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                <BsBank className='text-emerald-600' /> Step 4: Payout & Bank Account Details
              </h2>
              <p className='text-xs text-gray-500 mt-1'>Enter your bank account details for automated 80% net interview earnings payouts.</p>
            </div>

            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Account Holder Full Name</label>
                <input
                  type='text'
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  placeholder='Must match name on bank account'
                  className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Bank Name</label>
                <input
                  type='text'
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder='e.g., HDFC Bank, ICICI Bank, SBI'
                  className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>Account Number</label>
                <input
                  type='text'
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder='Enter Bank Account Number'
                  className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>IFSC Code</label>
                <input
                  type='text'
                  value={bankForm.ifscCode}
                  onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                  placeholder='e.g., HDFC0001234'
                  className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold uppercase focus:outline-none focus:border-emerald-500'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5'>UPI ID (Optional)</label>
                <input
                  type='text'
                  value={bankForm.upiId}
                  onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                  placeholder='username@upi or mobile@paytm'
                  className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-500'
                />
              </div>
            </div>

            <div className='flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800'>
              <button
                onClick={() => setActiveStep(3)}
                className='bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer'
              >
                <BsChevronLeft size={12} />
                <span>Back</span>
              </button>
              <button
                disabled={submittingKYC}
                onClick={handleFinalKYCSubmit}
                className='bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 cursor-pointer transition shadow-md shadow-emerald-600/20 disabled:opacity-50'
              >
                {submittingKYC ? <BsArrowRepeat className='animate-spin' size={14} /> : <BsPatchCheckFill size={14} />}
                <span>{submittingKYC ? 'Verifying & Auditing...' : 'Submit Complete KYC Verification'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: Verification Status Tracker */}
        {activeStep === 5 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className='space-y-6'>
            <div className='border-b border-gray-100 dark:border-gray-800 pb-4'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                <BsShieldCheck className='text-emerald-600' /> Step 5: Verification Status
              </h2>
              <p className='text-xs text-gray-500 mt-1'>Automated KYC identity match result and interviewer status.</p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-4 ${
              isVerified
                ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : isRejected
                  ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}>
              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                  isVerified ? 'bg-emerald-600' : isRejected ? 'bg-rose-600' : 'bg-amber-500'
                }`}>
                  {isVerified ? <BsCheckCircleFill size={20} /> : isRejected ? <BsXCircleFill size={20} /> : <BsExclamationTriangleFill size={20} />}
                </div>
                <div>
                  <h3 className='text-base font-extrabold capitalize'>
                    Status: {verification.status || 'Under Review'}
                  </h3>
                  <p className='text-xs font-semibold opacity-90'>
                    {isVerified
                      ? 'Congratulations! Your interviewer credentials & bank identity match have been fully verified. You can publish paid slots now.'
                      : isRejected
                        ? 'Verification Flagged: Identity or experience criteria mismatch detected.'
                        : 'Your submitted credentials are under active review by the HireReady verification engine.'}
                  </p>
                </div>
              </div>

              {verification.auditSummary && (
                <div className='bg-white/80 dark:bg-gray-900/80 p-3.5 rounded-xl border border-current text-xs font-medium space-y-1'>
                  <p className='font-bold uppercase text-[10px] tracking-wider'>Audit Summary</p>
                  <p>{verification.auditSummary}</p>
                  {verification.mismatchReason && <p className='text-rose-600 font-bold mt-1'>{verification.mismatchReason}</p>}
                </div>
              )}
            </div>

            <div className='flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800'>
              <button
                onClick={() => setActiveStep(4)}
                className='bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer'
              >
                <BsChevronLeft size={12} />
                <span>Update KYC Form</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default InterviewerProfile
