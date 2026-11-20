import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../redux/userSlice';
import { RootState } from '../redux/store';
import {
  BsCheck2Square,
  BsSquare,
  BsBoxArrowUpRight,
  BsLightbulb,
  BsSearch,
  BsFilter,
  BsArrowRepeat,
  BsRobot,
  BsSend,
  BsCheckCircleFill,
  BsX,
  BsChevronDown,
  BsChevronUp,
  BsCheckLg,
  BsFire,
  BsTrophy,
  BsBook,
  BsStars,
  BsCodeSlash,
  BsCopy,
  BsQuestionDiamond,
  BsCoin,
} from 'react-icons/bs';
import { ServerUrl } from '../App';
import { BLIND_75_QUESTIONS, BLIND_75_CATEGORIES, Blind75Question } from '../data/blind75Data';

const STORAGE_KEY = 'hireready_blind75_completed_v1';

function Blind75() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.user);
  const userCredits = userData?.credits ?? 0;
  const isLoggedIn = !!userData;

  // Completed questions state stored in localStorage
  const [completedIds, setCompletedIds] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All'); // 'All' | 'Completed' | 'Incomplete'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Active Question for AI Hints & Guidance Modal
  const [activeQuestion, setActiveQuestion] = useState<Blind75Question | null>(null);
  const [revealedHint1, setRevealedHint1] = useState(false);
  const [revealedHint2, setRevealedHint2] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [aiGuidance, setAiGuidance] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync completed state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedIds));
    } catch (err) {
      console.error('Failed to save Blind 75 progress to localStorage:', err);
    }
  }, [completedIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle completion status for a question
  const toggleQuestionComplete = (id: number, title: string) => {
    setCompletedIds((prev) => {
      const isCompleted = prev.includes(id);
      const next = isCompleted ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(isCompleted ? `Marked "${title}" as incomplete` : `🎉 Completed "${title}"!`);
      return next;
    });
  };

  // Reset all progress confirmation
  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all your Blind 75 progress?')) {
      setCompletedIds([]);
      showToast('All Blind 75 progress has been reset.');
    }
  };

  // Open AI Hints modal for a question
  const handleOpenAiHints = (q: Blind75Question) => {
    setActiveQuestion(q);
    setRevealedHint1(false);
    setRevealedHint2(false);
    setAiGuidance(null);
    setCustomQuery('');
  };

  // Request Dynamic AI Guidance from backend (Costs 50 credits)
  const fetchDynamicGuidance = async (specificQuery?: string) => {
    if (!activeQuestion) return;

    if (!isLoggedIn) {
      showToast('⚠️ Please log in to chat with HireReady AI (50 credits required).');
      navigate('/auth?mode=signin');
      return;
    }

    if (userCredits < 50) {
      showToast(`⚠️ Low credits! 50 credits required for AI Chat (Current balance: ${userCredits}).`);
      navigate('/pricing');
      return;
    }

    setLoadingAi(true);
    setAiGuidance(null);

    const promptText = specificQuery || customQuery;

    try {
      const res = await axios.post(
        `${ServerUrl}/api/ai/blind75-guidance`,
        {
          questionTitle: activeQuestion.title,
          questionNumber: activeQuestion.leetcodeNumber,
          category: activeQuestion.category,
          difficulty: activeQuestion.difficulty,
          userQuery: promptText || undefined,
        },
        { withCredentials: true, timeout: 20000 }
      );

      if (res.data?.guidance) {
        setAiGuidance(res.data.guidance);
        if (typeof res.data.creditsLeft === 'number') {
          dispatch(setUserData({ ...userData, credits: res.data.creditsLeft }));
          showToast(`✨ 50 credits deducted. Remaining balance: ${res.data.creditsLeft}`);
        }
      } else {
        throw new Error('No guidance in response');
      }
    } catch (err: any) {
      console.warn('Backend AI guidance request failed:', err);
      if (err.response?.status === 400 && err.response?.data?.message?.includes('credits')) {
        const errorMsg = err.response.data.message || 'Not enough credits. Minimum 50 credits required.';
        showToast(errorMsg);
        setAiGuidance(`⚠️ **Insufficient Credits**: ${errorMsg}\n\nPlease visit the **Pricing** page to recharge credits.`);
      } else if (err.response?.status === 401) {
        showToast('Please log in to use AI Guidance (50 credits required).');
        navigate('/auth?mode=signin');
      } else {
        // Fallback guidance
        setAiGuidance(
          `### 💡 ${activeQuestion.title} — AI Interview Guide\n\n` +
            `**Core Pattern**: ${activeQuestion.optimalApproach}\n\n` +
            `**Optimal Target**:\n` +
            `- Time Complexity: **${activeQuestion.timeComplexity}**\n` +
            `- Space Complexity: **${activeQuestion.spaceComplexity}**\n\n` +
            `**Step-by-Step Approach**:\n` +
            `1. **Analyze Constraints**: Check for sorted properties, duplicate values, and negative inputs.\n` +
            `2. **Choose Optimal Data Structure**: Utilize the **${activeQuestion.optimalApproach}** technique to avoid naive brute-force.\n` +
            `3. **Key Edge Cases**: Guard against empty inputs, single element lists, overflow, and boundary index traps.\n\n` +
            `*HireReady AI Tip*: Explain your trade-offs clearly to your interviewer before writing a single line of code!`
        );
      }
    } finally {
      setLoadingAi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered Questions calculation
  const filteredQuestions = useMemo(() => {
    return BLIND_75_QUESTIONS.filter((q) => {
      // Category filter
      if (selectedCategory !== 'All' && q.category !== selectedCategory) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) {
        return false;
      }
      // Completion filter
      const isDone = completedIds.includes(q.id);
      if (selectedStatus === 'Completed' && !isDone) return false;
      if (selectedStatus === 'Incomplete' && isDone) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesNumber = q.leetcodeNumber.toString().includes(query);
        const matchesCategory = q.category.toLowerCase().includes(query);
        const matchesTag = q.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesNumber && !matchesCategory && !matchesTag) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, selectedDifficulty, selectedStatus, searchQuery, completedIds]);

  // Group filtered questions by category
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, Blind75Question[]> = {};
    filteredQuestions.forEach((q) => {
      if (!groups[q.category]) {
        groups[q.category] = [];
      }
      groups[q.category].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  // Overall Statistics
  const totalQuestions = BLIND_75_QUESTIONS.length;
  const completedCount = completedIds.length;
  const progressPercent = Math.round((completedCount / totalQuestions) * 100);

  const easyTotal = BLIND_75_QUESTIONS.filter((q) => q.difficulty === 'Easy').length;
  const easyCompleted = BLIND_75_QUESTIONS.filter(
    (q) => q.difficulty === 'Easy' && completedIds.includes(q.id)
  ).length;

  const mediumTotal = BLIND_75_QUESTIONS.filter((q) => q.difficulty === 'Medium').length;
  const mediumCompleted = BLIND_75_QUESTIONS.filter(
    (q) => q.difficulty === 'Medium' && completedIds.includes(q.id)
  ).length;

  const hardTotal = BLIND_75_QUESTIONS.filter((q) => q.difficulty === 'Hard').length;
  const hardCompleted = BLIND_75_QUESTIONS.filter(
    (q) => q.difficulty === 'Hard' && completedIds.includes(q.id)
  ).length;

  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80 shadow-2xs">
            Easy
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/80 shadow-2xs">
            Medium
          </span>
        );
      case 'Hard':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80 shadow-2xs">
            Hard
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold border border-gray-700 dark:border-gray-200"
          >
            <BsCheckCircleFill className="text-emerald-500" size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner & Stats */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-gray-900 dark:from-emerald-950 dark:via-gray-900 dark:to-gray-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-emerald-500/10 border border-white/20 dark:border-emerald-500/20 text-xs font-bold tracking-wide uppercase">
              <BsFire className="text-amber-400" /> Curated LeetCode Collection
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Blind 75 LeetCode Sheet
            </h1>
            <p className="text-sm md:text-base text-emerald-100 dark:text-gray-300 leading-relaxed">
              Master the essential 75 coding interview patterns asked by FAANG & top tech enterprises.
              Click any question to solve directly on LeetCode, track completion, and tap <span className="font-semibold text-amber-300">💡 AI Hints & Guidance</span> for step-by-step intuition without spoilers.
            </p>
          </div>

          {/* Quick Progress Cards */}
          <div className="bg-white/10 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-5 border border-white/20 dark:border-gray-700/60 flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[280px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-200 dark:text-gray-400 font-bold">
                  Total Solved
                </p>
                <p className="text-2xl font-black">
                  {completedCount}{' '}
                  <span className="text-sm font-semibold text-emerald-200/80 dark:text-gray-400">
                    / {totalQuestions}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-300">{progressPercent}%</span>
                <p className="text-xs text-emerald-200/80 dark:text-gray-400 font-medium">Ready</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/20 dark:bg-gray-900/60 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Difficulty Breakdown Pill Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-emerald-500/20 rounded-lg py-1 px-2 border border-emerald-400/30">
                <p className="text-[10px] uppercase font-bold text-emerald-200">Easy</p>
                <p className="text-xs font-bold">
                  {easyCompleted}/{easyTotal}
                </p>
              </div>
              <div className="bg-amber-500/20 rounded-lg py-1 px-2 border border-amber-400/30">
                <p className="text-[10px] uppercase font-bold text-amber-200">Medium</p>
                <p className="text-xs font-bold">
                  {mediumCompleted}/{mediumTotal}
                </p>
              </div>
              <div className="bg-rose-500/20 rounded-lg py-1 px-2 border border-rose-400/30">
                <p className="text-[10px] uppercase font-bold text-rose-200">Hard</p>
                <p className="text-xs font-bold">
                  {hardCompleted}/{hardTotal}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by problem name, #, or tag..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <BsX size={18} />
              </button>
            )}
          </div>

          {/* Difficulty & Status Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
              className="text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-2 px-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy Only</option>
              <option value="Medium">Medium Only</option>
              <option value="Hard">Hard Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
              className="text-xs font-semibold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-2 px-3 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed Only</option>
              <option value="Incomplete">Incomplete Only</option>
            </select>

            {/* Reset Button */}
            {completedCount > 0 && (
              <button
                onClick={handleResetProgress}
                title="Reset completed checkmarks"
                className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-800 transition cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Scrolling Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {BLIND_75_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-black text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Sheet Grouped by Categories */}
      {Object.keys(groupedQuestions).length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <BsQuestionDiamond size={24} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
            No questions match your current filters
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Try adjusting your search terms, difficulty, or category filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedDifficulty('All');
              setSelectedStatus('All');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedQuestions).map(([category, questions]) => {
            const isCollapsed = !!collapsedCategories[category];
            const categoryCompletedCount = questions.filter((q) =>
              completedIds.includes(q.id)
            ).length;
            const categoryPercent = Math.round(
              (categoryCompletedCount / questions.length) * 100
            );

            return (
              <div
                key={category}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/90 dark:border-gray-800/90 shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Category Header */}
                <div
                  onClick={() => toggleCategoryCollapse(category)}
                  className="px-5 py-3.5 bg-gray-50/80 dark:bg-gray-800/40 border-b border-gray-200/80 dark:border-gray-800/80 flex items-center justify-between cursor-pointer select-none hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm md:text-base text-gray-900 dark:text-gray-100">
                      {category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                      {categoryCompletedCount} / {questions.length} completed ({categoryPercent}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Category mini progress bar */}
                    <div className="hidden sm:block w-24 bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${categoryPercent}%` }}
                      />
                    </div>
                    {isCollapsed ? (
                      <BsChevronDown size={15} className="text-gray-400" />
                    ) : (
                      <BsChevronUp size={15} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Question Items Table / Rows */}
                {!isCollapsed && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/70">
                    {questions.map((q) => {
                      const isCompleted = completedIds.includes(q.id);

                      return (
                        <div
                          key={q.id}
                          className={`px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                            isCompleted
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/15'
                              : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/30'
                          }`}
                        >
                          {/* Left: Completion Toggle, Question # and Title */}
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            {/* Tick & Black/Dark Toggle Button */}
                            <button
                              onClick={() => toggleQuestionComplete(q.id, q.title)}
                              title={
                                isCompleted
                                  ? 'Mark question as incomplete'
                                  : 'Mark question as completed'
                              }
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer flex-shrink-0 mt-0.5 sm:mt-0 ${
                                isCompleted
                                  ? 'bg-black text-white dark:bg-emerald-500 dark:text-black shadow-xs ring-2 ring-black/20 dark:ring-emerald-500/40'
                                  : 'border-2 border-gray-300 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-400 bg-white dark:bg-gray-800'
                              }`}
                            >
                              {isCompleted && <BsCheckLg size={13} className="font-extrabold stroke-1" />}
                            </button>

                            {/* Question Title & Number */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500">
                                  #{q.leetcodeNumber}
                                </span>

                                <a
                                  href={q.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open question on LeetCode in a new tab"
                                  className={`text-sm font-bold transition-all hover:underline flex items-center gap-1.5 group ${
                                    isCompleted
                                      ? 'line-through text-gray-400 dark:text-gray-500'
                                      : 'text-gray-900 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400'
                                  }`}
                                >
                                  <span>{q.title}</span>
                                  <BsBoxArrowUpRight
                                    size={12}
                                    className="opacity-40 group-hover:opacity-100 transition-opacity"
                                  />
                                </a>

                                {getDifficultyBadge(q.difficulty)}
                              </div>

                              {/* Tags & Approach hint preview */}
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Approach:
                                  </span>{' '}
                                  {q.optimalApproach}
                                </span>
                                <span className="text-gray-300 dark:text-gray-700">•</span>
                                <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                  Time: {q.timeComplexity} | Space: {q.spaceComplexity}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions (Direct LeetCode Link & AI Hints Button) */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Direct LeetCode Link Button */}
                            <a
                              href={q.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 border border-gray-200 dark:border-gray-700 transition cursor-pointer shadow-2xs"
                            >
                              <span>LeetCode</span>
                              <BsBoxArrowUpRight size={11} />
                            </a>

                            {/* AI Hints & Guidance Trigger */}
                            <button
                              onClick={() => handleOpenAiHints(q)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 hover:scale-102 transition cursor-pointer shadow-2xs"
                            >
                              <BsLightbulb size={13} className="text-amber-500" />
                              <span>AI Hints & Guide</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Hints & Dynamic Guidance Modal / Drawer */}
      <AnimatePresence>
        {activeQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveQuestion(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="bg-emerald-600 text-white p-2 rounded-xl">
                    <BsRobot size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-gray-900 dark:text-white">
                        {activeQuestion.title}
                      </span>
                      {getDifficultyBadge(activeQuestion.difficulty)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      LeetCode #{activeQuestion.leetcodeNumber} • {activeQuestion.category}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveQuestion(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  <BsX size={22} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* External Link Notice */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs">
                  <span>Want to solve right now? Open the official problem on LeetCode:</span>
                  <a
                    href={activeQuestion.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-amber-700 dark:text-amber-300 hover:underline inline-flex items-center gap-1 ml-2 flex-shrink-0"
                  >
                    Solve on LeetCode <BsBoxArrowUpRight size={11} />
                  </a>
                </div>

                {/* Progressive Hint 1 (Intuition & Pattern) */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/60 dark:bg-gray-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        Hint 1
                      </span>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        Core Intuition & High-Level Pattern
                      </h4>
                    </div>
                    <button
                      onClick={() => setRevealedHint1(!revealedHint1)}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {revealedHint1 ? 'Hide Hint' : '👁️ Reveal Hint 1'}
                    </button>
                  </div>

                  {revealedHint1 ? (
                    <motion.p
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-2 border-t border-gray-200/60 dark:border-gray-700/60"
                    >
                      {activeQuestion.hint1}
                    </motion.p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                      Click reveal to get a gentle conceptual nudge without spoiling the algorithm.
                    </p>
                  )}
                </div>

                {/* Progressive Hint 2 (Algorithm, Data Structure & Edge Cases) */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-4 bg-gray-50/60 dark:bg-gray-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                        Hint 2
                      </span>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        Algorithm, Data Structure & Complexity
                      </h4>
                    </div>
                    <button
                      onClick={() => setRevealedHint2(!revealedHint2)}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {revealedHint2 ? 'Hide Hint' : '👁️ Reveal Hint 2'}
                    </button>
                  </div>

                  {revealedHint2 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {activeQuestion.hint2}
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          <strong className="text-gray-700 dark:text-gray-200">Optimal:</strong>{' '}
                          {activeQuestion.optimalApproach}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-gray-700 dark:text-gray-200">Target Time:</strong>{' '}
                          {activeQuestion.timeComplexity}
                        </span>
                        <span>•</span>
                        <span>
                          <strong className="text-gray-700 dark:text-gray-200">Space:</strong>{' '}
                          {activeQuestion.spaceComplexity}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                      Click reveal to see the recommended data structures and complexity targets.
                    </p>
                  )}
                </div>

                {/* Dynamic AI Guidance Section */}
                <div className="border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-emerald-200/50 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2">
                      <BsStars className="text-emerald-600 dark:text-emerald-400" size={17} />
                      <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
                        Dynamic HireReady AI Deep Dive
                      </h4>
                    </div>

                    {/* Credit Cost & Balance Badge */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 shadow-2xs">
                        <BsCoin size={12} className="text-amber-600 dark:text-amber-400" />
                        50 Credits / Query
                      </span>
                      {isLoggedIn && (
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Balance:{' '}
                          <span
                            className={`font-bold ${
                              userCredits < 50
                                ? 'text-rose-500'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {userCredits}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Warning if Not Logged In or Low Credits */}
                  {!isLoggedIn ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs">
                      <span className="text-amber-800 dark:text-amber-300 font-medium">
                        Log in to ask questions and receive dynamic AI guidance (50 credits per query).
                      </span>
                      <button
                        onClick={() => navigate('/auth?mode=signin')}
                        className="ml-2 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex-shrink-0 cursor-pointer"
                      >
                        Log In
                      </button>
                    </div>
                  ) : userCredits < 50 ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs">
                      <span className="text-rose-800 dark:text-rose-300 font-medium">
                        Insufficient credits ({userCredits} available). 50 credits needed for AI guidance.
                      </span>
                      <button
                        onClick={() => navigate('/pricing')}
                        className="ml-2 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition flex-shrink-0 cursor-pointer"
                      >
                        Buy Credits
                      </button>
                    </div>
                  ) : null}

                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Need customized interview guidance? Click a quick-prompt below or ask a specific doubt (uses 50 credits):
                  </p>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => fetchDynamicGuidance('Walk me through the optimal approach step-by-step')}
                      disabled={loadingAi || (isLoggedIn && userCredits < 50)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      🚀 Explain Optimal Approach (50 credits)
                    </button>
                    <button
                      onClick={() => fetchDynamicGuidance('What edge cases commonly trip up candidates on this question?')}
                      disabled={loadingAi || (isLoggedIn && userCredits < 50)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⚠️ Common Edge Cases (50 credits)
                    </button>
                    <button
                      onClick={() => fetchDynamicGuidance('Provide clean structured pseudocode without giving full solution code.')}
                      disabled={loadingAi || (isLoggedIn && userCredits < 50)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📝 Pseudocode Strategy (50 credits)
                    </button>
                  </div>

                  {/* Free-form Query Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customQuery.trim() && !loadingAi) {
                          fetchDynamicGuidance();
                        }
                      }}
                      placeholder="Ask anything (e.g. Can I do this with O(1) space?)"
                      className="flex-1 text-xs py-2 px-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => fetchDynamicGuidance()}
                      disabled={loadingAi || (isLoggedIn && userCredits < 50)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingAi ? (
                        <>
                          <BsArrowRepeat className="animate-spin" size={13} />
                          <span>Thinking...</span>
                        </>
                      ) : (
                        <>
                          <BsSend size={12} />
                          <span>Ask AI (50 credits)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dynamic Guidance Output Box */}
                  {aiGuidance && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-emerald-200 dark:border-emerald-800/70 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <BsStars size={13} /> AI Mentor Response
                        </span>
                        <button
                          onClick={() => copyToClipboard(aiGuidance)}
                          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                        >
                          {copied ? (
                            <span className="text-emerald-600 font-bold">Copied!</span>
                          ) : (
                            <>
                              <BsCopy size={11} /> Copy
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2 whitespace-pre-line leading-relaxed font-sans">
                        {aiGuidance}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => toggleQuestionComplete(activeQuestion.id, activeQuestion.title)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer ${
                    completedIds.includes(activeQuestion.id)
                      ? 'bg-black text-white dark:bg-emerald-500 dark:text-black'
                      : 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <BsCheckLg size={13} />
                  <span>
                    {completedIds.includes(activeQuestion.id)
                      ? 'Completed (Click to Unmark)'
                      : 'Mark as Completed'}
                  </span>
                </button>

                <a
                  href={activeQuestion.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <span>Go to LeetCode</span>
                  <BsBoxArrowUpRight size={12} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Blind75;
