import React from 'react'
import { BsFileEarmarkPdf, BsDownload } from 'react-icons/bs'
import DashboardCard from './DashboardCard'
import pdfImg from '../../assets/pdf.png'

// Mock data — replace with API data when backend is ready
const documents = [
  {
    name: 'Interview_Report_Jul22.pdf',
    type: 'Report',
    date: 'Jul 22, 2026',
    size: '1.2 MB',
  },
  {
    name: 'Resume_v3.pdf',
    type: 'Resume',
    date: 'Jul 20, 2026',
    size: '856 KB',
  },
  {
    name: 'Study_Notes_React.pdf',
    type: 'Notes',
    date: 'Jul 18, 2026',
    size: '2.1 MB',
  },
  {
    name: 'Performance_Summary.pdf',
    type: 'Report',
    date: 'Jul 15, 2026',
    size: '945 KB',
  },
]

const typeColor = {
  Report: 'bg-emerald-100 text-emerald-700',
  Resume: 'bg-blue-100 text-blue-700',
  Notes: 'bg-purple-100 text-purple-700',
}

function LatestDocuments() {
  return (
    <DashboardCard
      title='Latest Documents'
      icon={<BsFileEarmarkPdf size={20} />}
      delay={0.4}
      action={
        <button className='text-xs text-emerald-600 font-semibold hover:underline cursor-pointer'>
          View All
        </button>
      }
    >
      <div className='space-y-2'>
        {documents.map((doc, index) => (
          <div
            key={index}
            className='flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group'
          >
            <img
              src={pdfImg}
              alt='PDF'
              className='w-10 h-10 object-contain flex-shrink-0 opacity-80'
            />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-gray-800 truncate'>{doc.name}</p>
              <div className='flex items-center gap-2 mt-1'>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[doc.type] || 'bg-gray-100 text-gray-600'}`}>
                  {doc.type}
                </span>
                <span className='text-xs text-gray-400'>{doc.size}</span>
              </div>
            </div>
            <div className='flex items-center gap-3 flex-shrink-0'>
              <span className='text-xs text-gray-400 hidden sm:block'>{doc.date}</span>
              <button className='p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer opacity-0 group-hover:opacity-100'>
                <BsDownload size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}

export default LatestDocuments
