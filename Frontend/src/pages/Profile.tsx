import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import axios from 'axios';
import { ServerUrl } from '../App';
import {
  BsEnvelope,
  BsCoin,
  BsTrophy,
  BsMic,
  BsFileEarmark,
  BsCheckCircleFill,
  BsStarFill,
  BsLightning,
  BsGraphUp,
  BsLayers,
  BsBook,
  BsCalendar3,
  BsArrowClockwise,
  BsExclamationTriangle,
} from 'react-icons/bs';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  type: string;
  unlocked: boolean;
}

interface ProfileStatistics {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  hasResume: boolean;
  resumeATSScore: number | null;
  credits: number;
}

interface ProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    credits: number;
    avatarUrl?: string;
  };
  statistics: ProfileStatistics;
  achievements: Achievement[];
  unlockedCount: number;
  totalAchievements: number;
}

function Profile() {
  const { userData } = useSelector((state: any) => state.user);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${ServerUrl}/api/user/profile`, { withCredentials: true });
      if (res.data?.success) {
        setProfileData(res.data);
      } else {
        setError(res.data?.message || 'Unable to load profile data.');
      }
    } catch (e: any) {
      console.error('Fetch profile error:', e);
      setError(e.response?.data?.message || 'Unable to load profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, userData?.id, userData?.email]);

  const user = profileData?.user || userData || { name: 'User', email: '', credits: 0 };
  const stats = profileData?.statistics;
  const achievements = profileData?.achievements || [];
  const unlockedCount = profileData?.unlockedCount ?? achievements.filter((a) => a.unlocked).length;

  const renderAchievementIcon = (type: string) => {
    switch (type) {
      case 'mic':
        return <BsMic size={16} />;
      case 'lightning':
        return <BsLightning size={16} />;
      case 'file':
        return <BsFileEarmark size={16} />;
      case 'trophy':
        return <BsTrophy size={16} />;
      case 'layers':
        return <BsLayers size={16} />;
      case 'calendar':
        return <BsCalendar3 size={16} />;
      default:
        return <BsStarFill size={16} />;
    }
  };

  const getAchievementStyle = (type: string, unlocked: boolean) => {
    if (!unlocked) {
      return 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-800 opacity-60';
    }
    switch (type) {
      case 'mic':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'lightning':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'file':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      case 'trophy':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
      case 'layers':
        return 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60';
      case 'calendar':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    }
  };

  if (loading) {
    return (
      <div className="py-6 space-y-8 animate-pulse">
        <div className="h-8 w-36 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        <div className="h-44 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-3xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-3xl" />
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-200 dark:border-rose-800">
          <BsExclamationTriangle size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Unable to load profile data.</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">{error}</p>
        </div>
        <button
          onClick={fetchProfile}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition shadow-md shadow-emerald-600/20"
        >
          <BsArrowClockwise size={16} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Profile
        </h1>
        <button
          onClick={fetchProfile}
          title="Refresh Profile"
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <BsArrowClockwise size={18} />
        </button>
      </div>

      {/* Top Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-colors duration-300"
      >
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-3xl object-cover shadow-lg shadow-emerald-600/20 flex-shrink-0 border-2 border-emerald-500"
          />
        ) : (
          <div className="w-24 h-24 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-emerald-600/20 flex-shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5 justify-center sm:justify-start mt-1">
              <BsEnvelope size={13} />
              <span>{user.email}</span>
            </p>
          </div>

          {/* Quick Stat Pills */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start pt-2">
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-4 py-2 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 inline-flex items-center gap-1.5">
              <BsCoin size={13} />
              {user.credits ?? 0} Credits
            </span>
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-4 py-2 rounded-full border border-blue-200/80 dark:border-blue-800/60 inline-flex items-center gap-1.5">
              <BsMic size={13} />
              {stats?.totalInterviews ?? 0} Interviews
            </span>
            <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold px-4 py-2 rounded-full border border-purple-200/80 dark:border-purple-800/60 inline-flex items-center gap-1.5">
              <BsStarFill size={13} />
              {unlockedCount} / {achievements.length || 6} Achievements
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Interviews',
            value: stats?.totalInterviews ?? 0,
            sub: (stats?.completedInterviews ?? 0) > 0 ? `Completed: ${stats?.completedInterviews}` : 'No interviews completed yet',
            icon: <BsMic size={18} />,
            color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
          },
          {
            label: 'Average Score',
            value: (stats?.completedInterviews ?? 0) > 0 ? `${stats?.averageScore}%` : 'N/A',
            sub: (stats?.completedInterviews ?? 0) > 0 ? 'AI & Live Mock Interviews' : 'No interviews completed yet',
            icon: <BsGraphUp size={18} />,
            color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
          },
          {
            label: 'Resume ATS Score',
            value: stats?.hasResume && stats?.resumeATSScore !== null ? `${stats?.resumeATSScore}%` : 'N/A',
            sub: stats?.hasResume ? 'Resume Analyzed' : 'No resume analyzed yet',
            icon: <BsFileEarmark size={18} />,
            color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
          },
          {
            label: 'Available Credits',
            value: user.credits ?? 0,
            sub: 'HireReady.AI Balance',
            icon: <BsBook size={18} />,
            color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/40',
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl p-5 shadow-xs space-y-2 transition-colors duration-300"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-400 font-semibold uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-6 transition-colors duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BsTrophy size={18} className="text-amber-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Achievements</h3>
          </div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {unlockedCount} of {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach, i) => {
            const style = getAchievementStyle(ach.type, ach.unlocked);
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${style}`}
              >
                <div className="mt-0.5 flex-shrink-0">{renderAchievementIcon(ach.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{ach.title}</p>
                  <p className="text-xs opacity-80 mt-0.5 leading-snug">{ach.desc}</p>
                </div>
                {ach.unlocked ? (
                  <BsCheckCircleFill size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-400 border border-gray-300 dark:border-gray-700 px-1.5 py-0.5 rounded flex-shrink-0">
                    Locked
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;

