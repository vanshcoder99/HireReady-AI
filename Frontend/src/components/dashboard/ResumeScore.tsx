import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  BsFileEarmarkText,
  BsCloudUpload,
  BsArrowRepeat,
  BsCheckCircleFill,
  BsExclamationTriangleFill,
  BsLightbulb,
  BsArrowRight,
  BsShieldCheck
} from 'react-icons/bs' // wait, check icon import package
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import DashboardCard from './DashboardCard'
import { ServerUrl } from '../../App'

interface ResumeScoreProps {
  initialData?: any;
}

function ResumeScore({ initialData }: ResumeScoreProps) {
  const [data, setData] = useState<any>(initialData || null)
  const [hasResume, setHasResume] = useState<boolean>(Boolean(initialData))
  const [loading, setLoading] = useState<boolean>(!initialData)
  const [error, setError] = useState<string | null>(null)

  const fetchResumeData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${ServerUrl}/api/resume/latest`, {
        withCredentials: true,
      })

      if (res.data?.hasResume && res.data?.data) {
        setData(res.data.data)
        setHasResume(true)
      } else {
        setData(null)
        setHasResume(false)
      }
    } catch (err: any) {
      console.error('Failed to fetch resume score data:', err)
      setError('Failed to load resume analysis data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialData) {
      fetchResumeData()
    } else {
      setData(initialData)
      setHasResume(true)
      setLoading(false)
    }
  }, [fetchResumeData, initialData])

  const score = Number(data?.atsScore || data?.overallScore || 0)
  const matchedSkills: string[] = Array.isArray(data?.matchedSkills) ? data.matchedSkills : []
  const recommendedSkills: string[] = Array.isArray(data?.recommendedSkills) ? data.recommendedSkills : []
  const suggestions: any[] = Array.isArray(data?.suggestions) ? data.suggestions : []

  return (
    <DashboardCard title="AI Resume & ATS Score" icon={<BsFileEarmarkText size={20} />} delay={0.25}>
      {loading ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
          <BsArrowRepeat size={24} className="animate-spin text-emerald-600" />
          <span className="text-xs font-medium">Fetching real-time ATS analysis...</span>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-rose-500 space-y-2">
          <p className="text-xs font-medium">{error}</p>
          <button
            onClick={fetchResumeData}
            className="text-xs bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl transition cursor-pointer font-semibold"
          >
            Retry
          </button>
        </div>
      ) : !hasResume ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800/60">
            <BsCloudUpload size={28} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">No Resume Analyzed Yet</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
              Upload your resume to get instant ATS scores, technical skill gap analysis, and tailored AI recommendations.
            </p>
          </div>
          <Link
            to="/resume"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <span>Analyze Resume Now</span>
            <BsArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Header Score & Resume Info */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 flex-shrink-0">
              <CircularProgressbar
                value={score}
                text={`${score}%`}
                styles={buildStyles({
                  textSize: '22px',
                  pathColor: score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#f43f5e',
                  textColor: score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#f43f5e',
                  trailColor: '#e5e7eb',
                  pathTransitionDuration: 1,
                })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  {score >= 75 ? 'ATS Strong' : score >= 55 ? 'Needs Optimization' : 'Requires Work'}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-1">
                {data?.fileName || 'PDF Resume'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Analyzed on {data?.uploadDate || 'Recently'}
              </p>
            </div>
          </div>

          {/* Matched Strengths */}
          {matchedSkills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <BsCheckCircleFill className="text-emerald-500" size={12} />
                <span>Matched Skills ({matchedSkills.length})</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.slice(0, 6).map((skill, i) => (
                  <span
                    key={i}
                    className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs px-2.5 py-1 rounded-lg font-semibold border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing / Recommended Skills to Add */}
          {recommendedSkills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <BsExclamationTriangleFill className="text-amber-500" size={12} />
                <span>Recommended Skills to Add</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedSkills.slice(0, 5).map((area, i) => (
                  <span
                    key={i}
                    className="bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs px-2.5 py-1 rounded-lg font-semibold border border-amber-200/60 dark:border-amber-800/60"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Top Suggestion */}
          {suggestions.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl border border-gray-200/80 dark:border-gray-700/80 flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
              <BsLightbulb className="text-amber-500 shrink-0 mt-0.5" size={15} />
              <p className="line-clamp-2">
                {typeof suggestions[0] === 'string' ? suggestions[0] : suggestions[0]?.text}
              </p>
            </div>
          )}

          {/* Action Link to Full Analysis Page */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Role: {data?.extractedRole || 'Full-Stack'}</span>
            <Link
              to="/resume"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>View Full Report</span>
              <BsArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </DashboardCard>
  )
}

export default ResumeScore
