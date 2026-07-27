import React, { useState } from 'react'
import { motion } from 'motion/react'
import { 
  BsArrowLeft, 
  BsChevronLeft, 
  BsChevronRight, 
  BsCheckCircleFill, 
  BsSend
} from 'react-icons/bs'

function QuizQuestionView({ quiz, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: selectedOptionIndex }

  const questions = quiz?.questions || [
    {
      id: 1,
      question: 'Who developed React JS?',
      options: ['Google', 'Microsoft', 'Facebook (now Meta)', 'Apple'],
      correctAnswer: 2,
      explanation: 'React JS was developed by Facebook (now Meta) in 2013.'
    },
    {
      id: 2,
      question: 'What is the Virtual DOM in React?',
      options: [
        'A physical hardware accelerator',
        'An in-memory lightweight copy of the real DOM used for reconciliation',
        'A browser extension',
        'A database engine'
      ],
      correctAnswer: 1,
      explanation: 'The Virtual DOM allows React to compute minimal UI updates before patching the real browser DOM.'
    },
    {
      id: 3,
      question: 'Which hook should be used for side effects in functional components?',
      options: ['useState', 'useEffect', 'useMemo', 'useContext'],
      correctAnswer: 1,
      explanation: 'useEffect is designed for handling side effects like data fetching and subscriptions.'
    },
    {
      id: 4,
      question: 'What is JSX in React?',
      options: [
        'A syntax extension combining HTML-like templates with JS',
        'A database query language',
        'A CSS preprocessor',
        'A security protocol'
      ],
      correctAnswer: 0,
      explanation: 'JSX allows writing HTML structures inside JavaScript code.'
    },
    {
      id: 5,
      question: 'How do you pass data down to child components?',
      options: ['State', 'Props', 'Redux', 'LocalStorage'],
      correctAnswer: 1,
      explanation: 'Props are passed from parent to child components.'
    }
  ]

  const currentQ = questions[currentIndex]
  const selectedOpt = answers[currentQ.id]

  const handleSelect = (optIndex) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optIndex }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    // Calculate score
    let score = 0
    const questionsResult = questions.map(q => {
      const userAns = answers[q.id] !== undefined ? answers[q.id] : -1
      if (userAns === q.correctAnswer) score += 1
      return {
        ...q,
        userAnswer: userAns,
      }
    })

    const finalResult = {
      id: quiz?.id || 'quiz-1',
      title: quiz?.title || 'React JS Concept Guide - Quiz',
      score,
      totalQuestions: questions.length,
      accuracy: Math.round((score / questions.length) * 100),
      questions: questionsResult,
    }

    onComplete && onComplete(finalResult)
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100)

  return (
    <div className='max-w-3xl mx-auto space-y-6 py-4'>
      {/* Top Bar */}
      <div className='flex items-center justify-between'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl cursor-pointer transition shadow-xs'
        >
          <BsArrowLeft size={16} />
          <span>Exit Quiz</span>
        </button>

        <span className='text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200'>
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className='w-full bg-gray-200 h-2 rounded-full overflow-hidden'>
        <motion.div
          animate={{ width: `${progressPercent}%` }}
          className='bg-emerald-500 h-full rounded-full transition-all duration-300'
        />
      </div>

      {/* Main Question Card */}
      <motion.div
        key={currentQ.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className='bg-white border border-gray-200/90 rounded-3xl p-8 shadow-sm space-y-6'
      >
        <h2 className='text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug'>
          {currentQ.question}
        </h2>

        {/* Options */}
        <div className='space-y-3 pt-2'>
          {currentQ.options.map((opt, optIdx) => {
            const isSelected = selectedOpt === optIdx

            return (
              <button
                key={optIdx}
                onClick={() => handleSelect(optIdx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between text-sm ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-gray-800'
                }`}
              >
                <span className='flex items-center gap-3'>
                  <span className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{opt}</span>
                </span>

                {isSelected && (
                  <BsCheckCircleFill size={18} className='text-emerald-600 flex-shrink-0' />
                )}
              </button>
            )
          })}
        </div>

        {/* Bottom Navigation */}
        <div className='pt-6 border-t border-gray-100 flex items-center justify-between'>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className='flex items-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition disabled:cursor-not-allowed'
          >
            <BsChevronLeft size={14} />
            <span>Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs'
            >
              <span>Next Question</span>
              <BsChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className='flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs'
            >
              <BsSend size={14} />
              <span>Submit Quiz</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default QuizQuestionView
