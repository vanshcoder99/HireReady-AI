import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { 
  BsCameraVideo, 
  BsCameraVideoOff, 
  BsMic, 
  BsMicMute, 
  BsDisplay, 
  BsChatDots, 
  BsFileEarmarkText, 
  BsTelephoneX,
  BsRobot,
  BsSend,
  BsCheckCircleFill,
  BsStarFill,
  BsArrowLeft,
  BsPerson,
  BsShieldCheck,
  BsClock,
  BsArrowsFullscreen,
  BsWifi,
  BsLightbulb,
  BsPlayFill,
  BsStopFill,
  BsFullscreen,
  BsFullscreenExit,
  BsX,
  BsPlusLg,
  BsDashLg
} from 'react-icons/bs'
import { ServerUrl } from '../App.jsx'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

function InterviewRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inWaitingRoom, setInWaitingRoom] = useState(true)

  // Media & WebRTC States
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [networkQuality, setNetworkQuality] = useState('Excellent')
  const [peerConnected, setPeerConnected] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Timer & Session States
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)

  // Side Tab States ('chat' | 'ai_co_interviewer' | 'feedback' | 'resume')
  const [activeRightTab, setActiveRightTab] = useState('chat')
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [remoteTyping, setRemoteTyping] = useState(false)

  // OpenRouter AI Assistance State
  const [aiAssistData, setAiAssistData] = useState(null)
  const [loadingAiAssist, setLoadingAiAssist] = useState(false)
  const [aiSummary, setAiSummary] = useState(null)

  // Enhanced Evaluation Form State
  const [overallRating, setOverallRating] = useState(8)
  const [techScore, setTechScore] = useState(8)
  const [commScore, setCommScore] = useState(8)
  const [psScore, setPsScore] = useState(8)
  const [feedbackText, setFeedbackText] = useState('')
  const [strengthInput, setStrengthInput] = useState('')
  const [strengths, setStrengths] = useState([])
  const [weaknessInput, setWeaknessInput] = useState('')
  const [weaknesses, setWeaknesses] = useState([])
  const [suggestionInput, setSuggestionInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [recommendation, setRecommendation] = useState('Hire')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Media Refs
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const studioContainerRef = useRef(null)
  const socketRef = useRef(null)
  const peerRef = useRef(null)
  const localStreamRef = useRef(null)
  const screenStreamRef = useRef(null)
  const chatEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Determine current user's role
  const currentUserId = userData?.user?._id
  const currentUserRole = userData?.user?.role || 'learner'
  const isInterviewer = currentUserRole === 'interviewer'

  // Load Booking & Chat History
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true)
        const [bRes, msgRes] = await Promise.all([
          axios.get(`${ServerUrl}/api/human-interview/booking/${id}`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/human-interview/messages/${id}`, { withCredentials: true }),
        ])
        setBooking(bRes.data)
        setChatMessages(msgRes.data || [])
      } catch (err) {
        console.error('Init room error:', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) initData()
  }, [id])

  // Timer Effect
  useEffect(() => {
    let interval = null
    if (interviewStarted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [interviewStarted])

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Initialize Socket.IO & Media Stream
  const joinMeetingRoom = async () => {
    setInWaitingRoom(false)

    // Request Media Stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (err) {
      console.warn('Camera/Mic permission warning:', err)
    }

    // Connect Socket.IO with reconnection
    socketRef.current = io(ServerUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
    const socket = socketRef.current
    const roomId = booking?.roomId || id

    // Register user for targeted notifications
    if (currentUserId) {
      socket.emit('register-user', { userId: currentUserId })
    }

    socket.emit('join-room', {
      roomId,
      userId: currentUserId,
      name: userData?.user?.name || 'Participant',
      role: currentUserRole,
    })

    // Listen for WebRTC Signaling & Socket Events
    socket.on('user-connected', ({ socketId }) => {
      setPeerConnected(true)
      createWebRTCOffer(socketId)
    })

    socket.on('offer', async ({ socketId, offer }) => {
      await handleWebRTCOffer(socketId, offer)
    })

    socket.on('answer', async ({ answer }) => {
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (e) {
          console.error('Set remote description error:', e)
        }
      }
    })

    socket.on('ice-candidate', async ({ candidate }) => {
      if (peerRef.current && candidate) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (e) {
          console.error('Add ICE candidate error:', e)
        }
      }
    })

    socket.on('user-disconnected', () => {
      setPeerConnected(false)
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    })

    socket.on('message', (msg) => {
      setChatMessages((prev) => [...prev, msg])
    })

    socket.on('typing', () => setRemoteTyping(true))
    socket.on('stop-typing', () => setRemoteTyping(false))

    socket.on('interview-start', () => setInterviewStarted(true))
    socket.on('interview-end', () => setInterviewStarted(false))

    // Reconnection handlers
    socket.on('reconnect', () => {
      setNetworkQuality('Reconnected')
      socket.emit('join-room', {
        roomId,
        userId: currentUserId,
        name: userData?.user?.name || 'Participant',
        role: currentUserRole,
      })
      setTimeout(() => setNetworkQuality('Excellent'), 3000)
    })

    socket.on('reconnect_attempt', () => {
      setNetworkQuality('Reconnecting...')
    })

    socket.on('reconnect_failed', () => {
      setNetworkQuality('Disconnected')
    })
  }

  // WebRTC Peer Connection Helper
  const createWebRTCOffer = async (targetSocketId) => {
    peerRef.current = new RTCPeerConnection(ICE_SERVERS)
    const pc = peerRef.current

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current))
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { targetId: targetSocketId, candidate: event.candidate })
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setPeerConnected(true)
        setNetworkQuality('Excellent')
      } else if (pc.connectionState === 'disconnected') {
        setNetworkQuality('Poor')
      } else if (pc.connectionState === 'failed') {
        setNetworkQuality('Disconnected')
      }
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socketRef.current.emit('offer', { targetId: targetSocketId, offer })
  }

  const handleWebRTCOffer = async (targetSocketId, offer) => {
    peerRef.current = new RTCPeerConnection(ICE_SERVERS)
    const pc = peerRef.current

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current))
    }

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('ice-candidate', { targetId: targetSocketId, candidate: event.candidate })
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setPeerConnected(true)
        setNetworkQuality('Excellent')
      }
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socketRef.current.emit('answer', { targetId: targetSocketId, answer })
  }

  // Socket Live Chat Send
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !socketRef.current) return

    const roomId = booking?.roomId || id
    socketRef.current.emit('message', {
      roomId,
      message: chatInput.trim(),
      senderId: currentUserId,
      senderName: userData?.user?.name || 'User',
      senderRole: currentUserRole,
      type: 'text',
    })
    setChatInput('')

    // Stop typing
    socketRef.current.emit('stop-typing', { roomId, name: userData?.user?.name })
  }

  // Typing indicator
  const handleChatInputChange = (e) => {
    setChatInput(e.target.value)
    if (!socketRef.current) return

    const roomId = booking?.roomId || id
    socketRef.current.emit('typing', { roomId, name: userData?.user?.name })

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', { roomId, name: userData?.user?.name })
    }, 1500)
  }

  const handleToggleMic = () => {
    const newState = !isMicOn
    setIsMicOn(newState)
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = newState))
    }
    if (socketRef.current) {
      socketRef.current.emit('mic-toggle', { roomId: booking?.roomId || id, enabled: newState })
    }
  }

  const handleToggleVideo = () => {
    const newState = !isVideoOn
    setIsVideoOn(newState)
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = newState))
    }
    if (socketRef.current) {
      socketRef.current.emit('camera-toggle', { roomId: booking?.roomId || id, enabled: newState })
    }
  }

  // Actual Screen Sharing implementation
  const handleToggleScreenShare = async () => {
    const roomId = booking?.roomId || id

    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        })
        screenStreamRef.current = screenStream

        const screenTrack = screenStream.getVideoTracks()[0]

        // Replace video track in peer connection
        if (peerRef.current) {
          const sender = peerRef.current.getSenders().find((s) => s.track?.kind === 'video')
          if (sender) {
            await sender.replaceTrack(screenTrack)
          }
        }

        // Show screen share in local preview
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        setIsScreenSharing(true)
        socketRef.current?.emit('screen-share-start', { roomId })

        // When user stops screen share from browser UI
        screenTrack.onended = () => {
          handleStopScreenShare()
        }
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err)
      }
    } else {
      handleStopScreenShare()
    }
  }

  const handleStopScreenShare = async () => {
    const roomId = booking?.roomId || id

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
      screenStreamRef.current = null
    }

    // Restore camera track
    if (localStreamRef.current && peerRef.current) {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0]
      if (cameraTrack) {
        const sender = peerRef.current.getSenders().find((s) => s.track?.kind === 'video')
        if (sender) {
          await sender.replaceTrack(cameraTrack)
        }
      }
    }

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
    }

    setIsScreenSharing(false)
    socketRef.current?.emit('screen-share-stop', { roomId })
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      studioContainerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleStartInterviewSession = () => {
    setInterviewStarted(true)
    if (socketRef.current) {
      socketRef.current.emit('interview-start', { roomId: booking?.roomId || id, bookingId: id })
    }
  }

  const handleEndInterviewSession = async () => {
    setInterviewStarted(false)
    if (socketRef.current) {
      socketRef.current.emit('interview-end', { roomId: booking?.roomId || id, bookingId: id })
    }
    try {
      await axios.post(`${ServerUrl}/api/human-interview/session/end/${id}`, {}, { withCredentials: true })
    } catch (err) {
      console.error('End session API error:', err)
    }
  }

  const handleLeaveRoom = () => {
    // Stop media
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
    }
    // Leave socket room
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId: booking?.roomId || id })
      socketRef.current.disconnect()
    }
    // Close peer connection
    if (peerRef.current) {
      peerRef.current.close()
    }
    navigate(isInterviewer ? '/interviewer/dashboard' : '/human-interviews')
  }

  // OpenRouter AI Co-Interviewer Assistance Trigger
  const handleFetchAiAssist = async () => {
    setLoadingAiAssist(true)
    try {
      const res = await axios.post(
        `${ServerUrl}/api/human-interview/ai-assist`,
        {
          transcriptSnippet: chatMessages.map((m) => `${m.senderName}: ${m.message}`).join('\n'),
          candidateRole: booking?.slotId?.role || 'Software Engineer',
        },
        { withCredentials: true }
      )
      setAiAssistData(res.data)
    } catch (err) {
      console.error('AI assist error:', err)
    } finally {
      setLoadingAiAssist(false)
    }
  }

  const handleFetchFinalAiSummary = async () => {
    try {
      const res = await axios.post(
        `${ServerUrl}/api/human-interview/ai-summary`,
        {
          transcript: chatMessages.map((m) => `${m.senderName}: ${m.message}`).join('\n'),
        },
        { withCredentials: true }
      )
      setAiSummary(res.data)
    } catch (err) {
      console.error('AI summary error:', err)
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    setSubmittingFeedback(true)
    try {
      await axios.post(
        `${ServerUrl}/api/human-interview/feedback/${id}`,
        {
          overallRating: Number(overallRating),
          technicalScore: Number(techScore),
          communicationScore: Number(commScore),
          problemSolvingScore: Number(psScore),
          interviewerFeedback: feedbackText,
          strengths,
          weaknesses,
          suggestions,
          recommendation,
        },
        { withCredentials: true }
      )
      setFeedbackSubmitted(true)
      handleFetchFinalAiSummary()
    } catch (error) {
      console.error('Submit feedback error:', error)
      alert('Failed to submit interview feedback.')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  // Tag helpers
  const addTag = (input, setInput, list, setList) => {
    if (input.trim() && !list.includes(input.trim())) {
      setList((prev) => [...prev, input.trim()])
      setInput('')
    }
  }

  const removeTag = (item, setList) => {
    setList((prev) => prev.filter((i) => i !== item))
  }

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-950 flex items-center justify-center text-white'>
        <div className='text-center space-y-3'>
          <div className='w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto' />
          <p className='text-gray-400 text-sm font-medium'>Connecting to WebRTC & Socket.IO Studio...</p>
        </div>
      </div>
    )
  }

  const mentorName = booking?.mentorId?.name || 'Interviewer'
  const candidateName = booking?.userId?.name || 'Candidate'
  const currentUserName = userData?.user?.name || 'User'

  return (
    <div ref={studioContainerRef} className='min-h-screen bg-gray-950 text-white flex flex-col justify-between overflow-hidden relative selection:bg-emerald-500'>
      {/* Waiting Room Overlay */}
      <AnimatePresence>
        {inWaitingRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[9999] bg-gray-950 flex items-center justify-center px-4'
          >
            <div className='bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden'>
              <div className='w-16 h-16 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-sm'>
                <BsRobot size={32} />
              </div>

              <div>
                <h2 className='text-2xl font-extrabold text-white'>Live Waiting Room</h2>
                <p className='text-xs text-gray-400 mt-1'>
                  {isInterviewer ? (
                    <>Session with candidate <span className='font-semibold text-emerald-400'>{candidateName}</span></>
                  ) : (
                    <>Session with <span className='font-semibold text-emerald-400'>{mentorName}</span></>
                  )}
                </p>
              </div>

              <div className='bg-gray-950 border border-gray-800 rounded-2xl p-4 text-xs text-gray-300 space-y-2 text-left'>
                <p className='font-bold text-white flex items-center gap-1.5'>
                  <BsShieldCheck className='text-emerald-400' size={14} /> WebRTC & Socket.IO Studio Controls:
                </p>
                <ul className='list-disc list-inside space-y-1 text-gray-400'>
                  <li>STUN/TURN WebRTC Peer-to-Peer encrypted video feed.</li>
                  <li>Live persistent socket chat & typing status.</li>
                  <li>Screen sharing replaces your video track for the peer.</li>
                  <li>OpenRouter AI Co-Interviewer assistance enabled.</li>
                </ul>
              </div>

              <button
                onClick={joinMeetingRoom}
                className='w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-extrabold text-sm transition shadow-lg shadow-emerald-600/20 cursor-pointer'
              >
                Join Live Interview Room
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation & Status Bar */}
      <header className='bg-gray-900/90 border-b border-gray-800 px-6 py-3 flex items-center justify-between z-20 backdrop-blur-md'>
        <div className='flex items-center gap-3'>
          <button
            onClick={handleLeaveRoom}
            className='p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition cursor-pointer'
          >
            <BsArrowLeft size={16} />
          </button>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='font-extrabold text-base tracking-tight text-white'>
                {mentorName} vs {candidateName}
              </h1>
              <span className='inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full'>
                <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
                {peerConnected ? 'Connected' : 'Waiting'}
              </span>
            </div>
            <p className='text-xs text-gray-400 mt-0.5 flex items-center gap-3'>
              <span className='flex items-center gap-1'><BsClock size={11} /> {formatTimer(timerSeconds)}</span>
              <span>•</span>
              <span className={`flex items-center gap-1 ${
                networkQuality === 'Excellent' || networkQuality === 'Reconnected' ? 'text-emerald-400' :
                networkQuality === 'Poor' ? 'text-amber-400' : 'text-rose-400'
              }`}>
                <BsWifi size={11} /> {networkQuality}
              </span>
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {/* Only interviewer can start/end sessions */}
          {isInterviewer && (
            <>
              {!interviewStarted ? (
                <button
                  onClick={handleStartInterviewSession}
                  className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm'
                >
                  <BsPlayFill size={16} />
                  <span>Start Interview</span>
                </button>
              ) : (
                <button
                  onClick={handleEndInterviewSession}
                  className='bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm'
                >
                  <BsStopFill size={16} />
                  <span>End Session</span>
                </button>
              )}
            </>
          )}

          {/* Learner sees interview status */}
          {!isInterviewer && (
            <span className={`text-xs font-bold px-3 py-2 rounded-xl ${
              interviewStarted
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}>
              {interviewStarted ? '● Interview in Progress' : '○ Waiting for interviewer...'}
            </span>
          )}

          <button
            onClick={handleLeaveRoom}
            className='bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer'
          >
            <BsTelephoneX size={14} />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto w-full overflow-hidden'>
        {/* Video Stage (2 Columns) */}
        <div className='lg:col-span-2 flex flex-col justify-between space-y-4'>
          {/* Main Peer Stream Container */}
          <div className='flex-1 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center min-h-[420px]'>
            {/* Main Remote Video Element */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className='w-full h-full object-cover rounded-3xl'
            />

            {/* Fallback Display if peer not transmitting */}
            {!peerConnected && (
              <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-950 flex flex-col items-center justify-center text-center p-8 z-10 space-y-4'>
                <div className='w-24 h-24 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-3xl font-extrabold shadow-xl border-2 border-emerald-400/40'>
                  {(isInterviewer ? candidateName : mentorName).charAt(0).toUpperCase()}
                </div>
                <h2 className='text-xl font-bold text-white'>{isInterviewer ? candidateName : mentorName}</h2>
                <p className='text-xs text-emerald-400 font-semibold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800'>
                  WebRTC Peer Connecting...
                </p>
              </div>
            )}

            {/* Local Stream PIP (Bottom Right) */}
            <div className='absolute bottom-4 right-4 w-44 h-32 bg-gray-950 border-2 border-emerald-500/60 rounded-2xl overflow-hidden shadow-2xl z-20 group'>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className='w-full h-full object-cover'
              />
              <span className='absolute bottom-1 left-2 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded font-mono'>
                You ({currentUserName})
                {isScreenSharing && ' - Sharing Screen'}
              </span>
            </div>
          </div>

          {/* Media Toolbar */}
          <div className='bg-gray-900 border border-gray-800 rounded-2xl p-3 flex items-center justify-center gap-4 shadow-lg'>
            <button
              onClick={handleToggleMic}
              className={`p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center ${
                isMicOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <BsMic size={18} /> : <BsMicMute size={18} />}
            </button>

            <button
              onClick={handleToggleVideo}
              className={`p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center ${
                isVideoOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
            >
              {isVideoOn ? <BsCameraVideo size={18} /> : <BsCameraVideoOff size={18} />}
            </button>

            <button
              onClick={handleToggleScreenShare}
              className={`p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center ${
                isScreenSharing ? 'bg-emerald-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              <BsDisplay size={18} />
            </button>

            <button
              onClick={handleToggleFullscreen}
              className='p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white'
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <BsFullscreenExit size={18} /> : <BsFullscreen size={18} />}
            </button>
          </div>
        </div>

        {/* Right Sidebar Tabs */}
        <div className='bg-gray-900 border border-gray-800 rounded-3xl flex flex-col justify-between overflow-hidden shadow-xl h-[560px] lg:h-auto'>
          {/* Tab Navigation */}
          <div className='bg-gray-950 p-2 border-b border-gray-800 flex items-center gap-1 text-[11px] font-semibold overflow-x-auto'>
            {[
              { id: 'chat', label: 'Chat', icon: <BsChatDots size={13} /> },
              ...(isInterviewer ? [
                { id: 'ai_co_interviewer', label: 'AI Assist', icon: <BsRobot size={13} /> },
                { id: 'feedback', label: 'Evaluate', icon: <BsStarFill size={13} /> },
              ] : []),
              { id: 'resume', label: 'Info', icon: <BsFileEarmarkText size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id)}
                className={`flex-1 py-2 px-2 rounded-xl cursor-pointer transition flex items-center justify-center gap-1 whitespace-nowrap ${
                  activeRightTab === tab.id ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Views */}
          <div className='flex-1 p-4 overflow-y-auto space-y-4 text-xs'>
            {activeRightTab === 'chat' && (
              <div className='flex flex-col h-full justify-between space-y-3'>
                <div className='space-y-3 overflow-y-auto max-h-[380px] pr-1'>
                  {chatMessages.map((msg, i) => (
                    <div
                      key={msg._id || i}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.type === 'system'
                          ? 'bg-gray-950 text-gray-400 text-center border border-gray-800 text-[11px]'
                          : msg.senderName === currentUserName
                          ? 'bg-emerald-600 text-white ml-6 rounded-tr-none'
                          : 'bg-gray-800 text-gray-200 mr-6 rounded-tl-none border border-gray-700'
                      }`}
                    >
                      {msg.type !== 'system' && (
                        <div className='flex justify-between items-center text-[10px] opacity-75'>
                          <span className='font-bold'>{msg.senderName}</span>
                          <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                        </div>
                      )}
                      <p className='leading-relaxed font-normal whitespace-pre-wrap'>{msg.message}</p>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Typing Indicator */}
                {remoteTyping && (
                  <p className='text-[10px] text-gray-400 italic animate-pulse'>Someone is typing...</p>
                )}

                <form onSubmit={handleSendMessage} className='flex items-center gap-2 pt-2 border-t border-gray-800'>
                  <input
                    type='text'
                    value={chatInput}
                    onChange={handleChatInputChange}
                    placeholder='Type a message...'
                    className='flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500'
                  />
                  <button type='submit' className='bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl cursor-pointer'>
                    <BsSend size={13} />
                  </button>
                </form>
              </div>
            )}

            {/* AI Co-Interviewer Assistance Tab (Interviewer Only) */}
            {activeRightTab === 'ai_co_interviewer' && isInterviewer && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between border-b border-gray-800 pb-2'>
                  <h4 className='font-bold text-white text-sm flex items-center gap-1.5'>
                    <BsRobot className='text-emerald-400' size={16} /> AI Co-Interviewer
                  </h4>
                  <button
                    onClick={handleFetchAiAssist}
                    disabled={loadingAiAssist}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition cursor-pointer disabled:opacity-50'
                  >
                    {loadingAiAssist ? 'Analyzing...' : 'Analyze Session'}
                  </button>
                </div>

                {aiAssistData ? (
                  <div className='space-y-3 text-xs'>
                    <div className='bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-1.5'>
                      <p className='font-bold text-emerald-400'>Follow-up Questions:</p>
                      <ul className='list-disc list-inside text-gray-300 space-y-1'>
                        {(aiAssistData.followUpQuestions || []).map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div className='bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-1'>
                      <p className='font-bold text-purple-400'>Detected Skills:</p>
                      <p className='text-gray-300'>
                        Technical: {(aiAssistData.technicalSkillDetected || []).join(', ')}
                        <br />
                        Soft: {(aiAssistData.softSkillDetected || []).join(', ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center space-y-2 text-gray-400'>
                    <BsLightbulb size={24} className='mx-auto text-amber-400' />
                    <p className='font-bold text-white text-xs'>AI Assistant Ready</p>
                    <p className='text-[11px]'>Click "Analyze Session" to get follow-up questions and skill detection from the chat transcript.</p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback & Score Tab (Interviewer Only) */}
            {activeRightTab === 'feedback' && isInterviewer && (
              <div className='space-y-4'>
                <h4 className='font-bold text-white text-sm border-b border-gray-800 pb-2'>Candidate Evaluation</h4>

                {feedbackSubmitted ? (
                  <div className='bg-emerald-950/80 border border-emerald-800 rounded-2xl p-5 text-center text-emerald-300 space-y-3'>
                    <BsCheckCircleFill size={28} className='mx-auto text-emerald-400' />
                    <p className='font-bold text-sm'>Evaluation Submitted!</p>

                    {aiSummary && (
                      <div className='bg-gray-950 p-4 rounded-xl text-left border border-gray-800 space-y-2 text-xs text-gray-300'>
                        <p className='font-bold text-emerald-400'>AI Recommendation: {aiSummary.hiringRecommendation}</p>
                        <p className='font-semibold text-white'>Strengths:</p>
                        <ul className='list-disc list-inside text-gray-400'>
                          {(aiSummary.strengths || []).map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                        {aiSummary.weaknesses?.length > 0 && (
                          <>
                            <p className='font-semibold text-white'>Weaknesses:</p>
                            <ul className='list-disc list-inside text-gray-400'>
                              {aiSummary.weaknesses.map((w, idx) => (
                                <li key={idx}>{w}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className='space-y-3'>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className='text-gray-400 font-semibold block mb-1'>Overall (1-10)</label>
                        <input type='number' min={1} max={10} value={overallRating} onChange={(e) => setOverallRating(e.target.value)}
                          className='w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold' />
                      </div>
                      <div>
                        <label className='text-gray-400 font-semibold block mb-1'>Technical (1-10)</label>
                        <input type='number' min={1} max={10} value={techScore} onChange={(e) => setTechScore(e.target.value)}
                          className='w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold' />
                      </div>
                      <div>
                        <label className='text-gray-400 font-semibold block mb-1'>Communication (1-10)</label>
                        <input type='number' min={1} max={10} value={commScore} onChange={(e) => setCommScore(e.target.value)}
                          className='w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold' />
                      </div>
                      <div>
                        <label className='text-gray-400 font-semibold block mb-1'>Problem Solving (1-10)</label>
                        <input type='number' min={1} max={10} value={psScore} onChange={(e) => setPsScore(e.target.value)}
                          className='w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold' />
                      </div>
                    </div>

                    <div>
                      <label className='text-gray-400 font-semibold block mb-1'>Recommendation</label>
                      <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)}
                        className='w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold'>
                        <option value='Strong Hire'>Strong Hire</option>
                        <option value='Hire'>Hire</option>
                        <option value='Maybe'>Maybe</option>
                        <option value='No Hire'>No Hire</option>
                      </select>
                    </div>

                    {/* Strengths Tags */}
                    <div>
                      <label className='text-gray-400 font-semibold block mb-1'>Strengths</label>
                      <div className='flex gap-1.5 mb-1'>
                        <input type='text' value={strengthInput} onChange={(e) => setStrengthInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(strengthInput, setStrengthInput, strengths, setStrengths))}
                          placeholder='Add strength...'
                          className='flex-1 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-white text-[11px]' />
                        <button type='button' onClick={() => addTag(strengthInput, setStrengthInput, strengths, setStrengths)}
                          className='bg-emerald-700 text-white px-2 py-1 rounded-lg text-[11px] cursor-pointer'>+</button>
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {strengths.map((s, i) => (
                          <span key={i} className='bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1'>
                            {s} <button type='button' onClick={() => removeTag(s, setStrengths)} className='cursor-pointer hover:text-rose-400'>×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Weaknesses Tags */}
                    <div>
                      <label className='text-gray-400 font-semibold block mb-1'>Weaknesses</label>
                      <div className='flex gap-1.5 mb-1'>
                        <input type='text' value={weaknessInput} onChange={(e) => setWeaknessInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(weaknessInput, setWeaknessInput, weaknesses, setWeaknesses))}
                          placeholder='Add weakness...'
                          className='flex-1 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-white text-[11px]' />
                        <button type='button' onClick={() => addTag(weaknessInput, setWeaknessInput, weaknesses, setWeaknesses)}
                          className='bg-rose-700 text-white px-2 py-1 rounded-lg text-[11px] cursor-pointer'>+</button>
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {weaknesses.map((w, i) => (
                          <span key={i} className='bg-rose-950 text-rose-400 text-[10px] px-2 py-0.5 rounded-full border border-rose-800 flex items-center gap-1'>
                            {w} <button type='button' onClick={() => removeTag(w, setWeaknesses)} className='cursor-pointer hover:text-white'>×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Suggestions Tags */}
                    <div>
                      <label className='text-gray-400 font-semibold block mb-1'>Suggestions</label>
                      <div className='flex gap-1.5 mb-1'>
                        <input type='text' value={suggestionInput} onChange={(e) => setSuggestionInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(suggestionInput, setSuggestionInput, suggestions, setSuggestions))}
                          placeholder='Add suggestion...'
                          className='flex-1 bg-gray-950 border border-gray-800 rounded-lg px-2 py-1 text-white text-[11px]' />
                        <button type='button' onClick={() => addTag(suggestionInput, setSuggestionInput, suggestions, setSuggestions)}
                          className='bg-blue-700 text-white px-2 py-1 rounded-lg text-[11px] cursor-pointer'>+</button>
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {suggestions.map((s, i) => (
                          <span key={i} className='bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-800 flex items-center gap-1'>
                            {s} <button type='button' onClick={() => removeTag(s, setSuggestions)} className='cursor-pointer hover:text-white'>×</button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className='text-gray-400 font-semibold block mb-1'>Detailed Feedback</label>
                      <textarea
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder='Write detailed evaluation notes...'
                        className='w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none'
                        required
                      />
                    </div>

                    <button
                      type='submit'
                      disabled={submittingFeedback}
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer transition'
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Evaluation & Generate AI Report'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Info Tab */}
            {activeRightTab === 'resume' && (
              <div className='space-y-3 text-gray-300'>
                <h4 className='font-bold text-white text-sm border-b border-gray-800 pb-2'>Session Information</h4>
                <div className='bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-2 text-xs'>
                  <p className='font-bold text-emerald-400'>Session Details</p>
                  <p className='text-gray-400'>Interviewer: {mentorName}</p>
                  <p className='text-gray-400'>Candidate: {candidateName}</p>
                  <p className='text-gray-400'>Date: {booking?.date || 'Today'}</p>
                  <p className='text-gray-400'>Time: {booking?.timeSlot || 'Scheduled'}</p>
                  {booking?.notes && (
                    <p className='text-gray-400'>Notes: {booking.notes}</p>
                  )}
                </div>

                <div className='bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-2 text-xs'>
                  <p className='font-bold text-emerald-400'>Your Role</p>
                  <p className='text-gray-400 capitalize'>{currentUserRole}</p>
                  <p className='text-gray-400'>Connected as: {currentUserName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewRoom
