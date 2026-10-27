import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  BsArrowLeft,
  BsCheckCircleFill,
  BsXCircleFill,
  BsArrowCounterclockwise,
  BsBook,
  BsTrophy,
} from 'react-icons/bs';

interface QuizResultViewProps {
  quizResult?: any;
  result?: any;
  onRetry?: () => void;
  onRetake?: () => void;
  onBack?: () => void;
}

function QuizResultView({ quizResult, result: propsResult, onRetry, onRetake, onBack }: QuizResultViewProps) {
  const navigate = useNavigate();

  const result = propsResult || quizResult || {
    id: 'quiz-1',
    title: 'React JS Concept Guide - Quiz',
    score: 1,
    totalQuestions: 5,
    accuracy: 20,
    questions: [
      {
        id: 1,
        question: 'Who developed React JS?',
        userAnswer: 0,
        correctAnswer: 2,
        options: ['Google', 'Microsoft', 'Facebook (now Meta)', 'Apple'],
        explanation: 'React JS was created by Jordan Walke at Facebook (now Meta) and open-sourced in 2013.',
      },
    ],
  };

  const retryHandler = onRetry || onRetake;
  const scorePercent = Math.round(((result.score || 0) / (result.totalQuestions || 1)) * 100);
  const wrongCount = (result.totalQuestions || 0) - (result.score || 0);

  let scoreMessage = 'Keep practicing!';
  let circleColor = 'text-rose-500 border-rose-500';
  if (scorePercent >= 80) {
    scoreMessage = 'Outstanding Job!';
    circleColor = 'text-emerald-500 border-emerald-500';
  } else if (scorePercent >= 50) {
    scoreMessage = 'Good Effort!';
    circleColor = 'text-amber-500 border-amber-500';
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Back button header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack || (() => navigate('/quizzes'))}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl cursor-pointer transition shadow-xs"
        >
          <BsArrowLeft size={16} />
          <span>Back to Quizzes</span>
        </button>

        <h2 className="text-xl font-extrabold text-gray-900 truncate max-w-sm">{result.title}</h2>

        <button
          onClick={retryHandler}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition shadow-xs"
        >
          <BsArrowCounterclockwise size={14} />
          <span>Retry Quiz</span>
        </button>
      </div>

      {/* Large Score Circle Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200/90 rounded-3xl p-8 text-center shadow-sm space-y-6 relative overflow-hidden"
      >
        {/* Large Score Circle */}
        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-32 h-32 rounded-full border-8 ${circleColor} flex items-center justify-center my-2 shadow-inner bg-gray-50/50`}
          >
            <span className="text-4xl font-extrabold tracking-tight">{scorePercent}%</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-2">{scoreMessage}</h3>
        </div>

        {/* Stats Summary Pills */}
        <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
          <span className="bg-gray-100 text-gray-700 font-bold text-xs px-4 py-2 rounded-full border border-gray-200 flex items-center gap-1.5">
            <BsTrophy size={14} className="text-gray-500" />
            {result.totalQuestions} Total
          </span>
          <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-2 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <BsCheckCircleFill size={14} className="text-emerald-500" />
            {result.score} Correct
          </span>
          <span className="bg-rose-50 text-rose-700 font-bold text-xs px-4 py-2 rounded-full border border-rose-200 flex items-center gap-1.5">
            <BsXCircleFill size={14} className="text-rose-500" />
            {wrongCount} Incorrect
          </span>
        </div>
      </motion.div>

      {/* Question Review Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <BsBook className="text-emerald-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Detailed Question Review</h3>
        </div>

        {(result.questions || []).map((q: any, index: number) => {
          const isUserCorrect = q.userAnswer === q.correctAnswer;

          return (
            <motion.div
              key={q.id || index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  Question {index + 1}
                </span>

                {isUserCorrect ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                    <BsCheckCircleFill size={12} className="text-emerald-500" />
                    Correct
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                    <BsXCircleFill size={12} className="text-rose-500" />
                    Incorrect
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{q.question}</h4>

              {/* Options Review */}
              <div className="space-y-2.5 pt-1">
                {(q.options || []).map((opt: string, optIdx: number) => {
                  const isCorrectOpt = optIdx === q.correctAnswer;
                  const isUserOpt = optIdx === q.userAnswer;

                  let style = 'bg-gray-50 text-gray-700 border-gray-200';
                  if (isCorrectOpt) {
                    style =
                      'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold ring-1 ring-emerald-300';
                  } else if (isUserOpt && !isCorrectOpt) {
                    style = 'bg-rose-50 text-rose-900 border-rose-300 font-semibold';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3.5 rounded-2xl border text-sm flex items-center justify-between ${style}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold bg-white text-gray-600 flex-shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </span>

                      {isCorrectOpt && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                          <BsCheckCircleFill size={11} /> Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {q.explanation && (
                <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 text-xs text-gray-700 space-y-1 mt-4">
                  <p className="font-bold text-gray-900 uppercase tracking-wider text-[10px] text-emerald-600">
                    EXPLANATION
                  </p>
                  <p className="leading-relaxed text-gray-600 font-normal">{q.explanation}</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default QuizResultView;
