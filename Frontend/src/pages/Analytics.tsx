import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ServerUrl } from '../App';
import {
  BsCalendar3,
  BsClock,
  BsLightning,
  BsTrophy,
  BsStarFill,
  BsCheckCircleFill,
  BsArrowUpRight,
  BsBarChart,
  BsMic,
  BsArrowRight,
  BsChevronRight,
  BsExclamationTriangle,
} from 'react-icons/bs';

interface InterviewItem {
  id: string;
  role: string;
  experience?: string;
  mode?: string;
  finalScore?: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

function Analytics() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${ServerUrl}/api/user/dashboard-summary`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setSummary(res.data);
        } else {
          setError(res.data?.message || 'Unable to load analytics data.');
        }
      } catch (err: any) {
        console.error('Failed to load analytics data:', err);
        setError(err.response?.data?.message || 'Unable to load interview history.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = summary?.stats || {};
  const totalAI = stats?.aiInterviews?.total || 0;
  const completedAI = stats?.aiInterviews?.completed || 0;
  const avgAIScore = stats?.aiInterviews?.avgScore || 0;

  const totalHuman = stats?.humanInterviews?.total || 0;
  const completedHuman = stats?.humanInterviews?.completed || 0;

  const totalInterviews = totalAI + totalHuman;
  const completedInterviews = completedAI + completedHuman;

  const totalQuizzes = stats?.quizzes?.completed || 0;
  const quizAvg = stats?.quizzes?.avgScore || 0;

  const totalCards = stats?.flashcards?.totalCards || 0;
  const masteredCards = stats?.flashcards?.masteredCards || 0;

  const resumeScore = stats?.resumeScore || 0;
  const hasResume = stats?.hasResume || false;

  const readiness = stats?.placementReadiness || 0;

  // Recent interviews list from backend dashboard-summary
  const recentInterviews: InterviewItem[] = summary?.recentInterviews || [];

  const achievements = [
    { title: 'First AI Interview', unlocked: completedAI >= 1 },
    { title: '5 AI Interviews', unlocked: completedAI >= 5 },
    { title: 'Resume ATS Pro', unlocked: hasResume && resumeScore >= 70 },
    { title: 'Quiz Practitioner', unlocked: totalQuizzes >= 3 },
    { title: '10 Flashcards Mastered', unlocked: masteredCards >= 10 },
    { title: 'Placement Ready (80%+)', unlocked: readiness >= 80 },
  ];

  const topStats = [
    {
      label: 'Completed Interviews',
      value: `${completedInterviews}`,
      change: `${avgAIScore}% AI Avg Score`,
      icon: <BsBarChart size={18} />,
      color: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border-blue-100 dark:border-blue-800/60',
    },
    {
      label: 'Placement Readiness',
      value: `${readiness}%`,
      change: readiness >= 70 ? 'High Readiness' : 'Building Skills',
      icon: <BsTrophy size={18} />,
      color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/60',
    },
    {
      label: 'Resume Score',
      value: hasResume ? `${resumeScore}%` : 'N/A',
      change: hasResume ? 'ATS Verified' : 'Needs Analysis',
      icon: <BsLightning size={18} />,
      color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-100 dark:border-amber-800/60',
    },
    {
      label: 'Study Mastery',
      value: totalCards > 0 ? `${masteredCards}/${totalCards}` : `${totalQuizzes} Quizzes`,
      change: quizAvg > 0 ? `${quizAvg}% Quiz Avg` : 'Active Learner',
      icon: <BsCalendar3 size={18} />,
      color: 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border-purple-100 dark:border-purple-800/60',
    },
  ];

  const formatScoreDisplay = (score?: number) => {
    if (score === undefined || score === null) return '0%';
    if (score <= 10 && score > 0) return `${Math.round(score * 10)}%`;
    return `${Math.round(score)}%`;
  };

  if (loading) {
    return (
      <div className='py-6 space-y-8 animate-pulse'>
        <div className='h-12 bg-gray-200 dark:bg-gray-800 rounded-xl w-1/3' />
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-32 bg-gray-200 dark:bg-gray-800 rounded-3xl' />
          ))}
        </div>
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl' />
          <div className='h-48 bg-gray-200 dark:bg-gray-800 rounded-3xl' />
        </div>
        <div className='h-36 bg-gray-200 dark:bg-gray-800 rounded-3xl' />
        <div className='h-64 bg-gray-200 dark:bg-gray-800 rounded-3xl' />
      </div>
    );
  }

  return (
    <div className='py-2 space-y-8'>
      {/* Page Header */}
      <div>
        <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
          Analytics & Real Progress
        </h1>
        <p className='text-gray-500 dark:text-gray-400 text-sm mt-1'>
          Real-time performance metrics computed from your actual mock interviews, quizzes, and resume ATS evaluation.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
        {topStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-5 shadow-xs space-y-2 transition-colors duration-300'
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${stat.color}`}>
              {stat.icon}
            </div>
            <p className='text-xs text-gray-400 dark:text-gray-400 font-semibold uppercase tracking-wider'>{stat.label}</p>
            <p className='text-2xl font-extrabold text-gray-900 dark:text-white'>{stat.value}</p>
            <p className='text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1'>
              <BsArrowUpRight size={10} />
              {stat.change}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Overview Cards */}
      <div className='grid md:grid-cols-2 gap-6'>
        {/* AI Interview Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-7 shadow-sm space-y-5 transition-colors duration-300'
        >
          <div className='flex items-center justify-between'>
            <h3 className='font-bold text-gray-900 dark:text-white text-base'>AI Mock Interview Metrics</h3>
            <span className='text-xs text-emerald-600 dark:text-emerald-400 font-bold'>Real Database Data</span>
          </div>

          <div className='space-y-4'>
            <div>
              <div className='flex justify-between text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300'>
                <span>Completion Rate ({completedAI} / {totalAI || 1})</span>
                <span>{totalAI > 0 ? Math.round((completedAI / totalAI) * 100) : 0}%</span>
              </div>
              <div className='w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-emerald-500 rounded-full transition-all duration-500'
                  style={{ width: `${totalAI > 0 ? Math.round((completedAI / totalAI) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className='flex justify-between text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300'>
                <span>Average Interview Score</span>
                <span>{avgAIScore}%</span>
              </div>
              <div className='w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-blue-500 rounded-full transition-all duration-500'
                  style={{ width: `${avgAIScore}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Study & Quiz Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-7 shadow-sm space-y-5 transition-colors duration-300'
        >
          <div className='flex items-center justify-between'>
            <h3 className='font-bold text-gray-900 dark:text-white text-base'>Study & Flashcard Mastery</h3>
            <span className='text-xs text-amber-500 font-bold'>Interactive Progress</span>
          </div>

          <div className='space-y-4'>
            <div>
              <div className='flex justify-between text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300'>
                <span>Flashcards Mastered ({masteredCards} / {totalCards || 1})</span>
                <span>{totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%</span>
              </div>
              <div className='w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-amber-500 rounded-full transition-all duration-500'
                  style={{ width: `${totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className='flex justify-between text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300'>
                <span>Quiz Average Score</span>
                <span>{quizAvg}%</span>
              </div>
              <div className='w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-purple-500 rounded-full transition-all duration-500'
                  style={{ width: `${quizAvg}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Achievements Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-8 shadow-sm space-y-5 transition-colors duration-300'
      >
        <div className='flex items-center gap-2'>
          <BsTrophy size={18} className='text-amber-500' />
          <h3 className='font-bold text-gray-900 dark:text-white text-lg'>Real Achievements Unlocked</h3>
        </div>
        <div className='flex flex-wrap gap-3'>
          {achievements.map((a, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border ${
                a.unlocked
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 opacity-70'
              }`}
            >
              {a.unlocked ? <BsCheckCircleFill size={12} className='text-emerald-500' /> : <BsStarFill size={12} className='text-gray-300 dark:text-gray-600' />}
              {a.title}
            </span>
          ))}
        </div>
      </motion.div>

      {/* NEW: Interview History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-7 md:p-8 shadow-sm space-y-6 transition-colors duration-300'
      >
        {/* Section Header */}
        <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-4'>
          <div>
            <h3 className='font-extrabold text-gray-900 dark:text-white text-lg tracking-tight flex items-center gap-2.5'>
              <BsMic size={18} className='text-emerald-600 dark:text-emerald-400' />
              Interview History
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
              Your recent interview performance & evaluation history
            </p>
          </div>
          <button
            onClick={() => navigate('/history', { state: { from: '/analytics' } })}
            className='text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition'
          >
            <span>View All</span>
            <BsArrowRight size={13} />
          </button>
        </div>

        {/* Content Area: Error, Empty, or List */}
        {error && recentInterviews.length === 0 ? (
          <div className='p-6 text-center text-sm text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center justify-center gap-2'>
            <BsExclamationTriangle size={16} />
            <span>Unable to load interview history.</span>
          </div>
        ) : recentInterviews.length === 0 ? (
          <div className='py-10 px-4 text-center bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 rounded-2xl space-y-3'>
            <div className='w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200/80 dark:border-emerald-800/60'>
              <BsMic size={22} />
            </div>
            <div>
              <h4 className='font-bold text-gray-900 dark:text-white text-sm'>No interviews completed yet</h4>
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto'>
                Complete your first AI mock interview to start tracking your performance and detailed evaluation metrics.
              </p>
            </div>
            <button
              onClick={() => navigate('/interview')}
              className='inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold text-xs cursor-pointer transition shadow-md shadow-emerald-600/20'
            >
              <BsLightning size={14} />
              <span>Start AI Mock Interview</span>
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid gap-3.5'>
              {recentInterviews.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    navigate(`/report/${item.id}`, {
                      state: { from: '/analytics', previousFrom: '/analytics' },
                    })
                  }
                  className='bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-4 md:p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 group'
                >
                  <div className='flex items-start sm:items-center gap-3.5'>
                    <div className='w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60 flex-shrink-0 group-hover:scale-105 transition-transform'>
                      <BsMic size={18} />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'>
                        {item.role || 'AI Mock Interview'}
                      </h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium'>
                        {item.experience || 'Candidate'} • {item.mode || 'Technical'}
                      </p>
                      <p className='text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1'>
                        <BsClock size={10} />
                        <span>{new Date(item.createdAt || item.updatedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 dark:border-gray-800/60'>
                    {/* Score */}
                    <div className='text-left sm:text-right'>
                      <span className='text-xs text-gray-400 dark:text-gray-500 font-medium block text-[10px] uppercase tracking-wider'>
                        Score
                      </span>
                      <span className='text-base font-extrabold text-emerald-600 dark:text-emerald-400'>
                        {formatScoreDisplay(item.finalScore)}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                        item.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                      }`}
                    >
                      {item.status === 'completed' ? 'Completed' : item.status || 'In Progress'}
                    </span>

                    {/* View Report Button */}
                    <div className='flex items-center text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors pl-2'>
                      <span>Report</span>
                      <BsChevronRight size={12} className='ml-1 group-hover:translate-x-1 transition-transform' />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom View Full History Link */}
            <div className='pt-2 text-center'>
              <button
                onClick={() => navigate('/history', { state: { from: '/analytics' } })}
                className='text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1.5 cursor-pointer transition hover:underline'
              >
                <span>View Full Interview History</span>
                <BsArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Analytics;


