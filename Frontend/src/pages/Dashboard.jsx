import React from 'react'
import DashboardHero from '../components/dashboard/DashboardHero.jsx'
import ProgressOverview from '../components/dashboard/ProgressOverview.jsx'
import RecommendedStep from '../components/dashboard/RecommendedStep.jsx'
import RecentActivity from '../components/dashboard/RecentActivity.jsx'
import QuickAccess from '../components/dashboard/QuickAccess.jsx'

function Dashboard() {
  return (
    <div className='py-2'>
      <DashboardHero />
      <ProgressOverview />
      <RecommendedStep />
      <RecentActivity />
      <QuickAccess />
    </div>
  )
}

export default Dashboard
