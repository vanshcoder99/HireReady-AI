import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  BsSearch, 
  BsPlusLg, 
  BsFileEarmarkText, 
  BsUpload,
  BsArrowRepeat,
  BsCoin
} from 'react-icons/bs'
import { ServerUrl } from '../App.jsx'
import { setUserData } from '../redux/userSlice.js'
import DocumentCard from '../components/documents/DocumentCard.jsx'

function Documents() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)
  const userCredits = userData?.user?.credits || 0

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const fileInputRef = useRef(null)

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${ServerUrl}/api/document/list`, { withCredentials: true })
      setDocuments(res.data || [])
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (userCredits < 20) {
      alert(`Minimum 20 credits required for Document processing. You currently have ${userCredits} credits. Please buy more credits.`)
      navigate('/pricing')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', file.name)

    try {
      setUploading(true)
      const res = await axios.post(`${ServerUrl}/api/document/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      if (res.data?.document) {
        setDocuments((prev) => [res.data.document, ...prev])
      }

      if (res.data?.creditsLeft !== undefined && userData) {
        dispatch(setUserData({ ...userData, user: { ...userData.user, credits: res.data.creditsLeft } }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(error.response?.data?.message || 'Failed to upload document.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return
    try {
      await axios.delete(`${ServerUrl}/api/document/delete/${docId}`, { withCredentials: true })
      setDocuments((prev) => prev.filter((doc) => (doc._id || doc.id) !== docId))
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document.')
    }
  }

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase())
    if (filter === 'All') return matchesSearch
    if (filter === 'Summarized') return matchesSearch && doc.summaryAvailable
    if (filter === 'Flashcards') return matchesSearch && (doc.flashcardsCount > 0)
    if (filter === 'Quizzes') return matchesSearch && (doc.quizzesCount > 0)
    return matchesSearch
  })

  return (
    <div className='py-2 space-y-8'>
      {/* Header Banner */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors duration-300'>
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <div className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800/60'>
              <BsFileEarmarkText size={20} />
            </div>
            <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
              Document Library
            </h1>
          </div>
          <p className='text-gray-500 dark:text-gray-400 text-sm max-w-xl'>
            Upload tech notes, resumes, or study guides to auto-generate AI summaries, flashcard decks, and practice quizzes.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {/* Credit Requirement Badge */}
          <div className='hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300'>
            <BsCoin size={15} className='text-emerald-600 dark:text-emerald-400' />
            <span>20 Credits / Upload</span>
          </div>

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept='.pdf,.txt,.md'
            className='hidden'
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold px-5 py-3 rounded-2xl text-xs md:text-sm cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
          >
            {uploading ? (
              <>
                <BsArrowRepeat size={16} className='animate-spin' />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <BsUpload size={16} />
                <span>Upload Document (20 Credits)</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
        {/* Search */}
        <div className='relative w-full sm:w-72'>
          <BsSearch size={14} className='absolute left-4 top-3.5 text-gray-400 dark:text-gray-500' />
          <input
            type='text'
            placeholder='Search documents...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition'
          />
        </div>

        {/* Category Filters */}
        <div className='flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0'>
          {['All', 'Summarized', 'Flashcards', 'Quizzes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                filter === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className='py-20 text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2'>
          <BsArrowRepeat size={20} className='animate-spin text-emerald-600' />
          <span>Loading document library...</span>
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredDocs.map((doc, idx) => (
            <DocumentCard key={doc._id || doc.id || idx} doc={doc} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className='bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-12 text-center space-y-4'>
          <div className='w-14 h-14 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl flex items-center justify-center mx-auto border border-gray-200/60 dark:border-gray-700'>
            <BsFileEarmarkText size={28} />
          </div>
          <div>
            <h3 className='text-lg font-bold text-gray-900 dark:text-white'>No Documents Found</h3>
            <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-sm mx-auto mt-1'>
              Upload PDF or text documents to generate instant AI summaries, flashcards, and quizzes.
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className='bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition shadow-xs inline-flex items-center gap-2'
          >
            <BsUpload size={14} />
            <span>Upload First Document (20 Credits)</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Documents
