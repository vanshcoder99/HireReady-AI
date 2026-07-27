import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { 
  BsCalendarCheck, 
  BsClockHistory, 
  BsCheckCircleFill, 
  BsXCircleFill, 
  BsCameraVideo, 
  BsStarFill,
  BsPeople,
  BsPlusLg,
  BsBank,
  BsCurrencyRupee,
  BsTrash,
  BsX,
  BsArrowRepeat,
  BsBell,
  BsEye,
  BsClipboard2Check,
  BsTrophy,
  BsChevronDown,
  BsChevronUp
} from 'react-icons/bs'
import { ServerUrl } from '../App.jsx'

function InterviewerDashboard() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)
  const [dashboardData, setDashboardData] = useState(null)
  const [earningsData, setEarningsData] = useState(null)
  const [mySlots, setMySlots] = useState([])
  const [loading, setLoading] = useState(true)

  // Create Slot Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [slotRole, setSlotRole] = useState('Frontend')
  const [experienceLevel, setExperienceLevel] = useState('Intermediate (1-3 yrs)')
  const [duration, setDuration] = useState('45 Minutes')
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState('19:00')
  const [price, setPrice] = useState(299)
  const [slotDescription, setSlotDescription] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [requiredSkills, setRequiredSkills] = useState(['React.js', 'JavaScript', 'CSS'])
  const [creatingSlot, setCreatingSlot] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState([])

  // Show/hide completed
  const [showCompleted, setShowCompleted] = useState(false)

  // Feedback view
  const [viewingFeedback, setViewingFeedback] = useState(null)

  const socketRef = useRef(null)

  const fetchAllInterviewerData = async () => {
    try {
      setLoading(true)
      const [dashRes, earnRes, slotsRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/human-interview/interviewer/dashboard`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/human-interview/interviewer/earnings`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/human-interview/slots/my-slots`, { withCredentials: true }),
      ])
      setDashboardData(dashRes.data)
      setEarningsData(earnRes.data)
      setMySlots(slotsRes.data || [])
    } catch (error) {
      console.error('Fetch interviewer data error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllInterviewerData()

    // Set default date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSlotDate(tomorrow.toISOString().split('T')[0])

    // Socket.IO for real-time booking notifications
    socketRef.current = io(ServerUrl, { withCredentials: true })
    const socket = socketRef.current

    const userId = userData?.user?._id
    if (userId) {
      socket.emit('register-user', { userId })
    }

    socket.on('booking-notification', ({ message, bookingId }) => {
      setNotifications((prev) => [{ message, bookingId, time: new Date() }, ...prev])
      // Refresh dashboard data
      fetchAllInterviewerData()
    })

    socket.on('booking-confirmed', () => {
      fetchAllInterviewerData()
    })

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const handleStartInterviewSession = async (bookingId) => {
    try {
      const res = await axios.post(`${ServerUrl}/api/human-interview/session/start/${bookingId}`, {}, { withCredentials: true })
      navigate(`/interview/room/${bookingId}`)
    } catch (err) {
      console.error('Start interview session error:', err)
      navigate(`/interview/room/${bookingId}`)
    }
  }

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return 'TBD'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const formatTimeForDisplay = (timeStr) => {
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

  const handleCreateSlot = async (e) => {
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
        setMySlots((prev) => [res.data.slot, ...prev])
        setShowCreateModal(false)
        setSlotDescription('')
        alert('New interview slot published for candidates!')
      }
    } catch (error) {
      console.error('Create slot error:', error)
      alert(error.response?.data?.message || 'Failed to create slot.')
    } finally {
      setCreatingSlot(false)
    }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this published slot?')) return
    try {
      await axios.delete(`${ServerUrl}/api/human-interview/slots/${slotId}`, { withCredentials: true })
      setMySlots((prev) => prev.filter((s) => (s._id || s.id) !== slotId))
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

  const handleRemoveSkill = (skill) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skill))
  }

  if (loading) {
    return (
      <div className='py-12 flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-3'>
          <div className='w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto' />
          <p className='text-gray-500 text-sm font-medium'>Loading Interviewer Portal...</p>
        </div>
      </div>
    )
  }

  const todayInterviews = dashboardData?.todayInterviews || []
  const completedInterviews = dashboardData?.completedInterviews || []
  const grossRevenue = earningsData?.grossRevenue || 0
  const netEarnings = earningsData?.netEarnings || 0

  return (
    <div className='py-2 space-y-8'>
      {/* Header & Create Slot Button */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight'>
            Interviewer Portal Dashboard
          </h1>
          <p className='text-gray-500 text-sm mt-1'>
            Manage candidate mock interview slots, track payout earnings, and conduct live WebRTC interviews.
          </p>
        </div>

        <div className='flex items-center gap-3 self-start sm:self-auto'>
          <button
            onClick={() => navigate('/interviewer/profile')}
            className='bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs flex items-center gap-2'
          >
            <BsBank size={14} />
            <span>KYC Bank Details</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
          >
            <BsPlusLg size={14} />
            <span>Create Interview Slot</span>
          </button>
        </div>
      </div>

      {/* Booking Notifications */}
      {notifications.length > 0 && (
        <div className='space-y-2'>
          {notifications.slice(0, 3).map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className='bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs'
            >
              <div className='flex items-center gap-2'>
                <BsBell size={14} className='text-amber-600' />
                <span className='font-semibold text-amber-900'>{n.message}</span>
              </div>
              <button
                onClick={() => setNotifications((prev) => prev.filter((_, idx) => idx !== i))}
                className='text-amber-600 hover:text-amber-800 cursor-pointer'
              >
                <BsX size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className='bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-2'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center border bg-emerald-50 text-emerald-600 border-emerald-100'>
            <BsCurrencyRupee size={18} />
          </div>
          <p className='text-xs text-gray-400 font-semibold uppercase tracking-wider'>Net Earnings</p>
          <p className='text-2xl font-extrabold text-gray-900'>₹{netEarnings}</p>
          <p className='text-xs text-gray-500'>After 20% platform fee</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className='bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-2'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center border bg-blue-50 text-blue-600 border-blue-100'>
            <BsPeople size={18} />
          </div>
          <p className='text-xs text-gray-400 font-semibold uppercase tracking-wider'>Total Sessions</p>
          <p className='text-2xl font-extrabold text-gray-900'>{completedInterviews.length + todayInterviews.length}</p>
          <p className='text-xs text-gray-500'>Gross: ₹{grossRevenue}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-2'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center border bg-amber-50 text-amber-600 border-amber-100'>
            <BsCalendarCheck size={18} />
          </div>
          <p className='text-xs text-gray-400 font-semibold uppercase tracking-wider'>Upcoming</p>
          <p className='text-2xl font-extrabold text-gray-900'>{todayInterviews.length}</p>
          <p className='text-xs text-gray-500'>Ready to conduct</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className='bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-2'>
          <div className='w-10 h-10 rounded-xl flex items-center justify-center border bg-purple-50 text-purple-600 border-purple-100'>
            <BsStarFill size={18} />
          </div>
          <p className='text-xs text-gray-400 font-semibold uppercase tracking-wider'>Interviewer Rating</p>
          <p className='text-2xl font-extrabold text-gray-900'>4.9 ★</p>
          <p className='text-xs text-gray-500'>Candidate satisfaction</p>
        </motion.div>
      </div>

      {/* Published Slots Management */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold text-gray-900 tracking-tight'>Your Published Slots</h3>
          <span className='text-xs text-gray-500 font-medium'>{mySlots.length} active slots</span>
        </div>

        {mySlots.length > 0 ? (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {mySlots.map((slot) => (
              <div key={slot._id || slot.id} className='bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs space-y-3 relative'>
                <div className='flex justify-between items-center'>
                  <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200'>
                    {slot.role} • {slot.duration}
                  </span>
                  <span className='text-xs font-extrabold text-gray-900'>₹{slot.price}</span>
                </div>

                <div>
                  <p className='text-xs text-gray-500 font-medium'>{slot.experienceLevel}</p>
                  <p className='text-sm font-bold text-gray-900 mt-1'>{slot.date} at {slot.time}</p>
                  {slot.description && (
                    <p className='text-[11px] text-gray-400 mt-1 line-clamp-2'>{slot.description}</p>
                  )}
                </div>

                <div className='flex flex-wrap gap-1'>
                  {(slot.requiredSkills || []).map((sk, i) => (
                    <span key={i} className='bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
                      {sk}
                    </span>
                  ))}
                </div>

                <div className='flex justify-between items-center pt-2 border-t border-gray-100 text-xs'>
                  <span className={`font-mono font-semibold ${
                    slot.status === 'booked' ? 'text-blue-600' : slot.status === 'published' ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {slot.status}
                  </span>
                  <button
                    onClick={() => handleDeleteSlot(slot._id || slot.id)}
                    className='text-rose-600 hover:text-rose-800 font-semibold cursor-pointer flex items-center gap-1'
                  >
                    <BsTrash size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='bg-white border border-gray-200 rounded-3xl p-8 text-center space-y-3'>
            <p className='font-bold text-gray-800 text-sm'>No Active Slots Created Yet</p>
            <p className='text-xs text-gray-400 max-w-sm mx-auto'>
              Click "Create Interview Slot" above to define your available role, duration, price, and timing for candidates.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming / Live Sessions */}
      <div className='space-y-4'>
        <h3 className='text-lg font-bold text-gray-900 tracking-tight'>Upcoming & Scheduled Interviews</h3>
        {todayInterviews.length > 0 ? (
          <div className='grid sm:grid-cols-2 gap-5'>
            {todayInterviews.map((b) => {
              const isLive = b.status === 'Live' || b.status === 'live'
              return (
                <motion.div
                  key={b._id}
                  whileHover={{ y: -3 }}
                  className={`bg-white border rounded-3xl p-6 shadow-sm space-y-4 relative ${
                    isLive ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-200'
                  }`}
                >
                  <div className='flex justify-between items-center'>
                    <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200'>
                      {b.date} • {b.timeSlot}
                    </span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${
                      isLive ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      {b.status || 'Scheduled'}
                    </span>
                  </div>

                  <div>
                    <h4 className='font-extrabold text-gray-900 text-lg'>{b.userId?.name || 'Candidate'}</h4>
                    <p className='text-xs text-gray-500 mt-0.5'>{b.userId?.email || 'candidate@email.com'}</p>
                    {b.notes && <p className='text-[11px] text-gray-400 mt-1'>{b.notes}</p>}
                  </div>

                  <button
                    onClick={() => handleStartInterviewSession(b._id)}
                    className={`w-full py-3 text-white rounded-2xl text-xs font-bold cursor-pointer transition shadow-md flex items-center justify-center gap-2 ${
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
          <div className='bg-white border border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-400'>
            No upcoming sessions booked.
          </div>
        )}
      </div>

      {/* Completed Interviews */}
      {completedInterviews.length > 0 && (
        <div className='space-y-4'>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className='flex items-center gap-2 text-lg font-bold text-gray-900 tracking-tight cursor-pointer hover:text-emerald-700 transition'
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
                {completedInterviews.map((ci) => (
                  <div
                    key={ci._id}
                    className='bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs space-y-3'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='bg-purple-50 text-purple-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-purple-200'>
                        Completed
                      </span>
                      <span className='text-xs text-gray-400 font-mono'>{ci.date}</span>
                    </div>

                    <div>
                      <h4 className='font-bold text-gray-900 text-sm'>{ci.userId?.name || 'Candidate'}</h4>
                      <p className='text-xs text-gray-500 mt-0.5'>{ci.userId?.email}</p>
                    </div>

                    {ci.finalScore > 0 && (
                      <div className='bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center'>
                        <span className='text-lg font-extrabold text-emerald-700'>{ci.finalScore}/10</span>
                        {ci.recommendation && (
                          <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ci.recommendation === 'Strong Hire' || ci.recommendation === 'Hire'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ci.recommendation === 'Maybe'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ci.recommendation}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setViewingFeedback(ci)}
                      className='w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5'
                    >
                      <BsEye size={12} />
                      <span>View Details</span>
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Feedback Detail Modal */}
      <AnimatePresence>
        {viewingFeedback && (
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs px-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-white rounded-3xl max-w-lg w-full p-7 border border-gray-200 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto'
            >
              <div className='flex items-center justify-between border-b border-gray-100 pb-3'>
                <h3 className='font-extrabold text-gray-900 text-base flex items-center gap-2'>
                  <BsClipboard2Check className='text-emerald-600' size={18} />
                  Interview Details
                </h3>
                <button onClick={() => setViewingFeedback(null)} className='text-gray-400 hover:text-gray-800 p-1 cursor-pointer'>
                  <BsX size={20} />
                </button>
              </div>

              <div className='text-xs text-gray-600 space-y-1'>
                <p><span className='font-bold text-gray-900'>Candidate:</span> {viewingFeedback.userId?.name || 'Unknown'}</p>
                <p><span className='font-bold text-gray-900'>Date:</span> {viewingFeedback.date} at {viewingFeedback.timeSlot}</p>
                <p><span className='font-bold text-gray-900'>Score:</span> {viewingFeedback.finalScore}/10</p>
                {viewingFeedback.recommendation && (
                  <p><span className='font-bold text-gray-900'>Recommendation:</span> {viewingFeedback.recommendation}</p>
                )}
              </div>

              {viewingFeedback.interviewerFeedback && (
                <div className='bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs'>
                  <p className='font-bold text-gray-900 mb-1'>Your Feedback</p>
                  <p className='text-gray-600 whitespace-pre-line'>{viewingFeedback.interviewerFeedback}</p>
                </div>
              )}

              {viewingFeedback.strengths?.length > 0 && (
                <div>
                  <p className='text-xs font-bold text-emerald-700 mb-1'>Strengths</p>
                  <div className='flex flex-wrap gap-1'>
                    {viewingFeedback.strengths.map((s, i) => (
                      <span key={i} className='text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200'>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {viewingFeedback.weaknesses?.length > 0 && (
                <div>
                  <p className='text-xs font-bold text-rose-700 mb-1'>Weaknesses</p>
                  <div className='flex flex-wrap gap-1'>
                    {viewingFeedback.weaknesses.map((w, i) => (
                      <span key={i} className='text-[11px] bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200'>{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE SLOT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs px-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-white rounded-3xl max-w-lg w-full p-7 border border-gray-200 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto'
            >
              <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
                <h3 className='font-extrabold text-gray-900 text-base'>Create & Publish Interview Slot</h3>
                <button onClick={() => setShowCreateModal(false)} className='text-gray-400 hover:text-gray-700 p-1 cursor-pointer'>
                  <BsX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSlot} className='space-y-4 text-xs'>
                <div className='grid sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='font-semibold text-gray-600 block mb-1'>Target Role</label>
                    <select
                      value={slotRole}
                      onChange={(e) => setSlotRole(e.target.value)}
                      className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500'
                    >
                      <option value='Frontend'>Frontend</option>
                      <option value='Backend'>Backend</option>
                      <option value='Full Stack'>Full Stack</option>
                      <option value='AI/ML'>AI/ML</option>
                      <option value='Data Science'>Data Science</option>
                      <option value='DevOps'>DevOps</option>
                      <option value='HR'>HR</option>
                      <option value='System Design'>System Design</option>
                    </select>
                  </div>

                  <div>
                    <label className='font-semibold text-gray-600 block mb-1'>Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-emerald-500'
                    >
                      <option value='Beginner (0-1 yrs)'>Beginner (0-1 yrs)</option>
                      <option value='Intermediate (1-3 yrs)'>Intermediate (1-3 yrs)</option>
                      <option value='Advanced (3-5 yrs)'>Advanced (3-5 yrs)</option>
                      <option value='Senior (5+ yrs)'>Senior (5+ yrs)</option>
                    </select>
                  </div>
                </div>

                <div className='grid sm:grid-cols-3 gap-3'>
                  <div>
                    <label className='font-semibold text-gray-600 block mb-1'>Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium focus:outline-none'
                    >
                      <option value='30 Minutes'>30 Minutes</option>
                      <option value='45 Minutes'>45 Minutes</option>
                      <option value='60 Minutes'>60 Minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className='font-semibold text-gray-600 block mb-1'>Date</label>
                    <input
                      type='date'
                      value={slotDate}
                      onChange={(e) => setSlotDate(e.target.value)}
                      className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium focus:outline-none'
                      required
                    />
                  </div>

                  <div>
                    <label className='font-semibold text-gray-600 block mb-1'>Time</label>
                    <input
                      type='time'
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-medium focus:outline-none'
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className='font-semibold text-gray-600 block mb-1'>Booking Price (₹ INR)</label>
                  <input
                    type='number'
                    min={99}
                    max={2999}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-bold focus:outline-none'
                    required
                  />
                  <p className='text-[10px] text-gray-400 mt-1'>Platform Fee: 20% (Your Net: ₹{Math.round(price * 0.8)})</p>
                </div>

                <div>
                  <label className='font-semibold text-gray-600 block mb-1'>Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={slotDescription}
                    onChange={(e) => setSlotDescription(e.target.value)}
                    placeholder='Describe what topics you will cover in this interview...'
                    className='w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none'
                  />
                </div>

                {/* Required Skills Tag */}
                <div>
                  <label className='font-semibold text-gray-600 block mb-1'>Required Tech Skills</label>
                  <div className='flex gap-2 mb-2'>
                    <input
                      type='text'
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkillTag())}
                      placeholder='e.g., React.js, Node.js'
                      className='flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none'
                    />
                    <button type='button' onClick={handleAddSkillTag} className='bg-gray-900 text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer'>
                      Add
                    </button>
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    {requiredSkills.map((sk, i) => (
                      <span key={i} className='bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1'>
                        {sk}
                        <button type='button' onClick={() => handleRemoveSkill(sk)} className='hover:text-rose-600 cursor-pointer'>
                          <BsX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className='flex justify-end gap-3 pt-3 border-t border-gray-100'>
                  <button
                    type='button'
                    onClick={() => setShowCreateModal(false)}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium cursor-pointer'
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
    </div>
  )
}

export default InterviewerDashboard
