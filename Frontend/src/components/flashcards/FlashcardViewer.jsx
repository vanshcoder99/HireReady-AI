import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  BsChevronLeft, 
  BsChevronRight, 
  BsStar, 
  BsStarFill, 
  BsArrowRepeat,
  BsLightbulb,
  BsTrash,
  BsArrowLeft
} from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

function FlashcardViewer({ set, cards, onBack }) {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [bookmarkedIds, setBookmarkedIds] = useState([])

  const currentCard = cards[currentIndex] || {
    id: 1,
    question: 'Who developed and maintains the open-source JavaScript library React JS?',
    answer: 'Facebook (now Meta) along with a community of individual developers and companies.',
    difficulty: 'EASY',
  }

  const isBookmarked = bookmarkedIds.includes(currentCard.id)

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex(prev => (prev + 1) % cards.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length)
  }

  const toggleBookmark = (e) => {
    e.stopPropagation()
    if (isBookmarked) {
      setBookmarkedIds(prev => prev.filter(id => id !== currentCard.id))
    } else {
      setBookmarkedIds(prev => [...prev, currentCard.id])
    }
  }

  // Keyboard navigation support (Arrow Left, Arrow Right, Space / Enter to Flip)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setIsFlipped(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cards.length, currentIndex])

  const difficultyColors = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HARD: 'bg-rose-50 text-rose-700 border-rose-200',
  }

  return (
    <div className='max-w-3xl mx-auto space-y-8 py-4'>
      {/* Top Header Bar */}
      <div className='flex items-center justify-between gap-4'>
        <button
          onClick={onBack || (() => navigate('/flashcards'))}
          className='flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl cursor-pointer transition shadow-xs'
        >
          <BsArrowLeft size={16} />
          <span>Back to Sets</span>
        </button>

        <h2 className='text-xl font-extrabold text-gray-900 truncate max-w-xs sm:max-w-md'>
          {set?.title || 'Flashcards'}
        </h2>

        <div className='flex items-center gap-2'>
          <span className='text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200'>
            Keyboard Active (← → Space)
          </span>
        </div>
      </div>

      {/* Large Centered 3D Flashcard Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className='perspective-1000 cursor-pointer group min-h-[380px]'
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`w-full min-h-[380px] rounded-3xl p-8 sm:p-12 shadow-lg transition-all duration-300 flex flex-col justify-between relative transform-style-3d border-2 ${
            isFlipped 
              ? 'bg-emerald-600 border-emerald-600 text-white' 
              : 'bg-white border-gray-200/90 hover:border-emerald-500 text-gray-900'
          }`}
        >
          {/* Card Front View (Question) */}
          {!isFlipped ? (
            <div className='flex flex-col justify-between h-full space-y-6'>
              {/* Card Header Row */}
              <div className='flex justify-between items-center'>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${difficultyColors[currentCard.difficulty || 'EASY']}`}>
                  {currentCard.difficulty || 'EASY'}
                </span>

                <button
                  onClick={toggleBookmark}
                  className='p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-amber-500 cursor-pointer transition-colors'
                  title='Bookmark Flashcard'
                >
                  {isBookmarked ? (
                    <BsStarFill size={20} className='text-amber-500' />
                  ) : (
                    <BsStar size={20} />
                  )}
                </button>
              </div>

              {/* Main Question Text */}
              <div className='my-auto text-center px-4 sm:px-8'>
                <h3 className='text-xl sm:text-3xl font-extrabold leading-snug tracking-tight text-gray-900'>
                  {currentCard.question}
                </h3>
              </div>

              {/* Card Footer Hint */}
              <div className='flex justify-center items-center gap-2 text-xs text-gray-400 font-medium pt-4'>
                <BsArrowRepeat size={15} className='animate-spin' />
                <span>Click card or press Space to reveal answer</span>
              </div>
            </div>
          ) : (
            /* Card Back View (Answer) */
            <div className='flex flex-col justify-between h-full space-y-6 transform rotate-y-180 text-white'>
              {/* Card Header Row */}
              <div className='flex justify-between items-center'>
                <span className='text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/30 text-white'>
                  Answer & Explanation
                </span>

                <button
                  onClick={toggleBookmark}
                  className='p-2 rounded-full hover:bg-white/20 text-white cursor-pointer transition-colors'
                  title='Bookmark Flashcard'
                >
                  {isBookmarked ? (
                    <BsStarFill size={20} className='text-amber-300' />
                  ) : (
                    <BsStar size={20} />
                  )}
                </button>
              </div>

              {/* Main Answer Text */}
              <div className='my-auto text-center px-4 sm:px-8'>
                <p className='text-lg sm:text-2xl font-bold leading-relaxed text-white'>
                  {currentCard.answer}
                </p>
              </div>

              {/* Card Footer Hint */}
              <div className='flex justify-center items-center gap-2 text-xs text-emerald-100 font-medium pt-4'>
                <BsLightbulb size={15} />
                <span>Click card to see question</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Navigation Controls */}
      <div className='flex items-center justify-between bg-white border border-gray-200/90 rounded-2xl p-4 shadow-xs'>
        <button
          onClick={handlePrev}
          className='flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition'
        >
          <BsChevronLeft size={15} />
          <span>Previous</span>
        </button>

        {/* Progress Indicator */}
        <div className='text-center'>
          <span className='text-sm font-bold text-gray-900 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full border border-emerald-100 font-mono'>
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        <button
          onClick={handleNext}
          className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs'
        >
          <span>Next</span>
          <BsChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

export default FlashcardViewer
