import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { BsPlusLg, BsQuestionCircle, BsSearch, BsArrowRepeat, BsCoin, BsX } from 'react-icons/bs'
import { ServerUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import QuizCard from '../components/quizzes/QuizCard'
import QuizQuestionView from '../components/quizzes/QuizQuestionView'
import QuizResultView from '../components/quizzes/QuizResultView'
import ConfirmDeleteModal from '../components/common/ConfirmDeleteModal'
import Toast from '../components/common/Toast'

function Quizzes() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)
  const userCredits = userData?.credits || 0

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [search, setSearch] = useState('')
  const [activeQuizMode, setActiveQuizMode] = useState(null)
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [quizResultData, setQuizResultData] = useState(null)
  const [newTopic, setNewTopic] = useState('')
  const [showPromptModal, setShowPromptModal] = useState(false)

  // Custom Delete Modal & Toast States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState({ type: 'success', message: '' })

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${ServerUrl}/api/ai/quizzes`, { withCredentials: true })
      setQuizzes(res.data || [])
    } catch (error) {
      console.error('Fetch quizzes error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const promptDeleteQuiz = (quizId) => {
    const q = quizzes.find((item) => (item._id || item.id) === quizId)
    setQuizToDelete(q || { id: quizId })
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!quizToDelete) return
    const id = quizToDelete._id || quizToDelete.id
    try {
      setDeleting(true)
      await axios.delete(`${ServerUrl}/api/ai/quizzes/${id}`, { withCredentials: true })
      setQuizzes((prev) => prev.filter((q) => (q._id || q.id) !== id))
      setToast({ type: 'success', message: 'Quiz deleted successfully.' })
      setDeleteModalOpen(false)
    } catch (error) {
      console.error('Delete quiz error:', error)
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete quiz.' })
    } finally {
      setDeleting(false)
      setQuizToDelete(null)
    }
  }

  const handleGenerateQuiz = async (e) => {
    e.preventDefault()
    if (!newTopic.trim() || generating) return

    if (userCredits < 20) {
      setToast({ type: 'error', message: `Minimum 20 credits required. You currently have ${userCredits} credits.` })
      setShowPromptModal(false)
      setTimeout(() => navigate('/pricing'), 1500)
      return
    }

    setGenerating(true)
    try {
      const res = await axios.post(
        `${ServerUrl}/api/ai/quiz`,
        { topic: newTopic.trim(), questionCount: 5 },
        { withCredentials: true }
      )
      if (res.data?.quiz) {
        setQuizzes((prev) => [res.data.quiz, ...prev])
        setShowPromptModal(false)
        setNewTopic('')
        setToast({ type: 'success', message: 'Quiz generated successfully!' })
      }

      if (res.data?.creditsLeft !== undefined && userData) {
        dispatch(setUserData({ ...userData, user: { ...userData.user, credits: res.data.creditsLeft } }))
      }
    } catch (error) {
      console.error('Generate quiz error:', error)
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to generate quiz.' })
    } finally {
      setGenerating(false)
    }
  }

  const handleStartQuiz = (quizId) => {
    const q = quizzes.find((item) => (item._id || item.id) === quizId) || quizzes[0]
    setCurrentQuiz(q)
    setActiveQuizMode('taking')
  }

  const handleViewResults = (quizId) => {
    const q = quizzes.find((item) => (item._id || item.id) === quizId) || quizzes[0]
    setCurrentQuiz(q)
    setQuizResultData({
      id: quizId,
      title: q?.title || 'Quiz Results',
      score: q?.bestScore || q?.lastAttemptScore || 0,
      totalQuestions: q?.totalQuestions || q?.questions?.length || 5,
    })
    setActiveQuizMode('results')
  }

  const handleQuizCompleted = async (finalResult) => {
    setQuizResultData(finalResult)
    setActiveQuizMode('results')
    fetchQuizzes()
  }

  const filteredQuizzes = quizzes.filter((q) => q.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className='py-2 space-y-8'>
      <Toast type={(toast.type as 'success' | 'error') || 'success'} message={toast.message} onClose={() => setToast({ type: 'success', message: '' })} />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title='Delete Quiz?'
        message='Are you sure you want to delete this quiz? This action cannot be undone and all results will be permanently removed.'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        loading={deleting}
      />

      {activeQuizMode === 'taking' && currentQuiz ? (
        <QuizQuestionView
          quiz={currentQuiz}
          questions={currentQuiz.questions || []}
          onFinish={handleQuizCompleted}
          onBack={() => setActiveQuizMode(null)}
        />
      ) : activeQuizMode === 'results' && quizResultData ? (
        <QuizResultView
          result={quizResultData}
          onRetake={() => setActiveQuizMode('taking')}
          onBack={() => setActiveQuizMode(null)}
        />
      ) : (
        <>
          {/* Header Banner */}
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs transition-colors duration-300'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <div className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800/60'>
                  <BsQuestionCircle size={20} />
                </div>
                <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
                  Practice Technical Quizzes
                </h1>
              </div>
              <p className='text-gray-500 dark:text-gray-400 text-sm max-w-xl'>
                Timed topic quizzes with instant AI explanations to test speed, technical accuracy, and domain depth.
              </p>
            </div>

            <div className='flex items-center gap-3'>
              {/* Credit Requirement Badge */}
              <div className='hidden sm:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300'>
                <BsCoin size={15} className='text-emerald-600 dark:text-emerald-400' />
                <span>20 Credits / Quiz</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPromptModal(true)}
                className='bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-2xl text-xs md:text-sm cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
              >
                <BsPlusLg size={15} />
                <span>Generate Quiz (20 Credits)</span>
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <div className='flex items-center justify-between gap-4'>
            <div className='relative w-full sm:w-72'>
              <BsSearch size={14} className='absolute left-4 top-3.5 text-gray-400 dark:text-gray-500' />
              <input
                type='text'
                placeholder='Search quizzes...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 text-gray-900 dark:text-white rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition'
              />
            </div>
          </div>

          {/* Quiz Grid */}
          {loading ? (
            <div className='py-20 text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2'>
              <BsArrowRepeat size={20} className='animate-spin text-emerald-600' />
              <span>Loading quizzes...</span>
            </div>
          ) : filteredQuizzes.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredQuizzes.map((quiz, idx) => (
                <QuizCard
                  key={quiz._id || quiz.id || idx}
                  quiz={quiz}
                  onStart={() => handleStartQuiz(quiz._id || quiz.id)}
                  onViewResults={() => handleViewResults(quiz._id || quiz.id)}
                  onDelete={() => promptDeleteQuiz(quiz._id || quiz.id)}
                />
              ))}
            </div>
          ) : (
            <div className='bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-12 text-center space-y-4'>
              <div className='w-14 h-14 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl flex items-center justify-center mx-auto border border-gray-200/60 dark:border-gray-700'>
                <BsQuestionCircle size={28} />
              </div>
              <div>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>No Quizzes Created Yet</h3>
                <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-sm mx-auto mt-1'>
                  Generate technical multiple-choice quizzes on any subject to practice before placement rounds.
                </p>
              </div>
              <button
                onClick={() => setShowPromptModal(true)}
                className='bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition shadow-xs inline-flex items-center gap-2'
              >
                <BsPlusLg size={14} />
                <span>Create First Quiz (20 Credits)</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Generate Quiz Modal */}
      {showPromptModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl relative'
          >
            <button
              onClick={() => setShowPromptModal(false)}
              className='absolute top-5 right-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-xl transition'
            >
              <BsX size={20} />
            </button>

            <div className='flex items-center gap-3 mb-4'>
              <div className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/60'>
                <BsQuestionCircle size={20} />
              </div>
              <div>
                <h3 className='text-lg font-extrabold text-gray-900 dark:text-white'>Generate AI Practice Quiz</h3>
                <p className='text-xs text-emerald-600 dark:text-emerald-400 font-semibold'>Cost: 20 Credits</p>
              </div>
            </div>

            <form onSubmit={handleGenerateQuiz} className='space-y-4'>
              <div>
                <label className='text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1.5'>
                  Enter Technical Subject / Domain
                </label>
                <input
                  type='text'
                  placeholder='e.g., DBMS, Web Development, Java OOP, OS'
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition'
                  autoFocus
                />
              </div>

              <div className='flex items-center justify-end gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setShowPromptModal(false)}
                  className='px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={!newTopic.trim() || generating}
                  className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition shadow-md shadow-emerald-600/20 inline-flex items-center gap-2'
                >
                  {generating ? (
                    <>
                      <BsArrowRepeat size={14} className='animate-spin' />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <span>Generate Quiz</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Quizzes
