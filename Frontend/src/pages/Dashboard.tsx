import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { ServerUrl } from '../App'
import DashboardHero from '../components/dashboard/DashboardHero'
import ProgressOverview from '../components/dashboard/ProgressOverview'
import RecommendedStep from '../components/dashboard/RecommendedStep'
import RecentActivity from '../components/dashboard/RecentActivity'
import QuickAccess from '../components/dashboard/QuickAccess'
import ResumeScore from '../components/dashboard/ResumeScore'

function Dashboard() {
  const { userData } = useSelector((state: any) => state.user)
  const [summaryData, setSummaryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get(`${ServerUrl}/api/user/dashboard-summary`, {
        withCredentials: true,
      })
      if (res.data?.success) {
        setSummaryData(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err)
      setError('Unable to load real-time stats.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary()

    // Socket.IO for real-time updates — use userData.id (Prisma UUID, not MongoDB _id)
    let socket: any = null
    const userId = userData?.id

    if (userId) {
      socket = io(ServerUrl, { withCredentials: true })
      socket.emit('register-user', { userId })

      socket.on('dashboard-update', () => {
        console.log('Real-time dashboard update received!')
        fetchSummary()
      })
    }

    return () => {
      if (socket) {
        socket.off('dashboard-update')
        socket.disconnect()
      }
    }
  }, [fetchSummary, userData])

  if (loading && !summaryData) {
    return (
      <div className='py-6 space-y-6 animate-pulse'>
        <div className='h-20 bg-gray-200 dark:bg-gray-800 rounded-2xl w-3/4 mb-4' />
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl' />
          ))}
        </div>
        <div className='h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl' />
        <div className='h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl' />
      </div>
    )
  }

  const { stats, recommendation, activities } = summaryData || {}

  return (
    <div className='py-2 space-y-6'>
      <DashboardHero stats={stats} />
      <ProgressOverview stats={stats} />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <div className='lg:col-span-2 space-y-6'>
          <RecommendedStep recommendation={recommendation} />
          <RecentActivity activities={activities || []} />
        </div>
        <div className='space-y-6'>
          <ResumeScore key={summaryData?.stats?.resumeScore || 0} />
          <QuickAccess stats={stats} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard

