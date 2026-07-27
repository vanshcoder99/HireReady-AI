import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { 
  BsArrowLeft, 
  BsChatDots, 
  BsLightning, 
  BsLayers, 
  BsQuestionCircle,
  BsFileEarmarkText,
  BsBoxArrowUpRight,
  BsCalendar3,
  BsFileEarmark
} from 'react-icons/bs'
import { ServerUrl } from '../App.jsx'

import DocumentContentTab from '../components/documents/DocumentContentTab.jsx'
import DocumentChatTab from '../components/documents/DocumentChatTab.jsx'
import DocumentActionsTab from '../components/documents/DocumentActionsTab.jsx'
import DocumentFlashcardsTab from '../components/documents/DocumentFlashcardsTab.jsx'
import DocumentQuizzesTab from '../components/documents/DocumentQuizzesTab.jsx'

const tabs = [
  { id: 'content', label: 'Content', icon: <BsFileEarmarkText size={16} /> },
  { id: 'chat', label: 'AI Chat', icon: <BsChatDots size={16} /> },
  { id: 'actions', label: 'AI Actions', icon: <BsLightning size={16} /> },
  { id: 'flashcards', label: 'Flashcards', icon: <BsLayers size={16} /> },
  { id: 'quizzes', label: 'Quizzes', icon: <BsQuestionCircle size={16} /> },
]

function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`${ServerUrl}/api/document/${id}`, { withCredentials: true })
        setDoc(res.data)
      } catch (error) {
        console.error('Failed to fetch document:', error)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchDoc()
  }, [id])

  if (loading) {
    return (
      <div className='py-12 flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-3'>
          <div className='w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto' />
          <p className='text-gray-500 text-sm font-medium'>Loading Document...</p>
        </div>
      </div>
    )
  }

  const documentData = doc || {
    id: id || 'doc-1',
    title: 'Placement_Preparation_Guide.pdf',
    createdAt: new Date(),
    pageCount: 14,
    flashcardsCount: 24,
    quizzesCount: 3,
    summaryAvailable: true,
  }

  const dateStr = documentData.createdAt
    ? new Date(documentData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently'

  const fileLink = documentData.fileUrl ? `${ServerUrl}${documentData.fileUrl}` : '#'

  return (
    <div className='py-2 space-y-6'>
      {/* Top Breadcrumb & Actions Row */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/documents')}
            className='p-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer shadow-xs'
            title='Back to Documents'
          >
            <BsArrowLeft size={18} />
          </button>

          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate max-w-sm sm:max-w-md'>
                {documentData.title}
              </h1>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2'>
              <span className='flex items-center gap-1'><BsCalendar3 size={11} /> {dateStr}</span>
              <span>•</span>
              <span className='flex items-center gap-1'><BsFileEarmark size={11} /> {documentData.pageCount || 1} Pages</span>
            </p>
          </div>
        </div>

        {/* Quick action button */}
        {documentData.fileUrl && (
          <button
            onClick={() => window.open(fileLink, '_blank')}
            className='flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs self-start sm:self-auto'
          >
            <span>Open PDF in New Tab</span>
            <BsBoxArrowUpRight size={12} />
          </button>
        )}
      </div>

      {/* Modern Tabs Navigation Bar */}
      <div className='bg-white border border-gray-200/90 rounded-2xl p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto text-sm'>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap relative ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId='activeTabBackground'
                  className='absolute inset-0 bg-emerald-50 border border-emerald-200/80 rounded-xl'
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                {tab.icon}
              </span>
              <span className='relative z-10'>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className='pt-2'>
        <AnimatePresence mode='wait'>
          {activeTab === 'content' && (
            <motion.div
              key='content'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentContentTab doc={documentData} />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key='chat'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentChatTab doc={documentData} />
            </motion.div>
          )}

          {activeTab === 'actions' && (
            <motion.div
              key='actions'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentActionsTab doc={documentData} />
            </motion.div>
          )}

          {activeTab === 'flashcards' && (
            <motion.div
              key='flashcards'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentFlashcardsTab doc={documentData} />
            </motion.div>
          )}

          {activeTab === 'quizzes' && (
            <motion.div
              key='quizzes'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DocumentQuizzesTab doc={documentData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default DocumentDetail
