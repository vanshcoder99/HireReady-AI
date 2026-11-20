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
  BsShieldLock,
  BsLock,
  BsEye,
  BsEyeSlash,
  BsAt,
  BsCheckCircle,
  BsPersonBadge,
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
    username?: string;
    email: string;
    role?: string;
    credits: number;
    avatarUrl?: string;
    hasPassword?: boolean;
    createdAt?: string;
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

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // If user has an existing password, enforce entering the older password
    if (user.hasPassword !== false && !oldPassword) {
      setPasswordError('Please enter your current / older password');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await axios.post(
        `${ServerUrl}/api/user/change-password`,
        {
          oldPassword: oldPassword || undefined,
          newPassword,
        },
        { withCredentials: true }
      );

      setPasswordSuccess(res.data?.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      fetchProfile();
    } catch (err: any) {
      console.error('Change password error:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

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

  const memberSinceText = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className="py-2 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your personal profile, account credentials, and review performance statistics.
          </p>
        </div>
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
        className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 transition-colors duration-300"
      >
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-3xl object-cover shadow-lg shadow-emerald-600/20 flex-shrink-0 border-2 border-emerald-500"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-emerald-600/20 flex-shrink-0">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}

        <div className="flex-1 text-center sm:text-left space-y-3 w-full">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{user.name}</h2>
              {user.username && (
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 inline-flex items-center gap-1">
                  <BsAt size={13} className="text-emerald-500" />
                  {user.username}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <BsEnvelope size={13} className="text-gray-400" />
                <span>{user.email}</span>
              </span>

              <span className="inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />

              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <BsPersonBadge size={13} />
                <span>{user.role === 'interviewer' ? 'Tech Interviewer' : 'Learner / Candidate'}</span>
              </span>

              {memberSinceText && (
                <>
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <span>Member since {memberSinceText}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Stat Pills */}
          <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start pt-2">
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 inline-flex items-center gap-1.5">
              <BsCoin size={13} />
              {user.credits ?? 0} Credits
            </span>
            <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-200/80 dark:border-blue-800/60 inline-flex items-center gap-1.5">
              <BsMic size={13} />
              {stats?.totalInterviews ?? 0} Interviews
            </span>
            <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold px-3.5 py-1.5 rounded-full border border-purple-200/80 dark:border-purple-800/60 inline-flex items-center gap-1.5">
              <BsStarFill size={13} />
              {unlockedCount} / {achievements.length || 6} Achievements
            </span>
            <span
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${
                user.hasPassword
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              <BsShieldLock size={13} />
              {user.hasPassword ? 'Password Set' : 'Google Auth (No Password Set)'}
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
            sub:
              (stats?.completedInterviews ?? 0) > 0
                ? `Completed: ${stats?.completedInterviews}`
                : 'No interviews completed yet',
            icon: <BsMic size={18} />,
            color:
              'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
          },
          {
            label: 'Average Score',
            value: (stats?.completedInterviews ?? 0) > 0 ? `${stats?.averageScore}%` : 'N/A',
            sub: (stats?.completedInterviews ?? 0) > 0 ? 'AI & Live Mock Interviews' : 'No interviews completed yet',
            icon: <BsGraphUp size={18} />,
            color:
              'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
          },
          {
            label: 'Resume ATS Score',
            value: stats?.hasResume && stats?.resumeATSScore !== null ? `${stats?.resumeATSScore}%` : 'N/A',
            sub: stats?.hasResume ? 'Resume Analyzed' : 'No resume analyzed yet',
            icon: <BsFileEarmark size={18} />,
            color:
              'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
          },
          {
            label: 'Available Credits',
            value: user.credits ?? 0,
            sub: 'HireReady.AI Balance',
            icon: <BsBook size={18} />,
            color:
              'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/40',
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

      {/* SECURITY & CHANGE PASSWORD SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors duration-300"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <BsShieldLock size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Security & Password Management</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Change your account password by confirming your older password.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {user.hasPassword ? 'Password Authentication Active' : 'OAuth Only'}
          </span>
        </div>

        {/* Feedback messages */}
        {passwordSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <BsCheckCircle size={16} className="flex-shrink-0" />
            <span className="font-semibold">{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <BsExclamationTriangle size={16} className="flex-shrink-0" />
            <span className="font-semibold">{passwordError}</span>
          </div>
        )}

        {user.hasPassword === false && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <BsShieldLock size={16} className="flex-shrink-0 text-amber-600" />
            <span>
              Your account was created via Google without a password. You can set a new password below to also enable username & password login.
            </span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          {/* Older Password Field (only required if user already has a password) */}
          {user.hasPassword !== false && (
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">
                Older / Current Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsLock size={16} />
                </span>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required={user.hasPassword !== false}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showOldPassword ? <BsEyeSlash size={16} /> : <BsEye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">
                New Password <span className="text-gray-400 font-normal">(min 6 chars)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsLock size={16} />
                </span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showNewPassword ? <BsEyeSlash size={16} /> : <BsEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 block">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsShieldLock size={16} />
                </span>
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showConfirmNewPassword ? <BsEyeSlash size={16} /> : <BsEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center gap-2"
          >
            {passwordLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{user.hasPassword ? 'Update Password' : 'Set Password'}</span>
            )}
          </button>
        </form>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors duration-300"
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
