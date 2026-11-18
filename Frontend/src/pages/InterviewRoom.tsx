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
  BsDashLg,
  BsArrowRepeat,
  BsPhone,
  BsLaptop
} from 'react-icons/bs'
import { ServerUrl } from '../App'

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:openrelay.metered.ca:80' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelay',
      credential: 'openrelay',
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelay',
      credential: 'openrelay',
    },
  ],
  iceCandidatePoolSize: 10,
}

function InterviewRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)

  // Current User Hydration (Redux + API fallback)
  const [currentUser, setCurrentUser] = useState<any>(userData?.user || userData || null)

  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [inWaitingRoom, setInWaitingRoom] = useState(true)

  // Mobile vs Laptop Device State
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [mobileActiveView, setMobileActiveView] = useState<'video' | 'tools'>('video')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [supportsDisplayMedia, setSupportsDisplayMedia] = useState(true)
  const [mediaNotice, setMediaNotice] = useState<string | null>(null)

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
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [remoteTyping, setRemoteTyping] = useState(false)
  const [unreadChatCount, setUnreadChatCount] = useState(0)

  // OpenRouter AI Assistance State
  const [aiAssistData, setAiAssistData] = useState<any>(null)
  const [loadingAiAssist, setLoadingAiAssist] = useState(false)
  const [aiSummary, setAiSummary] = useState<any>(null)

  // Enhanced Evaluation Form State
  const [overallRating, setOverallRating] = useState(8)
  const [techScore, setTechScore] = useState(8)
  const [commScore, setCommScore] = useState(8)
  const [psScore, setPsScore] = useState(8)
  const [feedbackText, setFeedbackText] = useState('')
  const [strengthInput, setStrengthInput] = useState('')
  const [strengths, setStrengths] = useState<string[]>([])
  const [weaknessInput, setWeaknessInput] = useState('')
  const [weaknesses, setWeaknesses] = useState<string[]>([])
  const [suggestionInput, setSuggestionInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recommendation, setRecommendation] = useState('Hire')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  // Media & WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const studioContainerRef = useRef<HTMLDivElement | null>(null)
  const socketRef = useRef<any>(null)
  const peerRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const typingTimeoutRef = useRef<any>(null)
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([])

  const [roomError, setRoomError] = useState<string | null>(null)

  // Detect mobile device vs laptop and display media support
  useEffect(() => {
    const checkDevice = () => {
      const isTouchOrMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024
      setIsMobileDevice(isTouchOrMobile)
      setSupportsDisplayMedia(Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getDisplayMedia === 'function' && !isTouchOrMobile))
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Hydrate Current User if not yet in Redux
  useEffect(() => {
    if (!currentUser) {
      axios.get(`${ServerUrl}/api/user/current-user`, { withCredentials: true })
        .then((res) => {
          const u = res.data?.user || res.data
          if (u) setCurrentUser(u)
        })
        .catch((err) => {
          console.warn('Current user fetch error in room:', err)
        })
    }
  }, [currentUser])

  // Derive Current User identity
  const currentUserId = currentUser?.id || currentUser?._id
  const currentUserName = currentUser?.name || 'User'
  const currentUserRole = currentUser?.role || 'learner'

  // Derive booking participants
  const mentorName = booking?.mentor?.name || (booking?.mentorId as any)?.name || 'Interviewer'
  const candidateName = booking?.user?.name || (booking?.userId as any)?.name || 'Candidate'

  // Determine if the current active user is the Interviewer
  const isInterviewer = Boolean(
    (currentUserId && booking?.mentorId && String(currentUserId) === String(booking.mentorId)) ||
    currentUserRole === 'interviewer'
  )

  const myDisplayName = isInterviewer ? mentorName : (currentUserName !== 'User' ? currentUserName : candidateName)
  const peerDisplayName = isInterviewer ? candidateName : mentorName

  // Load Booking & Chat History
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true)
        setRoomError(null)
        const [bRes, msgRes] = await Promise.all([
          axios.get(`${ServerUrl}/api/human-interview/booking/${id}`, { withCredentials: true }),
          axios.get(`${ServerUrl}/api/human-interview/messages/${id}`, { withCredentials: true }),
        ])
        setBooking(bRes.data)
        if (bRes.data?.roomStatus === 'active') {
          setInterviewStarted(true)
          if (bRes.data.roomStartTime) {
            const elapsed = Math.max(0, Math.floor((Date.now() - new Date(bRes.data.roomStartTime).getTime()) / 1000))
            setTimerSeconds(elapsed)
          }
        }
        setChatMessages(msgRes.data || [])
      } catch (err: any) {
        console.error('Init room error:', err)
        setRoomError(err.response?.data?.message || 'Failed to authorize or load interview session.')
      } finally {
        setLoading(false)
      }
    }
    if (id) initData()
  }, [id])

  // Timer Effect
  useEffect(() => {
    let interval: any = null
    if (interviewStarted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [interviewStarted])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, activeRightTab, mobileActiveView])

  // Fullscreen listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Helper to drain buffered ICE candidates once remoteDescription is set
  const processPendingIceCandidates = async (pc: RTCPeerConnection) => {
    while (pendingIceCandidatesRef.current.length > 0) {
      const candidate = pendingIceCandidatesRef.current.shift()
      if (candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (err) {
          console.warn('Deferred ICE candidate error:', err)
        }
      }
    }
  }

  // Smart Media Stream Acquisition (with Mobile & Laptop constraints and Audio Fallback)
  const getMediaStream = async (targetFacing: 'user' | 'environment' = 'user') => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    const videoConstraints: any = isMobile
      ? { facingMode: targetFacing, width: { ideal: 1280 }, height: { ideal: 720 } }
      : { width: { ideal: 1280 }, height: { ideal: 720 } }

    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      })
    } catch (err: any) {
      console.warn('Optimized video/audio constraints failed, attempting fallback:', err)
      try {
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      } catch (err2) {
        console.warn('Camera blocked or unavailable, falling back to audio only:', err2)
        setMediaNotice('Camera access unavailable. Connected via microphone only.')
        return await navigator.mediaDevices.getUserMedia({ audio: true })
      }
    }
  }

  // Initialize Socket.IO & WebRTC Media Stream
  const joinMeetingRoom = async () => {
    setInWaitingRoom(false)

    // Request Media Stream with robust error handling
    try {
      const stream = await getMediaStream(facingMode)
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
        localVideoRef.current.muted = true
        localVideoRef.current.setAttribute('playsinline', 'true')
        localVideoRef.current.play().catch((e) => console.log('Local video play note:', e))
      }
    } catch (err) {
      console.warn('Could not acquire media stream:', err)
      setMediaNotice('Could not access microphone or camera. Please check browser permissions.')
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
    const canonicalRoomId = String(id)

    // Register user for targeted notifications
    if (currentUserId) {
      socket.emit('register-user', { userId: currentUserId })
    }

    // Join room using the canonical booking URL param to ensure both users match
    socket.emit('join-room', {
      roomId: canonicalRoomId,
      bookingId: canonicalRoomId,
      legacyRoomId: booking?.roomId,
      userId: currentUserId,
      name: myDisplayName,
      role: isInterviewer ? 'interviewer' : 'learner',
    })

    // Listen for WebRTC Signaling & Socket Events
    socket.on('user-connected', ({ socketId }: any) => {
      console.log('Peer connected to room:', socketId)
      setPeerConnected(true)
      createWebRTCOffer(socketId)
    })

    // Existing peers in the room when newly joined
    socket.on('room-peers', ({ peers }: any) => {
      console.log('Discovered existing room peers:', peers)
      // The peer already in the room initiates the offer on user-connected.
      // If no offer arrives within 2.5s (fallback), initiate offer as a safety net.
      if (peers && peers.length > 0) {
        setTimeout(() => {
          if (!peerRef.current && peers[0]?.socketId) {
            console.log('Fallback initiating WebRTC offer to existing peer:', peers[0].socketId)
            createWebRTCOffer(peers[0].socketId)
          }
        }, 2500)
      }
    })

    socket.on('offer', async ({ socketId, offer }: any) => {
      console.log('Received WebRTC offer from:', socketId)
      await handleWebRTCOffer(socketId, offer)
    })

    socket.on('answer', async ({ answer }: any) => {
      console.log('Received WebRTC answer')
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer))
          await processPendingIceCandidates(peerRef.current)
        } catch (e) {
          console.error('Set remote description error:', e)
        }
      }
    })

    socket.on('ice-candidate', async ({ candidate }: any) => {
      if (!candidate) return
      if (peerRef.current && peerRef.current.remoteDescription && peerRef.current.remoteDescription.type) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate))
        } catch (e) {
          console.error('Add ICE candidate error:', e)
        }
      } else {
        // Queue candidate until remoteDescription is established
        pendingIceCandidatesRef.current.push(candidate)
      }
    })

    socket.on('user-disconnected', () => {
      setPeerConnected(false)
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    })

    socket.on('message', (msg: any) => {
      setChatMessages((prev) => {
        const msgId = msg.id || msg._id
        if (msgId && prev.some((m) => (m.id || m._id) === msgId)) {
          return prev
        }
        return [...prev, msg]
      })
      // Increment unread count if user is on mobile or not looking at the chat tab
      if (activeRightTab !== 'chat' || (isMobileDevice && mobileActiveView !== 'tools')) {
        setUnreadChatCount((prev) => prev + 1)
      }
    })

    socket.on('typing', () => setRemoteTyping(true))
    socket.on('stop-typing', () => setRemoteTyping(false))

    // Real-time Session Synchronization
    socket.on('session-sync', ({ status, elapsedSeconds }: any) => {
      console.log('Live session sync received:', status, elapsedSeconds)
      if (status === 'active') {
        setInterviewStarted(true)
        if (typeof elapsedSeconds === 'number') {
          setTimerSeconds(elapsedSeconds)
        }
      }
    })

    socket.on('interview-start', () => {
      setInterviewStarted(true)
      setTimerSeconds(0)
    })

    socket.on('interview-end', () => {
      setInterviewStarted(false)
    })

    socket.on('reconnect', () => {
      setNetworkQuality('Reconnected')
      socket.emit('join-room', {
        roomId: canonicalRoomId,
        bookingId: canonicalRoomId,
        legacyRoomId: booking?.roomId,
        userId: currentUserId,
        name: myDisplayName,
        role: isInterviewer ? 'interviewer' : 'learner',
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

  // WebRTC Peer Connection - Initiator
  const createWebRTCOffer = async (targetSocketId: string) => {
    if (peerRef.current) {
      try { peerRef.current.close() } catch (e) {}
    }

    peerRef.current = new RTCPeerConnection(ICE_SERVERS)
    const pc = peerRef.current

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!))
    }

    pc.ontrack = (event) => {
      console.log('WebRTC ontrack received (initiator):', event.track.kind)
      if (remoteVideoRef.current) {
        if (event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
        } else {
          let currentStream = remoteVideoRef.current.srcObject as MediaStream
          if (!currentStream) {
            currentStream = new MediaStream()
            remoteVideoRef.current.srcObject = currentStream
          }
          currentStream.addTrack(event.track)
        }
        remoteVideoRef.current.setAttribute('playsinline', 'true')
        remoteVideoRef.current.play().catch((e) => console.log('Remote stream play note:', e))
      }
      setPeerConnected(true)
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { targetId: targetSocketId, candidate: event.candidate })
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state (initiator):', pc.iceConnectionState)
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setPeerConnected(true)
        setNetworkQuality('Excellent')
      } else if (pc.iceConnectionState === 'disconnected') {
        setNetworkQuality('Poor')
      } else if (pc.iceConnectionState === 'failed') {
        setNetworkQuality('Disconnected')
        pc.restartIce?.()
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('Peer connection state (initiator):', pc.connectionState)
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
    socketRef.current?.emit('offer', { targetId: targetSocketId, offer })
  }

  // WebRTC Peer Connection - Receiver
  const handleWebRTCOffer = async (targetSocketId: string, offer: RTCSessionDescriptionInit) => {
    if (peerRef.current) {
      try { peerRef.current.close() } catch (e) {}
    }

    peerRef.current = new RTCPeerConnection(ICE_SERVERS)
    const pc = peerRef.current

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!))
    }

    pc.ontrack = (event) => {
      console.log('WebRTC ontrack received (receiver):', event.track.kind)
      if (remoteVideoRef.current) {
        if (event.streams && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
        } else {
          let currentStream = remoteVideoRef.current.srcObject as MediaStream
          if (!currentStream) {
            currentStream = new MediaStream()
            remoteVideoRef.current.srcObject = currentStream
          }
          currentStream.addTrack(event.track)
        }
        remoteVideoRef.current.setAttribute('playsinline', 'true')
        remoteVideoRef.current.play().catch((e) => console.log('Remote stream play note:', e))
      }
      setPeerConnected(true)
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', { targetId: targetSocketId, candidate: event.candidate })
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state (receiver):', pc.iceConnectionState)
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setPeerConnected(true)
        setNetworkQuality('Excellent')
      } else if (pc.iceConnectionState === 'disconnected') {
        setNetworkQuality('Poor')
      } else if (pc.iceConnectionState === 'failed') {
        setNetworkQuality('Disconnected')
        pc.restartIce?.()
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('Peer connection state (receiver):', pc.connectionState)
      if (pc.connectionState === 'connected') {
        setPeerConnected(true)
        setNetworkQuality('Excellent')
      }
    }

    await pc.setRemoteDescription(new RTCSessionDescription(offer))
    await processPendingIceCandidates(pc)

    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    socketRef.current?.emit('answer', { targetId: targetSocketId, answer })
  }

  // Socket Live Chat Send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !socketRef.current) return

    const canonicalRoomId = String(id)
    socketRef.current.emit('message', {
      roomId: canonicalRoomId,
      bookingId: canonicalRoomId,
      legacyRoomId: booking?.roomId,
      message: chatInput.trim(),
      senderId: currentUserId || null,
      senderName: myDisplayName,
      senderRole: isInterviewer ? 'interviewer' : 'learner',
      type: 'text',
    })
    setChatInput('')

    // Stop typing
    socketRef.current.emit('stop-typing', { roomId: canonicalRoomId, name: myDisplayName })
  }

  // Typing indicator
  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value)
    if (!socketRef.current) return

    const canonicalRoomId = String(id)
    socketRef.current.emit('typing', { roomId: canonicalRoomId, name: myDisplayName })

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', { roomId: canonicalRoomId, name: myDisplayName })
    }, 1500)
  }

  const handleToggleMic = () => {
    const newState = !isMicOn
    setIsMicOn(newState)
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = newState))
    }
    if (socketRef.current) {
      socketRef.current.emit('mic-toggle', { roomId: String(id), enabled: newState })
    }
  }

  const handleToggleVideo = () => {
    const newState = !isVideoOn
    setIsVideoOn(newState)
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = newState))
    }
    if (socketRef.current) {
      socketRef.current.emit('camera-toggle', { roomId: String(id), enabled: newState })
    }
  }

  // Flip Camera (Front / Back) for Mobile devices
  const handleFlipCamera = async () => {
    if (!localStreamRef.current) return
    const newFacing = facingMode === 'user' ? 'environment' : 'user'

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      const newVideoTrack = newStream.getVideoTracks()[0]
      if (newVideoTrack) {
        if (peerRef.current) {
          const sender = peerRef.current.getSenders().find((s) => s.track?.kind === 'video')
          if (sender) {
            await sender.replaceTrack(newVideoTrack)
          }
        }
        const oldTrack = localStreamRef.current.getVideoTracks()[0]
        if (oldTrack) oldTrack.stop()

        localStreamRef.current.removeTrack(oldTrack)
        localStreamRef.current.addTrack(newVideoTrack)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current
        }
        setFacingMode(newFacing)
      }
    } catch (e) {
      console.warn('Could not flip camera:', e)
    }
  }

  // Screen Sharing (with graceful check for mobile / unsupported browsers)
  const handleToggleScreenShare = async () => {
    const canonicalRoomId = String(id)

    if (!isScreenSharing) {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen sharing is only supported on Laptop and Desktop browsers.')
        return
      }

      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
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
        socketRef.current?.emit('screen-share-start', { roomId: canonicalRoomId })

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
    const canonicalRoomId = String(id)

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
    socketRef.current?.emit('screen-share-stop', { roomId: canonicalRoomId })
  }

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      studioContainerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleStartInterviewSession = () => {
    const canonicalRoomId = String(id)
    setInterviewStarted(true)
    setTimerSeconds(0)
    if (socketRef.current) {
      socketRef.current.emit('interview-start', { roomId: canonicalRoomId, bookingId: canonicalRoomId })
    }
  }

  const handleEndInterviewSession = async () => {
    const canonicalRoomId = String(id)
    setInterviewStarted(false)
    if (socketRef.current) {
      socketRef.current.emit('interview-end', { roomId: canonicalRoomId, bookingId: canonicalRoomId })
    }
    try {
      await axios.post(`${ServerUrl}/api/human-interview/session/end/${id}`, {}, { withCredentials: true })
    } catch (err) {
      console.error('End session API error:', err)
    }
  }

  const handleLeaveRoom = () => {
    const canonicalRoomId = String(id)
    // Stop media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop())
    }
    // Leave socket room
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId: canonicalRoomId })
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

  const handleSubmitFeedback = async (e: React.FormEvent) => {
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
          feedback: feedbackText,
          strengths,
          weaknesses,
          suggestions,
          hiringRecommendation: recommendation,
        },
        { withCredentials: true }
      )
      setFeedbackSubmitted(true)
      await handleFetchFinalAiSummary()
    } catch (err) {
      console.error('Feedback submit error:', err)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const addTag = (input: string, setInput: any, list: string[], setList: any) => {
    if (!input.trim() || list.includes(input.trim())) return
    setList([...list, input.trim()])
    setInput('')
  }

  const removeTag = (item: string, setList: any) => {
    setList((prev: string[]) => prev.filter((i) => i !== item))
  }

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (roomError) {
    return (
      <div className='min-h-screen bg-gray-950 flex items-center justify-center text-white p-4'>
        <div className='bg-gray-900 border border-rose-800 rounded-3xl max-w-md w-full p-8 text-center space-y-4 shadow-2xl'>
          <div className='w-14 h-14 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold'>
            <BsShieldCheck />
          </div>
          <h3 className='text-lg font-extrabold text-white'>Access Denied / Session Error</h3>
          <p className='text-xs text-gray-300 leading-relaxed'>{roomError}</p>
          <button
            onClick={() => navigate(isInterviewer ? '/interviewer/dashboard' : '/human-interviews')}
            className='w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition cursor-pointer'
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
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

  return (
    <div ref={studioContainerRef} className='min-h-screen bg-gray-950 text-white flex flex-col justify-between overflow-hidden relative selection:bg-emerald-500'>
      {/* Waiting Room Overlay */}
      <AnimatePresence>
        {inWaitingRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-[9999] bg-gray-950 flex items-center justify-center px-4 overflow-y-auto py-8'
          >
            <div className='bg-gray-900 border border-gray-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden'>
              <div className='w-14 h-14 sm:w-16 sm:h-16 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-sm'>
                <BsRobot size={28} className='sm:w-8 sm:h-8' />
              </div>

              <div>
                <h2 className='text-xl sm:text-2xl font-extrabold text-white'>Live Waiting Room</h2>
                <p className='text-xs text-gray-400 mt-1'>
                  {isInterviewer ? (
                    <>Session with candidate <span className='font-semibold text-emerald-400'>{candidateName}</span></>
                  ) : (
                    <>Session with mentor <span className='font-semibold text-emerald-400'>{mentorName}</span></>
                  )}
                </p>
              </div>

              {/* Device indicator pill */}
              <div className='inline-flex items-center gap-2 bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-full text-xs text-gray-300'>
                {isMobileDevice ? (
                  <>
                    <BsPhone className='text-emerald-400' />
                    <span>Mobile Optimized (Touch & Front Camera)</span>
                  </>
                ) : (
                  <>
                    <BsLaptop className='text-emerald-400' />
                    <span>Laptop / Desktop Studio (HD & Screen Sharing)</span>
                  </>
                )}
              </div>

              <div className='bg-gray-950 border border-gray-800 rounded-2xl p-4 text-xs text-gray-300 space-y-2 text-left'>
                <p className='font-bold text-white flex items-center gap-1.5'>
                  <BsShieldCheck className='text-emerald-400' size={14} /> WebRTC & Studio Controls:
                </p>
                <ul className='list-disc list-inside space-y-1 text-gray-400'>
                  <li>P2P encrypted video & audio with noise suppression.</li>
                  <li>Real-time two-way chat with clear sender & receiver distinction.</li>
                  <li>{supportsDisplayMedia ? 'Screen sharing available for code & architecture.' : 'Mobile mode active.'}</li>
                  <li>OpenRouter AI Co-Interviewer assistance enabled.</li>
                </ul>
              </div>

              {mediaNotice && (
                <div className='bg-amber-950/60 border border-amber-800 text-amber-300 p-3 rounded-xl text-xs text-left'>
                  {mediaNotice}
                </div>
              )}

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
      <header className='bg-gray-900/90 border-b border-gray-800 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between z-20 backdrop-blur-md'>
        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <button
            onClick={handleLeaveRoom}
            className='p-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 hover:text-white transition cursor-pointer shrink-0'
            title='Leave session'
          >
            <BsArrowLeft size={16} />
          </button>
          <div className='min-w-0'>
            <div className='flex items-center gap-2 truncate'>
              <h1 className='font-extrabold text-xs sm:text-base tracking-tight text-white truncate'>
                {mentorName} <span className='text-gray-400 font-normal'>&</span> {candidateName}
              </h1>
              <span className='hidden sm:inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0'>
                <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
                {peerConnected ? 'Connected' : 'Waiting'}
              </span>
            </div>
            <p className='text-[10px] sm:text-xs text-gray-400 mt-0.5 flex items-center gap-2 sm:gap-3'>
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

        <div className='flex items-center gap-1.5 sm:gap-3 shrink-0'>
          {/* Only interviewer can start/end sessions */}
          {isInterviewer && (
            <>
              {!interviewStarted ? (
                <button
                  onClick={handleStartInterviewSession}
                  className='bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm'
                >
                  <BsPlayFill size={16} />
                  <span className='hidden sm:inline'>Start Interview</span>
                </button>
              ) : (
                <button
                  onClick={handleEndInterviewSession}
                  className='bg-amber-600 hover:bg-amber-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm'
                >
                  <BsStopFill size={16} />
                  <span className='hidden sm:inline'>End Session</span>
                </button>
              )}
            </>
          )}

          {/* Learner sees interview status */}
          {!isInterviewer && (
            <span className={`text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl ${
              interviewStarted
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}>
              {interviewStarted ? '● Live' : '○ Waiting'}
            </span>
          )}

          <button
            onClick={handleLeaveRoom}
            className='bg-rose-600 hover:bg-rose-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer'
          >
            <BsTelephoneX size={13} />
            <span className='hidden sm:inline'>Leave</span>
          </button>
        </div>
      </header>

      {/* Mobile View Switcher (Only visible on mobile / tablet < lg) */}
      <div className='lg:hidden flex items-center justify-around p-1.5 bg-gray-900 border-b border-gray-800 text-xs z-10'>
        <button
          onClick={() => setMobileActiveView('video')}
          className={`flex items-center gap-1.5 py-1.5 px-4 rounded-xl font-bold transition cursor-pointer ${
            mobileActiveView === 'video' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <BsCameraVideo size={13} />
          <span>Video View</span>
        </button>
        <button
          onClick={() => {
            setMobileActiveView('tools')
            setActiveRightTab('chat')
            setUnreadChatCount(0)
          }}
          className={`flex items-center gap-1.5 py-1.5 px-4 rounded-xl font-bold transition cursor-pointer relative ${
            mobileActiveView === 'tools' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <BsChatDots size={13} />
          <span>Chat & Tools</span>
          {unreadChatCount > 0 && (
            <span className='bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse'>
              {unreadChatCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Studio Area */}
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 p-2 sm:p-4 max-w-7xl mx-auto w-full overflow-hidden'>
        
        {/* Video Stage (Always shown on Desktop; conditionally shown on Mobile) */}
        <div className={`lg:col-span-2 flex flex-col justify-between space-y-3 sm:space-y-4 ${
          mobileActiveView === 'tools' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Main Peer Stream Container */}
          <div className='flex-1 bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center min-h-[360px] sm:min-h-[420px]'>
            {/* Main Remote Video Element */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className='w-full h-full object-cover rounded-3xl'
            />

            {/* Fallback Display if peer not transmitting */}
            {!peerConnected && (
              <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-950 flex flex-col items-center justify-center text-center p-6 sm:p-8 z-10 space-y-3 sm:space-y-4'>
                <div className='w-20 h-20 sm:w-24 sm:h-24 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-2xl sm:text-3xl font-extrabold shadow-xl border-2 border-emerald-400/40'>
                  {peerDisplayName.charAt(0).toUpperCase()}
                </div>
                <h2 className='text-lg sm:text-xl font-bold text-white'>{peerDisplayName}</h2>
                <p className='text-xs text-emerald-400 font-semibold bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5'>
                  <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse' />
                  Waiting for peer video stream...
                </p>
              </div>
            )}

            {/* Local Stream PIP (Bottom Right, Responsive Size) */}
            <div className='absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-28 h-20 sm:w-36 sm:h-26 md:w-44 md:h-32 bg-gray-950 border-2 border-emerald-500/70 rounded-2xl overflow-hidden shadow-2xl z-20 group'>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className='w-full h-full object-cover'
              />
              <span className='absolute bottom-1 left-1.5 sm:left-2 bg-black/70 text-[9px] sm:text-[10px] text-white px-1.5 py-0.5 rounded font-mono truncate max-w-[90%]'>
                You ({myDisplayName})
                {isScreenSharing && ' (Screen)'}
              </span>
            </div>
          </div>

          {/* Media Toolbar */}
          <div className='bg-gray-900 border border-gray-800 rounded-2xl p-2.5 sm:p-3 flex items-center justify-center gap-2 sm:gap-4 shadow-lg flex-wrap'>
            {/* Mic Toggle */}
            <button
              onClick={handleToggleMic}
              className={`p-3 sm:p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center ${
                isMicOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <BsMic size={18} /> : <BsMicMute size={18} />}
            </button>

            {/* Video Camera Toggle */}
            <button
              onClick={handleToggleVideo}
              className={`p-3 sm:p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center ${
                isVideoOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-rose-600 text-white'
              }`}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? <BsCameraVideo size={18} /> : <BsCameraVideoOff size={18} />}
            </button>

            {/* Flip Camera (Mobile Only) */}
            {isMobileDevice && (
              <button
                onClick={handleFlipCamera}
                className='p-3 sm:p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white'
                title={`Flip Camera (Current: ${facingMode})`}
              >
                <BsArrowRepeat size={18} className='rotate-90 text-emerald-400' />
              </button>
            )}

            {/* Screen Share (Desktop Only) */}
            {supportsDisplayMedia && (
              <button
                onClick={handleToggleScreenShare}
                className={`p-3 sm:p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center ${
                  isScreenSharing ? 'bg-emerald-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
                title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
              >
                <BsDisplay size={18} />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={handleToggleFullscreen}
              className='p-3 sm:p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white'
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <BsFullscreenExit size={18} /> : <BsFullscreen size={18} />}
            </button>

            {/* Quick Chat Shortcut on Mobile */}
            <button
              onClick={() => {
                setMobileActiveView('tools')
                setActiveRightTab('chat')
                setUnreadChatCount(0)
              }}
              className='lg:hidden p-3 sm:p-3.5 rounded-2xl cursor-pointer transition flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white relative'
              title='Open Chat'
            >
              <BsChatDots size={18} />
              {unreadChatCount > 0 && (
                <span className='absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping' />
              )}
            </button>
          </div>
        </div>

        {/* Right Sidebar Tabs (Always shown on Desktop; conditionally shown on Mobile) */}
        <div className={`bg-gray-900 border border-gray-800 rounded-3xl flex flex-col justify-between overflow-hidden shadow-xl min-h-[480px] lg:h-auto ${
          mobileActiveView === 'video' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Tab Navigation */}
          <div className='bg-gray-950 p-2 border-b border-gray-800 flex items-center gap-1 text-[11px] font-semibold overflow-x-auto'>
            {[
              { id: 'chat', label: 'Chat', icon: <BsChatDots size={13} />, badge: unreadChatCount },
              ...(isInterviewer ? [
                { id: 'ai_co_interviewer', label: 'AI Assist', icon: <BsRobot size={13} /> },
                { id: 'feedback', label: 'Evaluate', icon: <BsStarFill size={13} /> },
              ] : []),
              { id: 'resume', label: 'Info', icon: <BsFileEarmarkText size={13} /> },
            ].map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveRightTab(tab.id)
                  if (tab.id === 'chat') setUnreadChatCount(0)
                }}
                className={`flex-1 py-2 px-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 whitespace-nowrap relative ${
                  activeRightTab === tab.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className='ml-1 px-1.5 py-0.2 bg-white text-emerald-900 rounded-full font-bold text-[9px]'>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Views */}
          <div className='flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 text-xs'>
            {/* 1. CHAT TAB (TWO-WAY LEFT/RIGHT SYSTEM) */}
            {activeRightTab === 'chat' && (
              <div className='flex flex-col h-full justify-between space-y-3 min-h-[400px]'>
                <div className='space-y-2.5 overflow-y-auto max-h-[380px] sm:max-h-[420px] pr-1 flex flex-col'>
                  {chatMessages.length === 0 && (
                    <div className='text-center py-8 text-gray-500 space-y-2'>
                      <BsChatDots size={28} className='mx-auto text-gray-600' />
                      <p className='text-xs font-semibold text-gray-400'>No messages yet</p>
                      <p className='text-[11px] text-gray-500'>Send a message to introduce yourself or share links.</p>
                    </div>
                  )}

                  {chatMessages.map((msg: any, i: number) => {
                    const msgKey = msg._id || msg.id || i
                    const isSystem = msg.type === 'system' || msg.senderRole === 'system' || msg.senderName === 'System'

                    // System Notice (Centered Pill)
                    if (isSystem) {
                      return (
                        <div key={msgKey} className='flex justify-center my-1.5 px-2'>
                          <div className='bg-gray-950/90 text-gray-400 border border-gray-800 text-[11px] px-3.5 py-1 rounded-full text-center max-w-xs sm:max-w-md shadow-xs font-medium flex items-center gap-1.5'>
                            <BsShieldCheck className='text-emerald-400 shrink-0' size={12} />
                            <span>{msg.message}</span>
                          </div>
                        </div>
                      )
                    }

                    // Strict Two-Way Sender/Receiver Determination
                    const isMyMessage = Boolean(
                      // 1. Direct ID Match
                      (msg.senderId && currentUserId && String(msg.senderId) === String(currentUserId)) ||
                      // 2. Direct Role Match in 1-on-1 session
                      (msg.senderRole && (
                        (isInterviewer && msg.senderRole === 'interviewer') ||
                        (!isInterviewer && (msg.senderRole === 'learner' || msg.senderRole === 'candidate'))
                      )) ||
                      // 3. Name Match
                      (msg.senderName && myDisplayName && msg.senderName.trim().toLowerCase() === myDisplayName.trim().toLowerCase())
                    )

                    const isMsgInterviewer = msg.senderRole === 'interviewer'
                    const displayRoleLabel = isMsgInterviewer ? 'Interviewer' : 'Candidate'
                    const displaySenderName = isMyMessage ? 'You' : (msg.senderName || displayRoleLabel)
                    const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'

                    return (
                      <div
                        key={msgKey}
                        className={`w-full flex my-1.5 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[78%] px-3.5 py-2.5 rounded-2xl shadow-md text-xs space-y-1 transition-all ${
                            isMyMessage
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-emerald-950/40 ml-auto'
                              : 'bg-gray-800/95 text-gray-100 border border-gray-700/80 rounded-tl-xs shadow-black/20 mr-auto'
                          }`}
                        >
                          {/* Message Header */}
                          <div className={`flex items-center justify-between gap-3 text-[10px] pb-1 border-b ${
                            isMyMessage ? 'border-white/20 text-white/90' : 'border-gray-700 text-gray-300'
                          }`}>
                            <span className='font-bold flex items-center gap-1.5'>
                              {isMyMessage ? (
                                <span className='flex items-center gap-1 text-white font-extrabold'>
                                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse' />
                                  <span>You</span>
                                </span>
                              ) : (
                                <>
                                  <span className='text-gray-200'>{displaySenderName}</span>
                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                    isMsgInterviewer 
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                      : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                                  }`}>
                                    {displayRoleLabel}
                                  </span>
                                </>
                              )}
                            </span>
                            <span className={`text-[9px] font-mono ${isMyMessage ? 'text-white/75' : 'text-gray-400'}`}>
                              {timeStr}
                            </span>
                          </div>

                          {/* Message Content */}
                          <p className={`leading-relaxed font-normal whitespace-pre-wrap pt-0.5 break-words ${
                            isMyMessage ? 'text-white' : 'text-gray-200'
                          }`}>
                            {msg.message}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Typing Indicator */}
                {remoteTyping && (
                  <p className='text-[10px] text-emerald-400 italic animate-pulse flex items-center gap-1.5'>
                    <span className='w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping' />
                    {peerDisplayName} is typing...
                  </p>
                )}

                {/* Chat Input Form */}
                <form onSubmit={handleSendMessage} className='flex items-center gap-2 pt-2 border-t border-gray-800'>
                  <input
                    type='text'
                    value={chatInput}
                    onChange={handleChatInputChange}
                    placeholder={`Message ${peerDisplayName}...`}
                    className='flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-gray-500'
                  />
                  <button 
                    type='submit' 
                    disabled={!chatInput.trim()}
                    className='bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-xl cursor-pointer transition shadow-sm'
                  >
                    <BsSend size={13} />
                  </button>
                </form>
              </div>
            )}

            {/* 2. AI CO-INTERVIEWER ASSIST TAB (Interviewer Only) */}
            {activeRightTab === 'ai_co_interviewer' && isInterviewer && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between border-b border-gray-800 pb-2'>
                  <h4 className='font-bold text-white text-sm flex items-center gap-1.5'>
                    <BsRobot className='text-emerald-400' size={16} /> AI Co-Interviewer
                  </h4>
                  <button
                    onClick={handleFetchAiAssist}
                    disabled={loadingAiAssist}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-sm'
                  >
                    {loadingAiAssist ? 'Analyzing...' : 'Analyze Session'}
                  </button>
                </div>

                {aiAssistData ? (
                  <div className='space-y-3 text-xs'>
                    <div className='bg-gray-950 p-3.5 rounded-2xl border border-gray-800 space-y-2'>
                      <p className='font-bold text-emerald-400 flex items-center gap-1'>
                        <BsLightbulb size={13} /> Recommended Follow-up Questions:
                      </p>
                      <ul className='list-disc list-inside text-gray-300 space-y-1.5 pl-1'>
                        {(aiAssistData.followUpQuestions || []).map((q: string, idx: number) => (
                          <li key={idx} className='leading-relaxed'>{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div className='bg-gray-950 p-3.5 rounded-2xl border border-gray-800 space-y-1.5'>
                      <p className='font-bold text-purple-400'>Detected Competencies:</p>
                      <p className='text-gray-300 leading-relaxed'>
                        <span className='font-semibold text-gray-200'>Technical:</span> {(aiAssistData.technicalSkillDetected || []).join(', ') || 'General Technical Knowledge'}
                        <br />
                        <span className='font-semibold text-gray-200'>Soft Skills:</span> {(aiAssistData.softSkillDetected || []).join(', ') || 'Professional Communication'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center space-y-2 text-gray-400'>
                    <BsLightbulb size={24} className='mx-auto text-amber-400' />
                    <p className='font-bold text-white text-xs'>AI Assistant Ready</p>
                    <p className='text-[11px] leading-relaxed'>
                      Click "Analyze Session" to analyze the chat transcript and suggest probing follow-up technical questions.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. EVALUATION TAB (Interviewer Only) */}
            {activeRightTab === 'feedback' && isInterviewer && (
              <div className='space-y-4'>
                <h4 className='font-bold text-white text-sm border-b border-gray-800 pb-2'>Candidate Evaluation</h4>

                {feedbackSubmitted ? (
                  <div className='bg-emerald-950/80 border border-emerald-800 rounded-2xl p-5 text-center text-emerald-300 space-y-3'>
                    <BsCheckCircleFill size={28} className='mx-auto text-emerald-400' />
                    <p className='font-bold text-sm'>Evaluation Submitted Successfully!</p>

                    {aiSummary && (
                      <div className='bg-gray-950 p-4 rounded-xl text-left border border-gray-800 space-y-2 text-xs text-gray-300'>
                        <p className='font-bold text-emerald-400'>AI Recommendation: {aiSummary.hiringRecommendation}</p>
                        <p className='font-semibold text-white'>Strengths:</p>
                        <ul className='list-disc list-inside text-gray-400'>
                          {(aiSummary.strengths || []).map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                        {aiSummary.weaknesses?.length > 0 && (
                          <>
                            <p className='font-semibold text-white'>Weaknesses:</p>
                            <ul className='list-disc list-inside text-gray-400'>
                              {aiSummary.weaknesses.map((w: string, idx: number) => (
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
                        <input type='number' min={1} max={10} value={overallRating} onChange={(e) => setOverallRating(Number(e.target.value))}
                          className='w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold' />
                      </div>
                      <div>
                        <label className='text-gray-400 font-semibold block mb-1'>Technical (1-10)</label>
                        <input type='number' min={1} max={10} value={techScore} onChange={(e) => setTechScore(Number(e.target.value))}
                          className='w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold' />
                      </div>
                      <div>
                        <label className='text-gray-400 font-semibold block mb-1'>Communication (1-10)</label>
                        <input type='number' min={1} max={10} value={commScore} onChange={(e) => setCommScore(Number(e.target.value))}
                          className='w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold' />
                      </div>
                      <div>
                        <label className='text-gray-400 font-semibold block mb-1'>Problem Solving (1-10)</label>
                        <input type='number' min={1} max={10} value={psScore} onChange={(e) => setPsScore(Number(e.target.value))}
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

                    {/* Strengths */}
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

                    {/* Weaknesses */}
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

                    {/* Suggestions */}
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
                      className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer transition shadow-sm'
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Evaluation & Generate AI Report'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* 4. INFO TAB */}
            {activeRightTab === 'resume' && (
              <div className='space-y-3 text-gray-300'>
                <h4 className='font-bold text-white text-sm border-b border-gray-800 pb-2'>Session Information</h4>
                <div className='bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-2 text-xs'>
                  <p className='font-bold text-emerald-400'>Session Details</p>
                  <p className='text-gray-400'>Interviewer: <span className='text-white font-semibold'>{mentorName}</span></p>
                  <p className='text-gray-400'>Candidate: <span className='text-white font-semibold'>{candidateName}</span></p>
                  <p className='text-gray-400'>Date: {booking?.date || 'Today'}</p>
                  <p className='text-gray-400'>Time: {booking?.timeSlot || 'Scheduled'}</p>
                  {booking?.notes && (
                    <p className='text-gray-400'>Notes: {booking.notes}</p>
                  )}
                </div>

                <div className='bg-gray-950 border border-gray-800 rounded-2xl p-4 space-y-2 text-xs'>
                  <p className='font-bold text-emerald-400'>Your Profile</p>
                  <p className='text-gray-400'>Connected As: <span className='text-white font-semibold'>{myDisplayName}</span></p>
                  <p className='text-gray-400'>Role: <span className='text-emerald-400 font-semibold capitalize'>{isInterviewer ? 'Interviewer' : 'Candidate'}</span></p>
                  <p className='text-gray-400'>Device: {isMobileDevice ? 'Mobile / Touch' : 'Laptop / Desktop'}</p>
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
