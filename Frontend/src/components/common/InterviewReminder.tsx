import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { BsBroadcast, BsCameraVideo, BsClock, BsX, BsCalendar3, BsPersonCheck } from 'react-icons/bs';
import { ServerUrl } from '../../App';

export const parseInterviewDateTime = (dateStr: string, timeStr?: string): Date | null => {
  if (!dateStr) return null;
  try {
    let cleanDateStr = dateStr.replace(/ at /i, ' ').trim();
    let combinedStr = cleanDateStr;
    if (timeStr && !cleanDateStr.toLowerCase().includes('pm') && !cleanDateStr.toLowerCase().includes('am')) {
      combinedStr = `${cleanDateStr} ${timeStr}`;
    }
    let parsedDate = new Date(combinedStr);
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date(cleanDateStr);
      if (isNaN(parsedDate.getTime())) return null;
      if (timeStr) {
        let hours = 0, minutes = 0;
        const pmMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (pmMatch) {
          hours = parseInt(pmMatch[1], 10);
          minutes = parseInt(pmMatch[2], 10);
          const ampm = pmMatch[3] ? pmMatch[3].toUpperCase() : null;
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
        parsedDate.setHours(hours, minutes, 0, 0);
      }
    }
    return parsedDate;
  } catch {
    return null;
  }
};

const InterviewReminder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((state: any) => state.user);
  const user = userData?.user || userData;

  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [minutesRemaining, setMinutesRemaining] = useState<number | null>(null);
  const [dismissedBookingId, setDismissedBookingId] = useState<string | null>(null);

  const isCurrentlyInRoom = location.pathname.startsWith('/interview/room/');

  const checkUpcomingInterviews = async () => {
    if (!user || isCurrentlyInRoom) return;

    try {
      const res = await axios.get(`${ServerUrl}/api/human-interview/list`, { withCredentials: true });
      const bookings = Array.isArray(res.data) ? res.data : [];

      const now = new Date();
      let alertTarget: any = null;
      let minDiff: number | null = null;

      for (const b of bookings) {
        if (b.status === 'Cancelled' || b.status === 'Completed') continue;

        if (b.status === 'Live') {
          alertTarget = b;
          minDiff = 0;
          break;
        }

        const scheduledTime = parseInterviewDateTime(b.date, b.timeSlot);
        if (!scheduledTime) continue;

        const diffMs = scheduledTime.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes <= 10 && diffMinutes >= -45) {
          alertTarget = b;
          minDiff = diffMinutes;
          break;
        }
      }

      if (alertTarget && (alertTarget.id || alertTarget._id) !== dismissedBookingId) {
        setUpcomingBooking(alertTarget);
        setMinutesRemaining(minDiff);
      } else {
        setUpcomingBooking(null);
        setMinutesRemaining(null);
      }
    } catch (err) {
      console.error('Check upcoming interviews error:', err);
    }
  };

  useEffect(() => {
    checkUpcomingInterviews();
    const interval = setInterval(checkUpcomingInterviews, 30000);
    return () => clearInterval(interval);
  }, [userData, location.pathname, dismissedBookingId]);

  if (!upcomingBooking || isCurrentlyInRoom) return null;

  const bookingId = upcomingBooking.id || upcomingBooking._id || upcomingBooking.roomId;
  const interviewerName =
    upcomingBooking.mentor?.name ||
    upcomingBooking.mentorId?.name ||
    upcomingBooking.slot?.interviewerName ||
    'Senior Tech Interviewer';
  const roleName = upcomingBooking.slot?.role || upcomingBooking.notes || 'Technical Mock Interview';
  const dateStr = upcomingBooking.date || 'Today';
  const timeStr = upcomingBooking.timeSlot || 'Scheduled Time';
  const durationStr = upcomingBooking.slot?.duration || '45 Minutes';

  const handleJoin = () => {
    navigate(`/interview/room/${upcomingBooking.id || upcomingBooking._id}`);
  };

  const handleDismiss = () => {
    setDismissedBookingId(bookingId);
    setUpcomingBooking(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4"
      >
        <div className="bg-gray-900 dark:bg-gray-950 text-white rounded-3xl p-6 shadow-2xl border border-emerald-500/40 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse" />

          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white rounded-full transition cursor-pointer"
            title="Dismiss notification"
          >
            <BsX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 flex-shrink-0 animate-bounce">
              <BsBroadcast size={24} />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-gray-950 px-2.5 py-0.5 rounded-full">
                  {minutesRemaining !== null && minutesRemaining <= 0
                    ? 'Interview In Progress'
                    : `Starts in ${minutesRemaining} mins`}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <BsClock size={12} /> {timeStr}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-white tracking-tight leading-snug">
                Your Human Mock Interview Starts Soon!
              </h4>

              <div className="space-y-1 text-xs text-gray-300 bg-gray-800/80 rounded-2xl p-3 border border-gray-700/80">
                <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <BsPersonCheck size={14} className="text-emerald-400" />
                  <span>Interviewer: {interviewerName}</span>
                </p>
                <p className="flex items-center gap-1.5 text-gray-300">
                  <span className="font-bold text-gray-400">Role:</span> {roleName}
                </p>
                <p className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                  <BsCalendar3 size={11} /> {dateStr} • {durationStr}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleJoin}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-gray-950 px-4 py-2.5 rounded-xl text-xs font-black cursor-pointer transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <BsCameraVideo size={14} />
                  <span>Join Interview Now</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2.5 text-xs text-gray-400 hover:text-white font-semibold cursor-pointer transition"
                >
                  Remind Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InterviewReminder;
