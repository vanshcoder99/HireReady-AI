import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { 
  BsCalendarCheck, 
  BsExclamationTriangleFill,
  BsCameraVideo, 
  BsStarFill,
  BsPeople,
  BsPlusLg,
  BsBank,
  BsShieldCheck,
  BsCurrencyRupee,
  BsTrash,
  BsX,
  BsArrowRepeat,
  BsBell,
  BsEye,
  BsTrophy,
  BsChevronDown,
  BsChevronUp,
  BsWallet2,
  BsClockHistory,
  BsCheckCircleFill
} from 'react-icons/bs'
import { ServerUrl } from '../App'

function InterviewerDashboard() {
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)

  const [dashboardData, setDashboardData] = useState<any>(null)
  const [earningsData, setEarningsData] = useState<any>(null)
  const [mySlots, setMySlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Wallet & Withdrawal State
  const [walletData, setWalletData] = useState<any>(null)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false)
  const [withdrawAlert, setWithdrawAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Create Slot Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [slotRole, setSlotRole] = useState('Frontend Engineer')
  const [experienceLevel, setExperienceLevel] = useState('Intermediate (1-3 yrs)')
  const [duration, setDuration] = useState('45 Minutes')
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState('19:00')
  const [price, setPrice] = useState(299)
  const [slotDescription, setSlotDescription] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [requiredSkills, setRequiredSkills] = useState(['React.js', 'JavaScript', 'System Design'])
  const [creatingSlot, setCreatingSlot] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([])

  // Collapsible Sections
  const [showCompleted, setShowCompleted] = useState(false)
  const [showEarningsHistory, setShowEarningsHistory] = useState(true)
  // Feedback Modal
  const [viewingFeedback, setViewingFeedback] = useState<any>(null)

  const isSlotUpcoming = (dateStr: string, timeStr?: string): boolean => {
    if (!dateStr) return true
    try {
      let cleanDateStr = dateStr.replace(/ at /i, ' ').trim()
      let combinedStr = cleanDateStr
      if (timeStr && !cleanDateStr.toLowerCase().includes('pm') && !cleanDateStr.toLowerCase().includes('am')) {
        combinedStr = `${cleanDateStr} ${timeStr}`
      }
      let parsedDate = new Date(combinedStr)
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date(cleanDateStr)
        if (isNaN(parsedDate.getTime())) return true
        if (timeStr) {
          let hours = 0, minutes = 0
          const pmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i)
          if (pmMatch) {
            hours = parseInt(pmMatch[1], 10)
            minutes = parseInt(pmMatch[2], 10)
            const ampm = pmMatch[3] ? pmMatch[3].toUpperCase() : null
            if (ampm === 'PM' && hours < 12) hours += 12
            if (ampm === 'AM' && hours === 12) hours = 0
          }
          parsedDate.setHours(hours, minutes, 0, 0)
        }
      }
      const threshold = new Date(Date.now() - 45 * 60 * 1000)
      return parsedDate >= threshold
    } catch {
      return true
    }
  }

  const socketRef = useRef<any>(null)

  const fetchAllInterviewerData = async () => {
    try {
      setLoading(true)
      const [dashRes, earnRes, slotsRes, walletRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/human-interview/interviewer/dashboard`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/human-interview/interviewer/earnings`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/human-interview/slots/my-slots`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/human-interview/interviewer/wallet`, { withCredentials: true }),
      ])
      setDashboardData(dashRes.data)
      setEarningsData(earnRes.data)
      setMySlots(slotsRes.data || [])
      setWalletData(walletRes.data)
    } catch (error) {
      console.error('Fetch interviewer data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawAlert(null)
    setSubmittingWithdrawal(true)
    try {
      const res = await axios.post(
        `${ServerUrl}/api/human-interview/interviewer/withdraw`,
        { amount: Number(withdrawAmount) },
        { withCredentials: true }
      )
      setWithdrawAlert({ type: 'success', message: res.data.message })
      setWithdrawAmount('')
      await fetchAllInterviewerData()
    } catch (error: any) {
      setWithdrawAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit withdrawal request.',
      })
    } finally {
      setSubmittingWithdrawal(false)
    }
  }

  useEffect(() => {
    fetchAllInterviewerData()

    // Default slot date tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSlotDate(tomorrow.toISOString().split('T')[0])

    socketRef.current = io(ServerUrl, { withCredentials: true })
    const socket = socketRef.current

    const userId = userData?.id || userData?.user?.id || userData?.user?._id
    if (userId) {
      socket.emit('register-user', { userId })
    }

    socket.on('booking-notification', ({ message, bookingId }: any) => {
      setNotifications((prev) => [{ message, bookingId, time: new Date() }, ...prev])
      fetchAllInterviewerData()
    })

    socket.on('booking-confirmed', () => {
      fetchAllInterviewerData()
    })

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const handleStartInterviewSession = async (bookingId: string) => {
    try {
      await axios.post(`${ServerUrl}/api/human-interview/session/start/${bookingId}`, {}, { withCredentials: true })
      navigate(`/interview/room/${bookingId}`)
    } catch (err) {
      console.error('Start interview session error:', err)
      navigate(`/interview/room/${bookingId}`)
    }
  }

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return 'TBD'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const formatTimeForDisplay = (timeStr: string) => {
    if (!timeStr) return 'TBD'
    try {
      const [h, m] = timeStr.split(':')
      const hour = parseInt(h, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${m} ${ampm}`
    } catch {
      return timeStr
    }
  }

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingSlot(true)
    try {
      const displayDate = formatDateForDisplay(slotDate)
      const displayTime = formatTimeForDisplay(slotTime)

      const res = await axios.post(
        `${ServerUrl}/api/human-interview/slots/create`,
        {
          role: slotRole,
          experienceLevel,
          duration,
          date: displayDate,
          time: displayTime,
          price,
          requiredSkills,
          description: slotDescription,
        },
        { withCredentials: true }
      )
      if (res.data?.slot) {
        setShowCreateModal(false)
        setSlotDescription('')
        await fetchAllInterviewerData()
        alert('New interview slot published for candidates!')
      }
    } catch (error: any) {
      console.error('Create slot error:', error)
      alert(error.response?.data?.message || 'Failed to create slot.')
    } finally {
      setCreatingSlot(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm('Are you sure you want to remove this published slot?')) return
    try {
      await axios.delete(`${ServerUrl}/api/human-interview/slots/${slotId}`, { withCredentials: true })
      await fetchAllInterviewerData()
    } catch (error) {
      alert('Failed to delete slot.')
    }
  }

  const handleAddSkillTag = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills((prev) => [...prev, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skill))
  }

  if (loading) {
    return (
      <div className='py-12 flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-3'>
          <div className='w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto' />
          <p className='text-gray-500 text-sm font-medium'>Loading Interviewer Dashboard...</p>
        </div>
      </div>
    )
  }

  const user = userData?.user || userData
  const todayInterviews = dashboardData?.todayInterviews || []
  const completedInterviews = dashboardData?.completedInterviews || []
  const netEarnings = earningsData?.netEarnings ?? dashboardData?.stats?.totalNetEarnings ?? 0
  const todayEarnings = earningsData?.todayEarnings ?? 0
  const weeklyEarnings = earningsData?.weeklyEarnings ?? 0
  const monthlyEarnings = earningsData?.monthlyEarnings ?? 0
  const pendingPayouts = earningsData?.pendingPayouts ?? 0
  const totalStudents = earningsData?.totalStudentsInterviewed ?? dashboardData?.stats?.totalSessions ?? 0
  const avgRating = earningsData?.averageRating ?? dashboardData?.stats?.rating ?? 4.9

  const isApproved = user?.interviewerProfile?.isApproved
  const verification = user?.interviewerProfile?.verificationDetails || {}
  const isVerified = isApproved && verification.status === 'verified'

  const handleOpenCreateModal = () => {
    if (!isVerified) {
      if (window.confirm('Interviewer Verification Required: You must complete identity & bank KYC before publishing slots.\n\nGo to your Profile now?')) {
        navigate('/interviewer/profile')
      }
      return
    }
    setShowCreateModal(true)
  }

  return (
    <div className='pt-6 pb-12 space-y-8 min-h-screen flex flex-col justify-between'>
      <div className='space-y-8 flex-1'>
        {/* Header Bar */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
                Interviewer Dashboard
              </h1>
              {isVerified ? (
                <span className='bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1'>
                  <BsShieldCheck size={12} /> Verified Interviewer
                </span>
              ) : (
                <span className='bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800'>
                  Verification Pending
                </span>
              )}
            </div>
            <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm'>
              Manage candidate mock interview slots, track payout earnings, and conduct live WebRTC interviews.
            </p>
          </div>

          <div className='flex items-center gap-3 self-start sm:self-auto'>
            <button
              onClick={() => navigate('/interviewer/profile')}
              className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs flex items-center gap-2'
            >
              <BsBank size={14} />
              <span>KYC Verification & Bank</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
            >
              <BsPlusLg size={14} />
              <span>Create Interview Slot</span>
            </button>
          </div>
        </div>

        {/* Verification Warning Alert Banner */}
        {!isVerified && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs'
          >
            <div className='flex items-start sm:items-center gap-3.5'>
              <div className='w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm'>
                <BsExclamationTriangleFill size={20} />
              </div>
              <div>
                <h4 className='font-extrabold text-amber-950 dark:text-amber-200 text-sm md:text-base'>
                  {verification.status === 'rejected'
                    ? 'Identity Verification Action Needed'
                    : 'Interviewer Identity & KYC Verification Required'}
                </h4>
                <p className='text-xs text-amber-800 dark:text-amber-300 mt-0.5 font-medium leading-relaxed'>
                  {verification.mismatchReason ||
                    'Complete the 5-step onboarding workflow to upload your resume, degree, and matching bank account holder details.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/interviewer/profile')}
              className='bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl shrink-0 transition shadow-sm cursor-pointer'
            >
              Complete Verification & KYC →
            </button>
          </motion.div>
        )}

        {/* Live Notifications Banner */}
        {notifications.length > 0 && (
          <div className='space-y-2'>
            {notifications.slice(0, 3).map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className='bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 flex items-center justify-between text-xs'
              >
                <div className='flex items-center gap-2.5'>
                  <BsBell size={15} className='text-amber-600 dark:text-amber-400' />
                  <span className='font-semibold text-amber-900 dark:text-amber-200'>{n.message}</span>
                </div>
                <button
                  onClick={() => setNotifications((prev) => prev.filter((_, idx) => idx !== i))}
                  className='text-amber-600 dark:text-amber-400 hover:text-amber-800 cursor-pointer'
                >
                  <BsX size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stat Cards Grid */}
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-2'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center border bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'>
              <BsCurrencyRupee size={18} />
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider'>Total Net Earnings</p>
            <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>₹{netEarnings}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>After 20% platform fee</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-2'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center border bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'>
              <BsPeople size={18} />
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider'>Students Interviewed</p>
            <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>{totalStudents}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Distinct candidates</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-2'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center border bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800'>
              <BsCalendarCheck size={18} />
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider'>Upcoming Sessions</p>
            <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>{todayInterviews.length}</p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Ready to conduct</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-2'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center border bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800'>
              <BsStarFill size={18} />
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider'>Interviewer Rating</p>
            <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>{avgRating} ★</p>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Candidate satisfaction</p>
          </motion.div>
        </div>

        {/* Interviewer Wallet & Cash Out Panel */}
        <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-6'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4'>
            <div>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2'>
                <BsWallet2 className='text-emerald-600 dark:text-emerald-400' /> Interviewer Earnings Wallet
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                Real-time wallet ledger, available balance, bank payout details, and withdrawal requests.
              </p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 self-start sm:self-auto'
            >
              <BsBank size={14} />
              <span>Withdraw / Cash Out</span>
            </button>
          </div>

          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-emerald-500 text-white p-5 rounded-2xl shadow-sm space-y-1 relative overflow-hidden'>
              <div className='flex justify-between items-center text-xs font-bold text-emerald-100 uppercase tracking-wider'>
                <span>Available Balance</span>
                <BsCheckCircleFill className='text-white/80' size={14} />
              </div>
              <p className='text-3xl font-black'>₹{walletData?.wallet?.balance ?? 0}</p>
              <p className='text-[11px] text-emerald-100 font-medium'>Ready for cash out withdrawal</p>
            </div>

            <div className='bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-1'>
              <div className='flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider'>
                <span>Pending Earnings</span>
                <BsClockHistory className='text-amber-500' size={14} />
              </div>
              <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>₹{walletData?.wallet?.pendingBalance ?? pendingPayouts}</p>
              <p className='text-[11px] text-gray-500 dark:text-gray-400'>Credited after session completion</p>
            </div>

            <div className='bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-1'>
              <div className='flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider'>
                <span>Total Lifetime Net</span>
                <BsCurrencyRupee className='text-emerald-500' size={14} />
              </div>
              <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>₹{walletData?.wallet?.totalEarned ?? netEarnings}</p>
              <p className='text-[11px] text-gray-500 dark:text-gray-400'>Total earned (80% net)</p>
            </div>

            <div className='bg-gray-50 dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-1'>
              <div className='flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider'>
                <span>Total Withdrawn</span>
                <BsBank className='text-purple-500' size={14} />
              </div>
              <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>₹{walletData?.wallet?.totalWithdrawn ?? 0}</p>
              <p className='text-[11px] text-gray-500 dark:text-gray-400'>Transferred / Requested</p>
            </div>
          </div>

          {/* Bank Account Destination Preview */}
          <div className='bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-200/80 dark:border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200'>
                <BsBank size={18} />
              </div>
              <div>
                <p className='text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2'>
                  <span>Payout Bank Account: {walletData?.bankDetails?.maskedAccountNumber || 'Not Configured'}</span>
                  {walletData?.bankDetails?.isVerified ? (
                    <span className='bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full'>
                      Verified KYC
                    </span>
                  ) : (
                    <span className='bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full'>
                      Unverified
                    </span>
                  )}
                </p>
                <p className='text-[11px] text-gray-500 dark:text-gray-400 mt-0.5'>
                  {walletData?.bankDetails?.bankName} • Account Holder: {walletData?.bankDetails?.accountHolderName || 'None'} • IFSC: {walletData?.bankDetails?.ifscCode || 'None'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/interviewer/profile')}
              className='text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer self-start sm:self-auto'
            >
              Edit Bank Details →
            </button>
          </div>

          {/* Wallet Ledger Transactions Table */}
          {walletData?.transactions?.length > 0 && (
            <div className='space-y-3 pt-2'>
              <h4 className='text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2'>
                <BsClockHistory /> Recent Wallet Ledger Transactions ({walletData.transactions.length})
              </h4>
              <div className='overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-gray-800'>
                <table className='w-full text-left text-xs'>
                  <thead className='bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold'>
                    <tr>
                      <th className='p-3'>Date</th>
                      <th className='p-3'>Type</th>
                      <th className='p-3'>Description</th>
                      <th className='p-3'>Amount</th>
                      <th className='p-3'>Status</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100 dark:divide-gray-800 font-semibold'>
                    {walletData.transactions.map((tx: any) => (
                      <tr key={tx.id} className='hover:bg-gray-50/50 dark:hover:bg-gray-800/50'>
                        <td className='p-3 text-gray-500 dark:text-gray-400 font-mono'>
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className='p-3'>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.type === 'EARNINGS_CREDITED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : tx.type === 'WITHDRAWAL_REQUEST'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className='p-3 text-gray-800 dark:text-gray-200'>{tx.description}</td>
                        <td className={`p-3 font-extrabold ${tx.amount < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {tx.amount < 0 ? `-₹${Math.abs(tx.amount)}` : `+₹${tx.amount}`}
                        </td>
                        <td className='p-3'>
                          <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase'>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Financial Earnings Breakdown */}
        <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-5'>
          <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4'>
            <div>
              <h3 className='text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2'>
                <BsWallet2 className='text-emerald-600' /> Financial Earnings & Payout Analytics
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>Comprehensive revenue breakdown and payout processing status.</p>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-center'>
            <div className='bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60'>
              <p className='text-[10px] font-bold uppercase text-gray-400'>Today</p>
              <p className='text-xl font-extrabold text-gray-900 dark:text-white mt-1'>₹{todayEarnings}</p>
            </div>

            <div className='bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60'>
              <p className='text-[10px] font-bold uppercase text-gray-400'>This Week</p>
              <p className='text-xl font-extrabold text-gray-900 dark:text-white mt-1'>₹{weeklyEarnings}</p>
            </div>

            <div className='bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60'>
              <p className='text-[10px] font-bold uppercase text-gray-400'>This Month</p>
              <p className='text-xl font-extrabold text-gray-900 dark:text-white mt-1'>₹{monthlyEarnings}</p>
            </div>

            <div className='bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/60'>
              <p className='text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300'>Pending Payout</p>
              <p className='text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1'>₹{pendingPayouts}</p>
            </div>
          </div>

          {/* Earnings Audit Log */}
          {earningsData?.history?.length > 0 && (
            <div className='pt-2'>
              <button
                onClick={() => setShowEarningsHistory(!showEarningsHistory)}
                className='text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 cursor-pointer hover:text-emerald-600 mb-3'
              >
                <BsClockHistory />
                <span>Interview Payout Audit History ({earningsData.history.length})</span>
                {showEarningsHistory ? <BsChevronUp size={12} /> : <BsChevronDown size={12} />}
              </button>

              {showEarningsHistory && (
                <div className='overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-gray-800'>
                  <table className='w-full text-left text-xs'>
                    <thead className='bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase text-[10px] font-bold'>
                      <tr>
                        <th className='p-3'>Learner Candidate</th>
                        <th className='p-3'>Interview Role</th>
                        <th className='p-3'>Gross Amount</th>
                        <th className='p-3'>Platform Fee (20%)</th>
                        <th className='p-3'>Net Earnings (80%)</th>
                        <th className='p-3'>Payout Status</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 dark:divide-gray-800 font-semibold'>
                      {earningsData.history.map((rec: any) => (
                        <tr key={rec.id} className='hover:bg-gray-50/50 dark:hover:bg-gray-800/50'>
                          <td className='p-3 text-gray-900 dark:text-white'>{rec.learnerName}</td>
                          <td className='p-3 text-emerald-600 dark:text-emerald-400'>{rec.slotRole}</td>
                          <td className='p-3 text-gray-900 dark:text-white'>₹{rec.amount}</td>
                          <td className='p-3 text-rose-500'>-₹{rec.platformFee}</td>
                          <td className='p-3 text-emerald-700 dark:text-emerald-300 font-bold'>₹{rec.netEarnings}</td>
                          <td className='p-3'>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              rec.status === 'credited' || rec.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Published Slots Management */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-bold text-gray-900 dark:text-white tracking-tight'>Your Published Slots</h3>
            <div className='flex items-center gap-3'>
              <span className='text-xs text-gray-500 dark:text-gray-400 font-medium'>{mySlots.length} total slots</span>
              <button
                onClick={() => navigate('/interviewer/create-slots')}
                className='text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer flex items-center gap-1 transition'
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {(() => {
            const activeDashboardSlots = mySlots.filter((s: any) => isSlotUpcoming(s.date, s.time))
            return activeDashboardSlots.length > 0 ? (
              <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
                {activeDashboardSlots.slice(0, 3).map((slot) => (
                  <div key={slot._id || slot.id} className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-3 relative'>
                    <div className='flex justify-between items-center'>
                      <span className='bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800'>
                        {slot.role} • {slot.duration}
                      </span>
                      <span className='text-xs font-extrabold text-gray-900 dark:text-white'>₹{slot.price}</span>
                    </div>

                    <div>
                      <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>{slot.experienceLevel}</p>
                      <p className='text-sm font-bold text-gray-900 dark:text-white mt-1'>{slot.date} at {slot.time}</p>
                      {slot.description && (
                        <p className='text-[11px] text-gray-400 mt-1 line-clamp-2'>{slot.description}</p>
                      )}
                    </div>

                    <div className='flex flex-wrap gap-1'>
                      {(slot.requiredSkills || []).map((sk: string, i: number) => (
                        <span key={i} className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
                          {sk}
                        </span>
                      ))}
                    </div>

                    <div className='flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800 text-xs'>
                      <span className={`font-mono font-semibold capitalize ${
                        slot.status === 'booked' ? 'text-blue-600 dark:text-blue-400' : slot.status === 'published' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                      }`}>
                        Status: {slot.status}
                      </span>
                      <button
                        onClick={() => handleDeleteSlot(slot._id || slot.id)}
                        className='text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 font-semibold cursor-pointer flex items-center gap-1'
                      >
                        <BsTrash size={12} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 text-center text-xs text-gray-400 dark:text-gray-500'>
                No active published slots right now. Click "Create Interview Slot" above to publish one for candidates.
              </div>
            )
          })()}
        </div>

        {/* Upcoming Sessions */}
        <div className='space-y-4'>
          <h3 className='text-lg font-bold text-gray-900 dark:text-white tracking-tight'>Upcoming Live Sessions</h3>

          {todayInterviews.length > 0 ? (
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {todayInterviews.map((b: any) => {
                const isLive = b.status === 'Live'
                return (
                  <motion.div
                    key={b._id || b.id}
                    whileHover={{ y: -3 }}
                    className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-xs space-y-4 relative ${
                      isLive
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-gray-200/90 dark:border-gray-800'
                    }`}
                  >
                    <div className='flex justify-between items-center'>
                      <span className='bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800'>
                        {b.date} • {b.timeSlot}
                      </span>
                      <span className={`text-xs font-bold flex items-center gap-1 ${
                        isLive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {b.status || 'Scheduled'}
                      </span>
                    </div>

                    <div>
                      <h4 className='font-extrabold text-gray-900 dark:text-white text-base'>{b.user?.name || b.userId?.name || 'Candidate'}</h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{b.user?.email || b.userId?.email || 'candidate@email.com'}</p>
                      {b.notes && <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-1'>{b.notes}</p>}
                    </div>

                    <button
                      onClick={() => handleStartInterviewSession(b.id || b._id)}
                      className={`w-full py-2.5 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md flex items-center justify-center gap-2 ${
                        isLive
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 animate-pulse'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      }`}
                    >
                      <BsCameraVideo size={16} />
                      <span>{isLive ? 'Rejoin Live Session' : 'Start Live Interview'}</span>
                    </button>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-6 text-center text-xs text-gray-400 dark:text-gray-500'>
              No upcoming candidate sessions booked currently.
            </div>
          )}
        </div>

        {/* Completed Interviews */}
        {completedInterviews.length > 0 && (
          <div className='space-y-4'>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className='flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white tracking-tight cursor-pointer hover:text-emerald-600 transition'
            >
              <BsTrophy className='text-emerald-600' />
              Completed Interviews ({completedInterviews.length})
              {showCompleted ? <BsChevronUp size={14} /> : <BsChevronDown size={14} />}
            </button>

            <AnimatePresence>
              {showCompleted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'
                >
                  {completedInterviews.map((ci: any) => (
                    <div
                      key={ci.id || ci._id}
                      className='bg-white dark:bg-gray-900 border border-purple-200/80 dark:border-purple-900/50 rounded-2xl p-5 shadow-xs space-y-3'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800'>
                          Completed
                        </span>
                        <span className='text-xs text-gray-400 font-mono'>{ci.date}</span>
                      </div>

                      <div>
                        <h4 className='font-bold text-gray-900 dark:text-white text-sm'>{ci.user?.name || ci.userId?.name || 'Candidate'}</h4>
                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>{ci.user?.email || ci.userId?.email}</p>
                      </div>

                      {ci.finalScore > 0 && (
                        <div className='bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-2 text-center'>
                          <span className='text-lg font-extrabold text-emerald-700 dark:text-emerald-300'>{ci.finalScore}/10</span>
                        </div>
                      )}

                      <button
                        onClick={() => setViewingFeedback(ci)}
                        className='w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5'
                      >
                        <BsEye size={12} />
                        <span>View Submitted Feedback</span>
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CREATE SLOT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-gray-900 dark:text-gray-100'
            >
              <div className='flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3'>
                <h3 className='font-bold text-lg text-gray-900 dark:text-white'>Publish New Interview Slot</h3>
                <button onClick={() => setShowCreateModal(false)} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer'>
                  <BsX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSlot} className='space-y-4 text-xs'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='font-semibold text-gray-600 dark:text-gray-300 block mb-1'>Target Role</label>
                    <input
                      type='text'
                      value={slotRole}
                      onChange={(e) => setSlotRole(e.target.value)}
                      className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-bold focus:outline-none'
                      required
                    />
                  </div>

                  <div>
                    <label className='font-semibold text-gray-600 dark:text-gray-300 block mb-1'>Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-bold focus:outline-none'
                    >
                      <option>Entry Level (0-1 yrs)</option>
                      <option>Intermediate (1-3 yrs)</option>
                      <option>Senior (3-6 yrs)</option>
                      <option>Lead / Architect (6+ yrs)</option>
                    </select>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <label className='font-semibold text-gray-600 dark:text-gray-300 block mb-1'>Date</label>
                    <input
                      type='date'
                      min={new Date().toISOString().split('T')[0]}
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-bold focus:outline-none'
                      required
                    />
                  </div>

                  <div>
                    <label className='font-semibold text-gray-600 dark:text-gray-300 block mb-1'>Time</label>
                    <input
                      type='time'
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-bold focus:outline-none'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='font-semibold text-gray-600 dark:text-gray-300 block mb-1'>Price (₹ INR)</label>
                  <input
                    type='number'
                    min={49}
                    max={5000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-bold focus:outline-none'
                    required
                  />
                  <p className='text-[10px] text-gray-400 mt-1'>Platform Fee: 20% (Your Net Payout: ₹{Math.round(price * 0.8)})</p>
                </div>

                <div>
                  <label className='font-semibold text-gray-600 dark:text-gray-300 block mb-1'>Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={slotDescription}
                    onChange={(e) => setSlotDescription(e.target.value)}
                    placeholder='Describe topics covered in this mock interview...'
                    className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none'
                  />
                </div>

                {/* Tech Skills */}
                <div>
                  <label className='font-semibold text-gray-600 dark:text-gray-300 block mb-1'>Required Tech Skills</label>
                  <div className='flex gap-2 mb-2'>
                    <input
                      type='text'
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkillTag())}
                      placeholder='e.g., React.js, Node.js'
                      className='flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 focus:outline-none'
                    />
                    <button type='button' onClick={handleAddSkillTag} className='bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer'>
                      Add
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {requiredSkills.map((sk, i) => (
                      <span key={i} className='bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1'>
                        {sk}
                        <button type='button' onClick={() => handleRemoveSkill(sk)} className='hover:text-rose-600 cursor-pointer'>
                          <BsX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className='flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800'>
                  <button
                    type='button'
                    onClick={() => setShowCreateModal(false)}
                    className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium cursor-pointer'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={creatingSlot}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50'
                  >
                    {creatingSlot ? <BsArrowRepeat className='animate-spin' size={14} /> : null}
                    <span>{creatingSlot ? 'Publishing Slot...' : 'Publish Slot'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CASH OUT WITHDRAWAL MODAL */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-3xl max-w-md w-full p-7 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5 relative'
            >
              <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3'>
                <h3 className='font-extrabold text-base flex items-center gap-2'>
                  <BsBank className='text-emerald-600 dark:text-emerald-400' size={18} />
                  Withdraw Earnings to Bank
                </h3>
                <button onClick={() => setShowWithdrawModal(false)} className='text-gray-400 hover:text-gray-800 dark:hover:text-white p-1 cursor-pointer'>
                  <BsX size={20} />
                </button>
              </div>

              <div className='bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-200 space-y-1'>
                <p className='font-bold text-sm'>Available Wallet Balance: ₹{walletData?.wallet?.balance ?? 0}</p>
                <p className='text-[11px] text-emerald-700 dark:text-emerald-300'>
                  Payout Destination: {walletData?.bankDetails?.maskedAccountNumber || 'Bank Account'} ({walletData?.bankDetails?.ifscCode || 'IFSC'})
                </p>
              </div>

              {withdrawAlert && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold ${withdrawAlert.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200'}`}>
                  {withdrawAlert.message}
                </div>
              )}

              <form onSubmit={handleRequestWithdrawal} className='space-y-4 text-xs'>
                <div>
                  <label className='font-semibold text-gray-700 dark:text-gray-300 block mb-1.5'>Withdrawal Amount (₹ INR)</label>
                  <input
                    type='number'
                    min='1'
                    max={walletData?.wallet?.balance ?? 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder='Enter amount e.g. 500'
                    className='w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none text-sm font-extrabold text-gray-900 dark:text-white'
                    required
                  />
                </div>

                <div className='flex justify-end gap-3 pt-2'>
                  <button type='button' onClick={() => setShowWithdrawModal(false)} className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium cursor-pointer'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={submittingWithdrawal || !withdrawAmount || Number(withdrawAmount) <= 0}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-2 disabled:opacity-50'
                  >
                    {submittingWithdrawal ? <BsArrowRepeat className='animate-spin' size={14} /> : <BsBank size={14} />}
                    <span>{submittingWithdrawal ? 'Submitting Request...' : 'Confirm Withdrawal Request'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default InterviewerDashboard
