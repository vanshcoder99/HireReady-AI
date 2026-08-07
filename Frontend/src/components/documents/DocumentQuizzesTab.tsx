import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  BsQuestionCircle, 
  BsPlusLg, 
  BsArrowRepeat, 
  BsTrash, 
  BsPlayFill, 
  BsCoin, 
  BsCheckCircleFill,
  BsClock
} from 'react-icons/bs'
import { ServerUrl } from '../../App'
import { setUserData } from '../../redux/userSlice'
import QuizQuestionView from '../quizzes/QuizQuestionView'
import QuizResultView from '../quizzes/QuizResultView'
import ConfirmDeleteModal from '../common/ConfirmDeleteModal'
import Toast from '../common/Toast'

function DocumentQuizzesTab({ doc }) {
  const docId = doc?._id || doc?.id
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)
  const userCredits = userData?.user?.credits || 0

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeQuizMode, setActiveQuizMode] = useState(null) // 'taking' | 'results' | null
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [quizResultData, setQuizResultData] = useState(null)

  // Custom Delete Modal & Toast States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState({ type: 'success', message: '' })

  const fetchQuizzes = async () => {
    if (!docId) return
    try {
      setLoading(true)
      const res = await axios.get(`${ServerUrl}/api/ai/quizzes?documentId=${docId}`, { withCredentials: true })
      setQuizzes(res.data || [])
    } catch (error) {
      console.error('Fetch document quizzes error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuizzes()
  }, [docId])

  const handleGenerate = async () => {
    if (!docId || generating) return

    if (userCredits < 20) {
      setToast({ type: 'error', message: `Minimum 20 credits required. You currently have ${userCredits} credits.` })
      setTimeout(() => navigate('/pricing'), 1500)
      return
    }

    setGenerating(true)
    try {
      const res = await axios.post(
        `${ServerUrl}/api/ai/quiz`,
        { topic: doc?.title || 'Document Quiz', documentId: docId, questionCount: 5 },
        { withCredentials: true }
      )

      if (res.data?.quiz) {
        setQuizzes((prev) => [res.data.quiz, ...prev])
        setToast({ type: 'success', message: 'Quiz generated successfully for this document!' })
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

  const promptDeleteQuiz = (quiz) => {
    setQuizToDelete(quiz)
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

  const handleStartQuiz = (q) => {
    setCurrentQuiz(q)
    setActiveQuizMode('taking')
  }

  const handleViewResults = (q) => {
    setCurrentQuiz(q)
    setQuizResultData({
      id: q._id || q.id,
      title: q.title || 'Quiz Results',
      score: q.bestScore || q.lastAttemptScore || 0,
      totalQuestions: q.totalQuestions || q.questions?.length || 5,
    })
    setActiveQuizMode('results')
  }

  const handleQuizCompleted = async (finalResult) => {
    setQuizResultData(finalResult)
    setActiveQuizMode('results')
    fetchQuizzes()
  }

  return (
    <div className='py-2 space-y-6'>
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
          {/* Header Action Bar */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-xs transition-colors duration-300'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <div className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800/60'>
                  <BsQuestionCircle size={18} />
                </div>
                <h2 className='text-xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
                  Quizzes for "{doc?.title || 'Document'}"
                </h2>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Practice quizzes generated specifically from this document context.
              </p>
            </div>

            <div className='flex items-center gap-3'>
              <div className='hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300'>
                <BsCoin size={14} className='text-emerald-600 dark:text-emerald-400' />
                <span>20 Credits</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerate}
                disabled={generating}
                className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer transition shadow-md shadow-emerald-600/20 flex items-center gap-2'
              >
                {generating ? (
                  <>
                    <BsArrowRepeat size={16} className='animate-spin' />
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <BsPlusLg size={14} />
                    <span>Generate New Quiz</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Quizzes List / History */}
          {loading ? (
            <div className='py-16 text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2'>
              <BsArrowRepeat size={20} className='animate-spin text-emerald-600' />
              <span>Loading document quizzes...</span>
            </div>
          ) : quizzes.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {quizzes.map((quiz, idx) => {
                const quizId = quiz._id || quiz.id
                const isCompleted = quiz.status === 'completed' || (quiz.attemptsCount || 0) > 0

                return (
                  <motion.div
                    key={quizId || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative group'
                  >
                    {/* Trash Delete Icon */}
                    <button
                      onClick={() => promptDeleteQuiz(quiz)}
                      className='absolute top-5 right-5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer'
                      title='Delete Quiz'
                    >
                      <BsTrash size={16} />
                    </button>

                    <div className='space-y-2 pr-8'>
                      <span className='text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/80'>
                        {quiz.totalQuestions || quiz.questions?.length || 5} Questions
                      </span>
                      <h3 className='font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-1'>
                        {quiz.title || 'Document Quiz'}
                      </h3>
                      <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2'>
                        <BsClock size={12} />
                        <span>Created {new Date(quiz.createdAt || Date.now()).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className='pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between'>
                      <div>
                        {isCompleted ? (
                          <div className='flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400'>
                            <BsCheckCircleFill size={14} />
                            <span>Best Score: {quiz.bestScore || 0}/{quiz.totalQuestions || 5}</span>
                          </div>
                        ) : (
                          <span className='text-xs text-gray-400 font-medium'>Not attempted yet</span>
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        {isCompleted && (
                          <button
                            onClick={() => handleViewResults(quiz)}
                            className='px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition cursor-pointer'
                          >
                            Results
                          </button>
                        )}
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5'
                        >
                          <BsPlayFill size={16} />
                          <span>{isCompleted ? 'Retake' : 'Start'}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            /* EMPTY STATE: When NO quiz generated yet for this document */
            <div className='bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs transition-colors duration-300'>
              <div className='w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800/60'>
                <BsQuestionCircle size={28} />
              </div>
              <div className='max-w-md mx-auto'>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>No Quizzes Generated for this Document</h3>
                <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1'>
                  Generate a customized 5-question technical quiz specifically based on "{doc?.title || 'this document'}".
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className='bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-xl text-xs md:text-sm cursor-pointer transition shadow-md shadow-emerald-600/20 inline-flex items-center gap-2'
              >
                {generating ? (
                  <>
                    <BsArrowRepeat size={16} className='animate-spin' />
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <BsPlusLg size={14} />
                    <span>Generate First Quiz for this Document (20 Credits)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DocumentQuizzesTab
