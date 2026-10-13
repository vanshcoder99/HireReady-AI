import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import {
  BsPlusLg,
  BsTrash,
  BsFilter,
  BsSearch,
  BsX,
  BsArrowRepeat,
  BsCalendar3,
  BsClock,
  BsShieldCheck,
  BsCurrencyRupee,
  BsGrid
} from 'react-icons/bs'
import { ServerUrl } from '../App'
import { useNavigate } from 'react-router-dom'

function InterviewerCreateSlots() {
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)

  const [mySlots, setMySlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [statusFilter, setStatusFilter] = useState('All')
  const [timeFilter, setTimeFilter] = useState('All')
  const [roleFilter, setRoleFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

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

  const fetchMySlots = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${ServerUrl}/api/human-interview/slots/my-slots`, { withCredentials: true })
      setMySlots(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error('Fetch interviewer slots error:', error)
      setMySlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMySlots()
  }, [])

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

  const handleAddSkillTag = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills((prev) => [...prev, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleRemoveSkillTag = (skill: string) => {
    setRequiredSkills((prev) => prev.filter((s) => s !== skill))
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
        await fetchMySlots()
        alert('New interview slot published successfully!')
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
      await fetchMySlots()
    } catch (error) {
      alert('Failed to delete slot.')
    }
  }

  const isMatchSearch = (slot: any) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const matchRole = slot.role?.toLowerCase().includes(q)
    const matchDesc = slot.description?.toLowerCase().includes(q)
    const matchCandidate = slot.candidateName?.toLowerCase().includes(q) || slot.candidateEmail?.toLowerCase().includes(q) || slot.bookings?.[0]?.user?.name?.toLowerCase().includes(q)
    const matchSkills = (slot.requiredSkills || []).some((s: string) => s.toLowerCase().includes(q))
    return matchRole || matchDesc || matchCandidate || matchSkills
  }

  const isMatchRole = (slot: any) => {
    if (roleFilter === 'All') return true
    return slot.role?.toLowerCase().includes(roleFilter.toLowerCase())
  }

  const isMatchStatus = (slot: any) => {
    if (statusFilter === 'All') return true
    if (statusFilter === 'Available') return slot.status === 'published'
    if (statusFilter === 'Booked') return slot.status === 'booked' || (slot.bookings && slot.bookings.length > 0)
    if (statusFilter === 'Completed') return slot.timeState === 'COMPLETED' || slot.status === 'completed' || slot.bookings?.[0]?.status === 'Completed'
    if (statusFilter === 'Cancelled') return slot.status === 'cancelled' || slot.bookings?.[0]?.status === 'Cancelled'
    return true
  }

  const activeSlots = mySlots.filter((slot: any) => {
    const upcoming = isSlotUpcoming(slot.date, slot.time)
    if (!upcoming) return false
    if (timeFilter === 'Past') return false
    return isMatchStatus(slot) && isMatchRole(slot) && isMatchSearch(slot)
  })

  const pastSlots = mySlots.filter((slot: any) => {
    const upcoming = isSlotUpcoming(slot.date, slot.time)
    if (upcoming) return false
    if (timeFilter === 'Upcoming') return false
    return isMatchStatus(slot) && isMatchRole(slot) && isMatchSearch(slot)
  })

  return (
    <div className='py-2 space-y-8'>
      {/* Page Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
            Manage & Create Interview Slots
          </h1>
          <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
            Publish candidate mock interview availability, track bookings, and manage your active & past schedules.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className='bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2 self-start sm:self-auto'
        >
          <BsPlusLg size={14} />
          <span>Create Interview Slot</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs'>
        <div className='flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300'>
          <BsFilter size={16} className='text-emerald-600 dark:text-emerald-400' />
          <span>Filter Slots:</span>
        </div>

        <div className='flex flex-wrap items-center gap-3 text-xs'>
          {/* Search */}
          <div className='relative'>
            <BsSearch size={12} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search role, skill, candidate...'
              className='pl-7 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium focus:outline-none text-xs w-44 text-gray-900 dark:text-white'
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold focus:outline-none text-gray-900 dark:text-white'
            >
              <option value='All'>All Statuses</option>
              <option value='Available'>Available (Published)</option>
              <option value='Booked'>Booked</option>
              <option value='Completed'>Completed</option>
              <option value='Cancelled'>Cancelled</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className='px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold focus:outline-none text-gray-900 dark:text-white'
            >
              <option value='All'>All Times (Active & History)</option>
              <option value='Upcoming'>Upcoming / Active Only</option>
              <option value='Past'>Past History Only</option>
            </select>
          </div>

          {/* Role Filter */}
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
        </div>
      </div>

      {/* SECTION 1: ACTIVE & UPCOMING SLOTS */}
      {timeFilter !== 'Past' && (
        <div className='space-y-5'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2'>
                <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping' />
                My Created & Published Slots (Active & Upcoming)
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                Showing {activeSlots.length} active slot{activeSlots.length === 1 ? '' : 's'} scheduled for current or future dates.
              </p>
            </div>
            <span className='bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800'>
              {activeSlots.length} Active
            </span>
          </div>

          {loading ? (
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {[1, 2, 3].map((n) => (
                <div key={n} className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 h-56 animate-pulse space-y-4' />
              ))}
            </div>
          ) : activeSlots.length > 0 ? (
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {activeSlots.map((slot: any) => {
                const isBooked = slot.status === 'booked' || (slot.bookings && slot.bookings.length > 0)
                const candidateName = slot.candidateName || slot.bookings?.[0]?.user?.name

                return (
                  <motion.div
                    key={slot._id || slot.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 relative group hover:shadow-md transition-all'
                  >
                    <div>
                      <div className='flex justify-between items-center mb-3'>
                        <span className='bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800'>
                          {slot.role} • {slot.duration}
                        </span>
                        <span className='text-base font-extrabold text-gray-900 dark:text-white'>₹{slot.price}</span>
                      </div>

                      <div>
                        <div className='flex items-center gap-2 mb-1.5'>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isBooked
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            {slot.status}
                          </span>
                          <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'>
                            Upcoming
                          </span>
                        </div>

                        <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>{slot.experienceLevel}</p>
                        <p className='text-sm font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5'>
                          <BsCalendar3 size={12} className='text-emerald-600 dark:text-emerald-400' />
                          <span>{slot.date} at {slot.time}</span>
                        </p>

                        {candidateName && (
                          <div className='mt-2 text-xs bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 p-2 rounded-xl text-blue-900 dark:text-blue-200 font-medium'>
                            👤 Booked by: <span className='font-bold'>{candidateName}</span>
                          </div>
                        )}

                        {slot.description && (
                          <p className='text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2'>{slot.description}</p>
                        )}
                      </div>

                      <div className='flex flex-wrap gap-1.5 my-3'>
                        {(slot.requiredSkills || []).map((sk: string, i: number) => (
                          <span key={i} className='bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs'>
                      <span className='text-gray-400 text-[11px] font-mono'>ID: {slot.id?.substring(0, 8)}...</span>
                      <button
                        onClick={() => handleDeleteSlot(slot._id || slot.id)}
                        className='text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 font-bold cursor-pointer flex items-center gap-1 transition-colors'
                      >
                        <BsTrash size={13} />
                        <span>Remove Slot</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center space-y-2 shadow-xs'>
              <p className='font-bold text-gray-800 dark:text-gray-200 text-sm'>No Active or Upcoming Slots Right Now</p>
              <p className='text-xs text-gray-400 max-w-sm mx-auto'>
                Click "Create Interview Slot" above to publish candidate mock interview availability.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: PAST INTERVIEW SLOTS (HISTORY) */}
      {timeFilter !== 'Upcoming' && (
        <div className='space-y-5 pt-4 border-t border-gray-200/80 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2'>
                <BsClock className='text-gray-500 dark:text-gray-400' />
                Past Interview Slots (Slot History)
              </h3>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                Historical record of slots whose scheduled date & time has passed. Retained in PostgreSQL.
              </p>
            </div>
            <span className='bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700'>
              {pastSlots.length} Past Record{pastSlots.length === 1 ? '' : 's'}
            </span>
          </div>

          {loading ? (
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {[1, 2, 3].map((n) => (
                <div key={n} className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 h-56 animate-pulse space-y-4' />
              ))}
            </div>
          ) : pastSlots.length > 0 ? (
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {pastSlots.map((slot: any) => {
                const isBooked = slot.status === 'booked' || (slot.bookings && slot.bookings.length > 0)
                const candidateName = slot.candidateName || slot.bookings?.[0]?.user?.name
                const candidateEmail = slot.candidateEmail || slot.bookings?.[0]?.user?.email
                const isCompleted = slot.timeState === 'COMPLETED' || slot.status === 'completed' || slot.bookings?.[0]?.status === 'Completed'

                let statusBadgeLabel = 'EXPIRED'
                let statusBadgeStyle = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'

                if (isCompleted) {
                  statusBadgeLabel = 'COMPLETED'
                  statusBadgeStyle = 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                } else if (isBooked) {
                  statusBadgeLabel = 'BOOKED (PAST)'
                  statusBadgeStyle = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }

                return (
                  <motion.div
                    key={slot._id || slot.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 relative opacity-90 hover:opacity-100 transition-opacity'
                  >
                    <div>
                      <div className='flex justify-between items-center mb-3'>
                        <span className='bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700'>
                          {slot.role} • {slot.duration}
                        </span>
                        <span className='text-base font-extrabold text-gray-900 dark:text-white'>₹{slot.price}</span>
                      </div>

                      <div>
                        <div className='flex items-center gap-2 mb-1.5'>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${statusBadgeStyle}`}>
                            {statusBadgeLabel}
                          </span>
                          <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500'>
                            Past Slot
                          </span>
                        </div>

                        <p className='text-xs text-gray-500 dark:text-gray-400 font-medium'>{slot.experienceLevel}</p>
                        <p className='text-sm font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5'>
                          <BsCalendar3 size={12} className='text-gray-400' />
                          <span>{slot.date} at {slot.time}</span>
                        </p>

                        {isBooked && (
                          <div className='mt-2 text-xs bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 space-y-0.5'>
                            <p className='font-bold text-emerald-600 dark:text-emerald-400'>
                              Candidate: {candidateName || 'Booked Learner'}
                            </p>
                            {candidateEmail && <p className='text-[11px] text-gray-500 font-mono'>{candidateEmail}</p>}
                          </div>
                        )}

                        {slot.description && (
                          <p className='text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2'>{slot.description}</p>
                        )}
                      </div>

                      <div className='flex flex-wrap gap-1.5 my-3'>
                        {(slot.requiredSkills || []).map((sk: string, i: number) => (
                          <span key={i} className='bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded-full'>
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400'>
                      <span className='text-[11px] font-mono'>ID: {slot.id?.substring(0, 8)}...</span>
                      <span className='text-[11px] font-bold text-gray-500 dark:text-gray-400'>PostgreSQL Historical Record</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className='bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 text-center space-y-2 shadow-xs'>
              <p className='font-bold text-gray-800 dark:text-gray-200 text-sm'>No Past Interview Slots Found</p>
              <p className='text-xs text-gray-400 max-w-sm mx-auto'>
                Past and expired interview slots will appear here automatically when their scheduled date & time passes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* CREATE SLOT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className='fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4'>
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
                      className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-bold focus:outline-none dark:[color-scheme:dark]'
                      required
                    />
                  </div>

                  <div>
                    <label className='font-semibold text-gray-600 dark:text-gray-300 block mb-1'>Time</label>
                    <input
                      type='time'
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      className='w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 font-bold focus:outline-none dark:[color-scheme:dark]'
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
                        <button type='button' onClick={() => handleRemoveSkillTag(sk)} className='hover:text-rose-600 cursor-pointer'>
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
    </div>
  )
}

export default InterviewerCreateSlots
