import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import { 
  BsPeople, 
  BsCalendar3, 
  BsStarFill, 
  BsClock,
  BsCheckCircleFill,
  BsXCircleFill,
  BsBoxArrowUpRight,
  BsX,
  BsPlusLg,
  BsArrowRepeat,
  BsLightbulb,
  BsCurrencyRupee,
  BsFilter,
  BsCameraVideo,
  BsShieldCheck,
  BsBroadcast,
  BsSearch,
  BsEye,
  BsClipboard2Check,
  BsTrophy,
  BsChevronDown,
  BsChevronUp,
  BsTrash
} from 'react-icons/bs'
import { ServerUrl } from '../App'
import { useNavigate } from 'react-router-dom'

function HumanInterviews() {
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)

  const user = userData?.user || userData
  const isInterviewer = user?.role === 'interviewer'

  const [publishedSlots, setPublishedSlots] = useState<any[]>([])
  const [mySlots, setMySlots] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [completedInterviews, setCompletedInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [successToast, setSuccessToast] = useState<{
    show: boolean;
    message: string;
    details?: {
      interviewer: string;
      role: string;
      date: string;
      time: string;
      duration: string;
    };
  } | null>(null)

  // Filters
  const [roleFilter, setRoleFilter] = useState('All')
  const [expFilter, setExpFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [timeFilter, setTimeFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Slot Modal State for Interviewers
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

  // Booking Confirmation Modal
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [candidateNotes, setCandidateNotes] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  // Live Notification State
  const [liveBannerMsg, setLiveBannerMsg] = useState('')

  // AI Prep Suggestions
  const [aiSuggestions, setAiSuggestions] = useState('')
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  // Feedback View Modal
  const [viewingFeedback, setViewingFeedback] = useState<any>(null)

  // Show/hide completed section
  const [showCompleted, setShowCompleted] = useState(false)

  const socketRef = useRef(null)

  const fetchData = async () => {
    setLoading(true)

    try {
      const slotsRes = await axios.get(`${ServerUrl}/api/human-interview/slots/browse`, {
        params: { role: roleFilter, experienceLevel: expFilter, search: searchQuery },
        withCredentials: true,
      })
      setPublishedSlots(Array.isArray(slotsRes.data) ? slotsRes.data : [])
    } catch (error) {
      console.error('Fetch available slots error:', error)
      setPublishedSlots([])
    }

    if (isInterviewer) {
      try {
        const mySlotsRes = await axios.get(`${ServerUrl}/api/human-interview/slots/my-slots`, { withCredentials: true })
        setMySlots(Array.isArray(mySlotsRes.data) ? mySlotsRes.data : [])
      } catch (error) {
        console.error('Fetch my slots error:', error)
        setMySlots([])
      }
    }

    try {
      const bookingsRes = await axios.get(`${ServerUrl}/api/human-interview/list`, { withCredentials: true })
      const allBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : []
      setBookings(allBookings.filter((b: any) => b.status !== 'Completed' && b.status !== 'Cancelled' && isSlotUpcoming(b.date, b.timeSlot)))
    } catch (error) {
      console.error('Fetch bookings error:', error)
      setBookings([])
    }

    try {
      const completedRes = await axios.get(`${ServerUrl}/api/human-interview/completed`, { withCredentials: true })
      setCompletedInterviews(Array.isArray(completedRes.data) ? completedRes.data : [])
    } catch (error) {
      console.error('Fetch completed interviews error:', error)
      setCompletedInterviews([])
    }

    setLoading(false)
  }

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
      const threshold = new Date(Date.now() - 30 * 60 * 1000)
      return parsedDate >= threshold
    } catch {
      return true
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
        await fetchData()
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
      await fetchData()
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

  const handleRemoveSkillTag = (skill: string) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skill))
  }

  useEffect(() => {
    fetchData()

    socketRef.current = io(ServerUrl, { withCredentials: true })
    const socket = socketRef.current

    // Register user for targeted notifications
    const userId = userData?.user?._id
    if (userId) {
      socket.emit('register-user', { userId })
    }

    // Real-time: new slot published by interviewer
    socket.on('slot-published', ({ slot }) => {
      if (slot) {
        setPublishedSlots((prev) => [slot, ...prev])
      }
    })

    // Real-time: interview went live
    socket.on('interview-session-live', ({ bookingId, roomId }) => {
      setLiveBannerMsg('Your interviewer has started the live session! Click Join below to enter.')
      setBookings((prev) =>
        prev.map((b) => ((b._id || b.id) === bookingId ? { ...b, status: 'Live', roomId } : b))
      )
    })

    // Real-time: targeted notification for this learner
    socket.on('interview-started-notification', ({ message, bookingId, roomId }) => {
      setLiveBannerMsg(message || 'Your interviewer has started the interview!')
      setBookings((prev) =>
        prev.map((b) => ((b._id || b.id) === bookingId ? { ...b, status: 'Live', roomId } : b))
      )
    })

    // Real-time: interview ended
    socket.on('interview-session-ended', ({ bookingId }) => {
      setBookings((prev) =>
        prev.map((b) => ((b._id || b.id) === bookingId ? { ...b, status: 'Completed' } : b))
      )
    })

    return () => {
      if (socket) socket.disconnect()
    }
  }, [roleFilter, expFilter])

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleConfirmSlotBooking = async (e: any) => {
    e.preventDefault()
    if (!selectedSlot || bookingLoading) return

    setBookingLoading(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your network connection.')
        setBookingLoading(false)
        return
      }

      const slotId = selectedSlot._id || selectedSlot.id

      // 1. Create Slot Order on Backend
      const orderRes = await axios.post(
        `${ServerUrl}/api/human-interview/create-slot-order`,
        { slotId },
        { withCredentials: true }
      )

      const { orderId, amount, currency, key } = orderRes.data
      const razorpayKey = key || import.meta.env.VITE_RAZORPAY_KEY_ID

      // 2. Open Official Razorpay Checkout Modal
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency || 'INR',
        name: 'HireReady.AI',
        description: `Live Interview Slot: ${selectedSlot.role || 'Technical'} (${selectedSlot.date || 'Scheduled'})`,
        order_id: orderId,
        prefill: {
          name: userData?.name || userData?.user?.name || '',
          email: userData?.email || userData?.user?.email || '',
        },
        theme: {
          color: '#10b981',
        },
        handler: async function (response: any) {
          try {
            // 3. Verify Payment Signature & Confirm Booking
            const verifyRes = await axios.post(
              `${ServerUrl}/api/human-interview/verify-slot-booking`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                slotId,
                notes: candidateNotes,
              },
              { withCredentials: true }
            )

            if (verifyRes.data?.booking) {
              const createdBooking = verifyRes.data.booking
              const interviewerName = selectedSlot.interviewerName || selectedSlot.interviewerId?.name || 'Senior Tech Interviewer'
              const bookedSlot = selectedSlot
              setSelectedSlot(null)
              setCandidateNotes('')
              await fetchData()
              setSuccessToast({
                show: true,
                message: 'Interview booked successfully!',
                details: {
                  interviewer: interviewerName,
                  role: bookedSlot.role || 'Technical Interview',
                  date: bookedSlot.date || 'Scheduled Date',
                  time: bookedSlot.time || 'Scheduled Time',
                  duration: bookedSlot.duration || '45 Minutes',
                },
              })
            }
          } catch (err: any) {
            console.error('Verify slot payment error:', err)
            alert(err.response?.data?.message || 'Payment verification failed. Your interview slot was not booked.')
          } finally {
            setBookingLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setBookingLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        alert(response.error?.description || 'Payment failed. Booking cancelled.')
        setBookingLoading(false)
      })
      rzp.open()
    } catch (error: any) {
      console.error('Book slot error:', error)
      alert(error.response?.data?.message || 'Failed to initiate interview slot payment.')
      setBookingLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this interview session?')) return
    try {
      await axios.post(`${ServerUrl}/api/human-interview/cancel/${bookingId}`, {}, { withCredentials: true })
      setBookings((prev) => prev.filter((b) => (b._id || b.id) !== bookingId))
      await fetchData()
    } catch (error) {
      console.error('Cancel booking error:', error)
      alert(error.response?.data?.message || 'Failed to cancel session.')
    }
  }

  const handleGetAiPrepTips = async () => {
    setLoadingSuggestions(true)
    try {
      const res = await axios.post(
        `${ServerUrl}/api/human-interview/suggestions`,
        { targetRole: roleFilter === 'All' ? 'Software Engineer' : roleFilter, experienceLevel: expFilter },
        { withCredentials: true }
      )
      setAiSuggestions(res.data.suggestions || '')
    } catch (error) {
      console.error('AI suggestions error:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchData()
  }

  return (
    <div className='py-2 space-y-8'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
            Human Mock Interviews
          </h1>
          <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
            Book 1-on-1 live technical interview slots with verified tech interviewers inside HireReady.AI.
          </p>
        </div>

        <div className='flex items-center gap-3 self-start sm:self-auto flex-wrap'>
          {isInterviewer && (
            <button
              onClick={() => navigate('/interviewer/create-slots')}
              className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
            >
              <BsPlusLg size={14} />
              <span>Manage & Create Slots</span>
            </button>
          )}

          <button
            onClick={handleGetAiPrepTips}
            disabled={loadingSuggestions}
            className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs flex items-center gap-2 disabled:opacity-50'
          >
            {loadingSuggestions ? <BsArrowRepeat className='animate-spin' size={14} /> : <BsLightbulb size={14} />}
            <span>Get AI Prep Guidelines</span>
          </button>
        </div>
      </div>

      {/* Socket.IO Live Banner Alert */}
      {liveBannerMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-4 font-bold text-xs'
        >
          <div className='flex items-center gap-2.5'>
            <BsBroadcast size={18} className='animate-pulse text-amber-300' />
            <span>{liveBannerMsg}</span>
          </div>
          <button onClick={() => setLiveBannerMsg('')} className='p-1 text-white hover:text-gray-200 cursor-pointer'>
            <BsX size={18} />
          </button>
        </motion.div>
      )}

      {/* AI Prep Guidelines Output */}
      {aiSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='bg-emerald-50/70 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-6 text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed font-normal whitespace-pre-line shadow-xs relative'
        >
          <div className='flex items-center justify-between font-bold mb-2 text-emerald-800 dark:text-emerald-300'>
            <span className='flex items-center gap-2'>
              <BsLightbulb size={16} /> OpenRouter AI Guidelines
            </span>
            <button onClick={() => setAiSuggestions('')} className='text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 cursor-pointer'>
              <BsX size={18} />
            </button>
          </div>
          {aiSuggestions}
        </motion.div>
      )}

      {/* Filter Controls Bar */}
      <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs'>
        <div className='flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300'>
          <BsFilter size={16} className='text-emerald-600 dark:text-emerald-400' />
          <span>Filter Available Slots:</span>
        </div>

        <div className='flex flex-wrap items-center gap-3 text-xs'>
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className='flex items-center gap-1.5'>
            <div className='relative'>
              <BsSearch size={12} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search role, skill...'
                className='pl-7 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none text-xs w-40 text-gray-900 dark:text-white'
              />
            </div>
          </form>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className='px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold focus:outline-none text-gray-900 dark:text-white'
            >
              <option value='All'>All Roles</option>
              <option value='Frontend'>Frontend</option>
              <option value='Backend'>Backend</option>
              <option value='Full Stack'>Full Stack</option>
              <option value='AI/ML'>AI/ML</option>
              <option value='DevOps'>DevOps</option>
              <option value='HR'>HR</option>
              <option value='System Design'>System Design</option>
            </select>
          </div>

          <div>
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className='px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold focus:outline-none text-gray-900 dark:text-white'
            >
              <option value='All'>All Experience Levels</option>
              <option value='Beginner (0-1 yrs)'>Beginner (0-1 yrs)</option>
              <option value='Intermediate (1-3 yrs)'>Intermediate (1-3 yrs)</option>
              <option value='Advanced (3-5 yrs)'>Advanced (3-5 yrs)</option>
              <option value='Senior (5+ yrs)'>Senior (5+ yrs)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Learner's Scheduled / Upcoming Interviews Section */}
      {bookings.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BsCalendar3 className="text-emerald-600 dark:text-emerald-400" />
            Upcoming Scheduled Interviews ({bookings.length})
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((b) => {
              const mentorName = b.mentor?.name || b.mentorId?.name || b.slot?.interviewerName || 'Verified Tech Interviewer';
              const role = b.slot?.role || b.notes || 'Technical Interview';
              const isLive = b.status === 'Live';

              return (
                <motion.div
                  key={b.id || b._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-900 border border-emerald-300/80 dark:border-emerald-800/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${isLive ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 animate-pulse' : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'}`}>
                        {isLive ? '🔴 LIVE NOW' : 'Scheduled'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{b.slot?.duration || '45 Mins'}</span>
                    </div>

                    <h4 className="font-extrabold text-gray-900 dark:text-white text-base">{role}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Interviewer: {mentorName}</p>

                    <div className="bg-gray-50 dark:bg-gray-800/90 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 mt-3 font-semibold space-y-1">
                      <p className="flex items-center gap-1.5">
                        <BsCalendar3 className="text-emerald-600 dark:text-emerald-400" /> {b.date} at {b.timeSlot}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/interview/room/${b.id || b._id}`)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center justify-center gap-2"
                    >
                      <BsCameraVideo size={14} />
                      <span>Join Interview</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Interview Slots Grid (Learner Browse View) */}
      <div className='space-y-5'>
        <h3 className='text-lg font-bold text-gray-900 dark:text-white tracking-tight'>Available Interview Slots</h3>
        {loading ? (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {[1, 2, 3].map((n) => (
              <div key={n} className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 h-56 animate-pulse space-y-4' />
            ))}
          </div>
        ) : publishedSlots.length > 0 ? (
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
            {publishedSlots.map((slot, i) => {
              const interviewerName = slot.interviewerName || slot.interviewerId?.name || 'Verified Tech Interviewer'
              const companyName = slot.company || slot.interviewerId?.interviewerProfile?.company || 'HireReady.AI Partner'
              const interviewerRating = slot.interviewerId?.interviewerProfile?.rating || 4.9

              return (
                <motion.div
                  key={slot._id || slot.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ y: -4 }}
                  className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 shadow-xs transition-all duration-300 flex flex-col justify-between space-y-4 group hover:shadow-md'
                >
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <span className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/80'>
                        {slot.role} • {slot.duration}
                      </span>
                      <span className='text-base font-extrabold text-gray-900 dark:text-white'>₹{slot.price}</span>
                    </div>

                    <div className='flex items-center gap-1.5 flex-wrap'>
                      <h4 className='font-extrabold text-gray-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'>
                        {interviewerName}
                      </h4>
                      <span className='inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/80'>
                        <BsShieldCheck size={11} className='text-emerald-600 dark:text-emerald-400' /> Verified Interviewer
                      </span>
                    </div>
                    <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                      {slot.experienceLevel} @ {companyName}
                      <span className='ml-2 text-amber-500'>★ {interviewerRating}</span>
                    </p>

                    {slot.description && (
                      <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2'>{slot.description}</p>
                    )}

                    <div className='bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-200 font-medium my-3 flex items-center gap-1.5'>
                      <BsCalendar3 size={12} className='text-emerald-600 dark:text-emerald-400' />
                      <span>{slot.date} at {slot.time}</span>
                    </div>

                    <div className='flex flex-wrap gap-1.5'>
                      {(slot.requiredSkills || []).map((skill: string, j: number) => (
                        <span key={j} className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSlot(slot)}
                    className='w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5'
                  >
                    <BsCalendar3 size={12} />
                    <span>Book Interview Slot (₹{slot.price})</span>
                  </button>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-10 text-center space-y-3 shadow-xs'>
            <p className='font-bold text-gray-800 dark:text-gray-200 text-base'>No Interview Slots Available Right Now</p>
            <p className='text-xs text-gray-400 max-w-sm mx-auto'>
              Interviewers regularly publish new slots. Please check back soon or adjust your filters.
            </p>
          </div>
        )}
      </div>

      {/* COMPLETED INTERVIEWS SECTION */}
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
                      <h4 className='font-bold text-gray-900 text-sm'>
                        {ci.slotId?.role || 'Technical'} Interview
                      </h4>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        Interviewer: {ci.mentorId?.name || 'Tech Mentor'}
                      </p>
                    </div>

                    {ci.finalScore > 0 && (
                      <div className='bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center'>
                        <p className='text-xs text-gray-500 font-medium'>Final Score</p>
                        <p className='text-2xl font-extrabold text-emerald-700'>{ci.finalScore}/10</p>
                        {ci.recommendation && (
                          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                      <span>View Feedback</span>
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* FEEDBACK VIEW MODAL */}
      <AnimatePresence>
        {viewingFeedback && (
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs px-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-white rounded-3xl max-w-lg w-full p-7 border border-gray-200 shadow-2xl relative space-y-5 max-h-[85vh] overflow-y-auto'
            >
              <div className='flex items-center justify-between border-b border-gray-100 pb-3'>
                <h3 className='font-extrabold text-gray-900 text-base flex items-center gap-2'>
                  <BsClipboard2Check className='text-emerald-600' size={18} />
                  Interview Feedback Report
                </h3>
                <button onClick={() => setViewingFeedback(null)} className='text-gray-400 hover:text-gray-800 p-1 cursor-pointer'>
                  <BsX size={20} />
                </button>
              </div>

              {/* Scores */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center'>
                  <p className='text-[10px] text-gray-500 font-semibold uppercase'>Technical</p>
                  <p className='text-xl font-extrabold text-emerald-700'>{viewingFeedback.technicalScore || 0}/10</p>
                </div>
                <div className='bg-blue-50 border border-blue-200 rounded-xl p-3 text-center'>
                  <p className='text-[10px] text-gray-500 font-semibold uppercase'>Communication</p>
                  <p className='text-xl font-extrabold text-blue-700'>{viewingFeedback.communicationScore || 0}/10</p>
                </div>
                <div className='bg-purple-50 border border-purple-200 rounded-xl p-3 text-center'>
                  <p className='text-[10px] text-gray-500 font-semibold uppercase'>Problem Solving</p>
                  <p className='text-xl font-extrabold text-purple-700'>{viewingFeedback.problemSolvingScore || 0}/10</p>
                </div>
                <div className='bg-amber-50 border border-amber-200 rounded-xl p-3 text-center'>
                  <p className='text-[10px] text-gray-500 font-semibold uppercase'>Overall</p>
                  <p className='text-xl font-extrabold text-amber-700'>{viewingFeedback.overallRating || viewingFeedback.finalScore || 0}/10</p>
                </div>
              </div>

              {/* Recommendation */}
              {viewingFeedback.recommendation && (
                <div className='text-center'>
                  <span className={`inline-block text-xs font-extrabold px-4 py-1.5 rounded-full ${
                    viewingFeedback.recommendation === 'Strong Hire' || viewingFeedback.recommendation === 'Hire'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : viewingFeedback.recommendation === 'Maybe'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    Recommendation: {viewingFeedback.recommendation}
                  </span>
                </div>
              )}

              {/* Feedback Text */}
              {viewingFeedback.interviewerFeedback && (
                <div className='bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-700'>
                  <p className='font-bold text-gray-900 mb-1'>Interviewer Comments</p>
                  <p className='leading-relaxed whitespace-pre-line'>{viewingFeedback.interviewerFeedback}</p>
                </div>
              )}

              {/* Strengths */}
              {viewingFeedback.strengths?.length > 0 && (
                <div>
                  <p className='text-xs font-bold text-emerald-700 mb-1.5'>✅ Strengths</p>
                  <ul className='space-y-1'>
                    {viewingFeedback.strengths.map((s, i) => (
                      <li key={i} className='text-xs text-gray-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100'>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {viewingFeedback.weaknesses?.length > 0 && (
                <div>
                  <p className='text-xs font-bold text-rose-700 mb-1.5'>⚠️ Areas to Improve</p>
                  <ul className='space-y-1'>
                    {viewingFeedback.weaknesses.map((w, i) => (
                      <li key={i} className='text-xs text-gray-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100'>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {viewingFeedback.suggestions?.length > 0 && (
                <div>
                  <p className='text-xs font-bold text-blue-700 mb-1.5'>💡 Suggestions</p>
                  <ul className='space-y-1'>
                    {viewingFeedback.suggestions.map((s, i) => (
                      <li key={i} className='text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100'>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOOKING CONFIRMATION MODAL */}
      <AnimatePresence>
        {selectedSlot && (
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-xs px-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-white rounded-3xl max-w-md w-full p-7 border border-gray-200 shadow-2xl relative space-y-5'
            >
              <div className='flex items-center justify-between border-b border-gray-100 pb-3'>
                <h3 className='font-extrabold text-gray-900 text-base'>Confirm Interview Booking</h3>
                <button onClick={() => setSelectedSlot(null)} className='text-gray-400 hover:text-gray-800 p-1 cursor-pointer'>
                  <BsX size={20} />
                </button>
              </div>

              <div className='bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1.5'>
                <p className='font-bold text-sm text-emerald-800'>{selectedSlot.role} Mock Interview</p>
                <p>Interviewer: {selectedSlot.interviewerName || selectedSlot.interviewerId?.name}</p>
                <p>Timing: {selectedSlot.date} at {selectedSlot.time} ({selectedSlot.duration})</p>
                <p className='font-extrabold text-gray-900 pt-1'>Price: ₹{selectedSlot.price} INR</p>
              </div>

              <form onSubmit={handleConfirmSlotBooking} className='space-y-4 text-xs'>
                <div>
                  <label className='font-semibold text-gray-600 block mb-1'>Candidate Focus Topics / Notes</label>
                  <textarea
                    rows={2}
                    value={candidateNotes}
                    onChange={(e) => setCandidateNotes(e.target.value)}
                    placeholder='e.g., Focus on System Design microservices and React state hooks'
                    className='w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none'
                  />
                </div>

                <div className='flex justify-end gap-3 pt-2'>
                  <button type='button' onClick={() => setSelectedSlot(null)} className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium cursor-pointer'>
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={bookingLoading}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center gap-2 disabled:opacity-50'
                  >
                    {bookingLoading ? <BsArrowRepeat className='animate-spin' size={14} /> : null}
                    <span>{bookingLoading ? 'Processing Payment...' : 'Pay ₹' + selectedSlot.price + ' & Confirm Booking'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS BOOKING CONFIRMATION TOAST MODAL */}
      <AnimatePresence>
        {successToast && (
          <div className='fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-3xl max-w-md w-full p-7 border border-emerald-500/30 shadow-2xl space-y-4 text-center relative overflow-hidden'
            >
              <div className='w-14 h-14 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xs'>
                <BsCheckCircleFill />
              </div>
              <h3 className='text-xl font-extrabold tracking-tight'>{successToast.message}</h3>
              {successToast.details && (
                <div className='bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5 text-left font-medium'>
                  <p><span className='font-bold'>Interviewer:</span> {successToast.details.interviewer}</p>
                  <p><span className='font-bold'>Role:</span> {successToast.details.role}</p>
                  <p><span className='font-bold'>Date & Time:</span> {successToast.details.date} at {successToast.details.time}</p>
                  <p><span className='font-bold'>Duration:</span> {successToast.details.duration}</p>
                </div>
              )}
              <button
                onClick={() => setSuccessToast(null)}
                className='w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold cursor-pointer transition shadow-xs'
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HumanInterviews
