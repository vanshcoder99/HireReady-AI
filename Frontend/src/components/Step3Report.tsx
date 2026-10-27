import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuestionScore {
  question: string;
  score: number;
  feedback?: string;
}

interface Step3ReportProps {
  report: {
    finalScore?: number;
    confidence?: number;
    communication?: number;
    correctness?: number;
    questionWiseScore?: QuestionScore[];
  };
}

function Step3Report({ report }: Step3ReportProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const from = location.state?.from || '/history';
  const handleBack = () => {
    navigate(from, { state: { from: location.state?.previousFrom } });
  };

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-white">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Loading Report...</p>
      </div>
    );
  }

  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0,
  }));

  const skills = [
    { label: 'Confidence', value: confidence },
    { label: 'Communication', value: communication },
    { label: 'Correctness', value: correctness },
  ];

  let performanceText = '';
  let shortTagline = '';

  if (finalScore >= 8) {
    performanceText = 'Ready for job opportunities.';
    shortTagline = 'Excellent clarity and structured response.';
  } else if (finalScore >= 5) {
    performanceText = 'Needs minor improvement before interviews.';
    shortTagline = 'Good foundation, refine articulation.';
  } else {
    performanceText = 'Significant improvement required.';
    shortTagline = 'Work on clarity and confidence.';
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;

  const getScoreColor = (val: number) => {
    if (val >= 8) return '#10b981';
    if (val >= 5) return '#f59e0b';
    return '#ef4444';
  };

  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let currentY = 25;

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text('AI Interview Performance Report', pageWidth / 2, currentY, {
      align: 'center',
    });

    currentY += 5;
    doc.setDrawColor(34, 197, 94);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, 'F');

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Final Score: ${finalScore}/10`, pageWidth / 2, currentY + 12, { align: 'center' });

    currentY += 30;
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, 'F');

    doc.setFontSize(12);
    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45;
    let advice = '';
    if (finalScore >= 8) {
      advice = 'Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.';
    } else if (finalScore >= 5) {
      advice = 'Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.';
    } else {
      advice = 'Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.';
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(220);
    doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

    doc.setFont('helvetica', 'bold');
    doc.text('Professional Advice', margin + 10, currentY + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
    doc.text(splitAdvice, margin + 10, currentY + 20);

    currentY += 50;

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Question', 'Score', 'Feedback']],
      body: questionWiseScore.map((q, i) => [
        `${i + 1}`,
        q.question,
        `${q.score}/10`,
        q.feedback || '',
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 5,
        valign: 'top',
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 55 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 'auto' },
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    doc.save('AI_Interview_Report.pdf');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] text-gray-900 dark:text-white px-4 sm:px-6 py-8 lg:px-10 transition-colors duration-300">
      {/* Header Bar */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full flex items-start gap-4">
          <button
            onClick={handleBack}
            className="mt-1 p-3 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200/90 dark:border-gray-800 shadow-xs hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex-shrink-0"
            title={from === '/analytics' ? 'Back to Analytics' : 'Back to Interview History'}
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Interview Analytics Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs sm:text-sm">
              AI-powered performance insights & comprehensive score analysis
            </p>
          </div>
        </div>

        <button
          onClick={downloadPDF}
          className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base whitespace-nowrap flex-shrink-0"
        >
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Overall Performance & Skill Evaluation */}
        <div className="space-y-6">
          {/* Overall Performance Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 text-center transition-colors duration-300"
          >
            <h3 className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Overall Performance
            </h3>
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: '18px',
                  pathColor: getScoreColor(score),
                  textColor: getScoreColor(score),
                  trailColor: isDarkTheme ? '#1f2937' : '#e5e7eb',
                })}
              />
            </div>

            <div className="mt-5">
              <p className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg">
                {performanceText}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">{shortTagline}</p>
            </div>
          </motion.div>

          {/* Skill Evaluation Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 transition-colors duration-300"
          >
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-6">
              Skill Evaluation
            </h3>

            <div className="space-y-5">
              {skills.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2 text-xs sm:text-sm font-semibold">
                    <span className="text-gray-700 dark:text-gray-200">{s.label}</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{s.value}</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 rounded-full h-full transition-all duration-500"
                      style={{ width: `${(s.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Performance Trend & Question Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Trend Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-8 transition-colors duration-300"
          >
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Performance Trend
            </h3>

            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkTheme ? '#1f2937' : '#e5e7eb'} />
                  <XAxis
                    dataKey="name"
                    stroke={isDarkTheme ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: isDarkTheme ? '#9ca3af' : '#4b5563', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke={isDarkTheme ? '#9ca3af' : '#6b7280'}
                    tick={{ fill: isDarkTheme ? '#9ca3af' : '#4b5563', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkTheme ? '#111827' : '#ffffff',
                      borderColor: isDarkTheme ? '#374151' : '#e5e7eb',
                      borderRadius: '12px',
                      color: isDarkTheme ? '#f3f4f6' : '#111827',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    fill="url(#scoreGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Question Breakdown Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-2xl sm:rounded-3xl shadow-sm p-5 sm:p-8 transition-colors duration-300"
          >
            <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-6">
              Question Breakdown
            </h3>

            <div className="space-y-5">
              {questionWiseScore.map((q, i) => (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-gray-800/60 p-5 sm:p-6 rounded-2xl border border-gray-200/90 dark:border-gray-700/80 space-y-4 transition-colors shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                        Question {i + 1}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-relaxed mt-1">
                        {q.question || 'Question not available'}
                      </p>
                    </div>

                    <div className="bg-emerald-100 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 px-3.5 py-1 rounded-full font-extrabold text-xs sm:text-sm w-fit flex-shrink-0">
                      {q.score ?? 0}/10
                    </div>
                  </div>

                  <div className="bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 p-4 rounded-xl space-y-1">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                      <span>AI Feedback</span>
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                      {q.feedback && q.feedback.trim() !== ''
                        ? q.feedback
                        : 'No feedback available for this question.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Step3Report;

