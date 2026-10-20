import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { ServerUrl } from '../App';
import {
  BsMic,
  BsClock,
  BsChevronRight,
  BsArrowLeft,
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

function InterviewHistory() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;

  useEffect(() => {
    const getMyInterviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await axios.get(`${ServerUrl}/api/interview/get-interview`, {
          withCredentials: true,
        });
        setInterviews(Array.isArray(result.data) ? result.data : []);
      } catch (err: any) {
        console.error('Fetch interview history error:', err);
        setError(err.response?.data?.message || 'Unable to load interview history.');
      } finally {
        setLoading(false);
      }
    };
    getMyInterviews();
  }, []);

  const handleBack = () => {
    if (from) {
      navigate(from);
    } else {
      navigate('/analytics');
    }
  };

  const formatScoreDisplay = (score?: number) => {
    if (score === undefined || score === null) return '0/10';
    if (score <= 10 && score > 0) return `${score}/10`;
    return `${Math.round(score)}%`;
  };

  if (loading) {
    return (
      <div className="py-4 space-y-6 animate-pulse max-w-5xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-64" />
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 space-y-8 max-w-5xl">
      {/* Top Header with Contextual Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-3 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 shadow-xs border border-gray-200/90 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer flex items-center justify-center flex-shrink-0"
          title={from === '/analytics' ? 'Back to Analytics' : 'Back'}
        >
          <BsArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Interview History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-xs md:text-sm">
            Track your past interview performance & evaluation history
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {error ? (
        <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-3xl space-y-3">
          <BsExclamationTriangle size={24} className="text-rose-500 mx-auto" />
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 p-12 rounded-3xl shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200/80 dark:border-emerald-800/60">
            <BsMic size={26} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">No interviews completed yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Start an AI mock interview to build your performance history and unlock detailed evaluation metrics.
            </p>
          </div>
          <button
            onClick={() => navigate('/interview')}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs cursor-pointer transition shadow-md shadow-emerald-600/20"
          >
            <span>Start AI Mock Interview</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviews.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                navigate(`/report/${item.id}`, {
                  state: { from: '/history', previousFrom: from },
                })
              }
              className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-xs hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <BsMic size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {item.role || 'AI Mock Interview'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                    {item.experience || 'Candidate'} • {item.mode || 'Technical'}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                    <BsClock size={11} />
                    <span>
                      {new Date(item.createdAt || item.updatedAt || Date.now()).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                {/* Score */}
                <div className="text-left sm:text-right">
                  <p className="text-lg md:text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatScoreDisplay(item.finalScore)}
                  </p>
                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    Overall Score
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize border ${
                    item.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                  }`}
                >
                  {item.status === 'completed' ? 'Completed' : item.status || 'In Progress'}
                </span>

                {/* Action button */}
                <div className="flex items-center text-xs font-bold text-gray-600 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors pl-1">
                  <span>Report</span>
                  <BsChevronRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewHistory;

