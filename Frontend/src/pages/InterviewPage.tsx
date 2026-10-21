import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'
import AuthModel from '../components/AuthModel'
import Navbar from '../components/Navbar'

function InterviewPage() {
  const { userData } = useSelector((state: any) => state.user)
  const [step, setStep] = useState(1)
  const [interviewData, setInterviewData] = useState(null)

  // Protect Interview Page: If user is not authenticated, show Auth modal immediately!
  if (!userData) {
    return (
      <div className='min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] transition-colors duration-300'>
        <Navbar />
        <AuthModel onClose={() => {}} />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-[#0b0f19] transition-colors duration-300'>
      {step === 1 && (
        <Step1SetUp
          onStart={(data) => {
            setInterviewData(data)
            setStep(2)
          }}
        />
      )}

      {step === 2 && (
        <Step2Interview
          interviewData={interviewData}
          onFinish={(report) => {
            setInterviewData(report)
            setStep(3)
          }}
        />
      )}

      {step === 3 && <Step3Report report={interviewData} />}
    </div>
  )
}

export default InterviewPage
