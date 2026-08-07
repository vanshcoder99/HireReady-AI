import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  BsLayers, 
  BsPlusLg, 
  BsArrowRepeat, 
  BsTrash, 
  BsPlayFill, 
  BsCoin, 
  BsClock
} from 'react-icons/bs'
import { ServerUrl } from '../../App'
import { setUserData } from '../../redux/userSlice'
import FlashcardViewer from '../flashcards/FlashcardViewer'
import ConfirmDeleteModal from '../common/ConfirmDeleteModal'
import Toast from '../common/Toast'

function DocumentFlashcardsTab({ doc }) {
  const docId = doc?._id || doc?.id
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { userData } = useSelector((state: any) => state.user)
  const userCredits = userData?.user?.credits || 0

  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeStudySet, setActiveStudySet] = useState(null)

  // Custom Delete Modal & Toast States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [setToDelete, setSetToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState({ type: 'success', message: '' })

  const fetchSets = async () => {
    if (!docId) return
    try {
      setLoading(true)
      const res = await axios.get(`${ServerUrl}/api/ai/flashcards?documentId=${docId}`, { withCredentials: true })
      setSets(res.data || [])
    } catch (error) {
      console.error('Fetch document flashcards error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSets()
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
        `${ServerUrl}/api/ai/flashcards`,
        { topic: doc?.title || 'Document Flashcards', documentId: docId, cardCount: 6 },
        { withCredentials: true }
      )

      if (res.data?.flashcardSet) {
        setSets((prev) => [res.data.flashcardSet, ...prev])
        setToast({ type: 'success', message: 'Flashcards generated successfully for this document!' })
      }

      if (res.data?.creditsLeft !== undefined && userData) {
        dispatch(setUserData({ ...userData, user: { ...userData.user, credits: res.data.creditsLeft } }))
      }
    } catch (error) {
      console.error('Generate flashcards error:', error)
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to generate flashcards.' })
    } finally {
      setGenerating(false)
    }
  }

  const promptDeleteSet = (set) => {
    setSetToDelete(set)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!setToDelete) return
    const id = setToDelete._id || setToDelete.id
    try {
      setDeleting(true)
      await axios.delete(`${ServerUrl}/api/ai/flashcards/${id}`, { withCredentials: true })
      setSets((prev) => prev.filter((s) => (s._id || s.id) !== id))
      setToast({ type: 'success', message: 'Flashcard set deleted successfully.' })
      setDeleteModalOpen(false)
    } catch (error) {
      console.error('Delete flashcards error:', error)
      setToast({ type: 'error', message: error.response?.data?.message || 'Failed to delete flashcards.' })
    } finally {
      setDeleting(false)
      setSetToDelete(null)
    }
  }

  return (
    <div className='py-2 space-y-6'>
      <Toast type={(toast.type as 'success' | 'error') || 'success'} message={toast.message} onClose={() => setToast({ type: 'success', message: '' })} />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title='Delete Flashcard Set?'
        message='Are you sure you want to delete this flashcard set? This action cannot be undone and all cards will be permanently removed.'
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        loading={deleting}
      />

      {activeStudySet ? (
        <FlashcardViewer
          set={activeStudySet}
          cards={activeStudySet.cards || []}
          onBack={() => setActiveStudySet(null)}
        />
      ) : (
        <>
          {/* Header Action Bar */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-xs transition-colors duration-300'>
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <div className='bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800/60'>
                  <BsLayers size={18} />
                </div>
                <h2 className='text-xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
                  Flashcards for "{doc?.title || 'Document'}"
                </h2>
              </div>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Active-recall study decks created from this specific document.
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
                    <span>Generating Flashcards...</span>
                  </>
                ) : (
                  <>
                    <BsPlusLg size={14} />
                    <span>Generate New Deck</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Flashcard Sets List / History */}
          {loading ? (
            <div className='py-16 text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2'>
              <BsArrowRepeat size={20} className='animate-spin text-emerald-600' />
              <span>Loading document flashcards...</span>
            </div>
          ) : sets.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {sets.map((set, idx) => {
                const setId = set._id || set.id

                return (
                  <motion.div
                    key={setId || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 relative group'
                  >
                    {/* Trash Delete Icon */}
                    <button
                      onClick={() => promptDeleteSet(set)}
                      className='absolute top-5 right-5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer'
                      title='Delete Flashcard Set'
                    >
                      <BsTrash size={16} />
                    </button>

                    <div className='space-y-2 pr-8'>
                      <span className='text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/80'>
                        {set.totalCards || set.cards?.length || 6} Cards
                      </span>
                      <h3 className='font-bold text-gray-900 dark:text-white text-base leading-snug line-clamp-1'>
                        {set.title || 'Document Flashcard Deck'}
                      </h3>
                      <p className='text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2'>
                        <BsClock size={12} />
                        <span>Created {new Date(set.createdAt || Date.now()).toLocaleDateString()}</span>
                      </p>
                    </div>

                    <div className='pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between'>
                      <span className='text-xs text-gray-500 dark:text-gray-400 font-medium'>
                        {set.cards?.length || 6} Study Flashcards
                      </span>

                      <button
                        onClick={() => setActiveStudySet(set)}
                        className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-xs inline-flex items-center gap-1.5'
                      >
                        <BsPlayFill size={16} />
                        <span>Study Deck</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            /* EMPTY STATE: When NO flashcard set generated yet for this document */
            <div className='bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 p-12 text-center space-y-4 shadow-xs transition-colors duration-300'>
              <div className='w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-800/60'>
                <BsLayers size={28} />
              </div>
              <div className='max-w-md mx-auto'>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>No Flashcards Generated for this Document</h3>
                <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1'>
                  Generate an active-recall flashcard deck specifically based on "{doc?.title || 'this document'}".
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
                    <span>Generating Flashcards...</span>
                  </>
                ) : (
                  <>
                    <BsPlusLg size={14} />
                    <span>Generate First Flashcard Deck (20 Credits)</span>
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

export default DocumentFlashcardsTab
