import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import axios from 'axios'
import { 
  BsFileEarmarkText, 
  BsLightbulb, 
  BsKey, 
  BsJournalText, 
  BsDiagram3, 
  BsArrowRight,
  BsX,
  BsCheck2,
  BsCopy,
  BsArrowRepeat
} from 'react-icons/bs'
import { ServerUrl } from '../../App'

const actionsList = [
  {
    id: 'summary',
    title: 'Generate Summary',
    desc: 'Extract a concise executive summary and key interview takeaways from the entire document.',
    icon: <BsFileEarmarkText size={22} />,
    color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    resultTitle: 'Executive Document Summary',
  },
  {
    id: 'explain',
    title: 'Explain Concepts',
    desc: 'Break down complex technical jargon, syntax, and algorithms into plain-English explanations.',
    icon: <BsLightbulb size={22} />,
    color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    resultTitle: 'Concept Explanation Breakdown',
  },
  {
    id: 'keywords',
    title: 'Extract Keywords',
    desc: 'Pull out core technical keywords, tools, and libraries mentioned throughout the document.',
    icon: <BsKey size={22} />,
    color: 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    resultTitle: 'Extracted Technical Keywords',
  },
  {
    id: 'notes',
    title: 'Generate Study Notes',
    desc: 'Turn raw document content into bullet-point structured revision notes for quick exam prep.',
    icon: <BsJournalText size={22} />,
    color: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    resultTitle: 'Structured Revision Notes',
  },
  {
    id: 'mindmap',
    title: 'Generate Mind Map',
    desc: 'Visual outline flowchart of document topics and interconnections.',
    icon: <BsDiagram3 size={22} />,
    color: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    resultTitle: 'Document Mind Map Outline',
  },
]

function DocumentActionsTab({ doc }) {
  const docId = doc?._id || doc?.id
  const [activeAction, setActiveAction] = useState(null)
  const [actionOutput, setActionOutput] = useState('')
  const [loadingAction, setLoadingAction] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleRunAction = async (action) => {
    setLoadingAction(action.id)
    try {
      if (docId) {
        const res = await axios.post(
          `${ServerUrl}/api/document/${docId}/action`,
          { action: action.id },
          { withCredentials: true }
        )
        setActionOutput(res.data.result || 'No output generated.')
      } else {
        setActionOutput(`Simulated AI output for ${action.title}:\n• Technical concept breakdown ready.\n• Verified for placement interview preparation.`)
      }
      setActiveAction(action)
    } catch (error) {
      console.error('Run action error:', error)
      alert(error.response?.data?.message || 'Failed to run AI action.')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='space-y-6'>
      {/* Intro Header */}
      <div className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300'>
        <div>
          <h3 className='font-bold text-gray-900 dark:text-white text-lg'>AI Automated Actions</h3>
          <p className='text-gray-500 dark:text-gray-400 text-sm mt-0.5'>
            One-click AI tools powered by OpenRouter to process and extract insights from <span className='font-semibold text-emerald-600 dark:text-emerald-400'>{doc?.title || 'Document'}</span>.
          </p>
        </div>
        <span className='text-xs bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/80 flex-shrink-0'>
          5 AI Tools
        </span>
      </div>

      {/* Action Cards Grid */}
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        {actionsList.map((action) => {
          const isLoading = loadingAction === action.id
          return (
            <motion.div
              key={action.id}
              whileHover={{ y: -4, boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.08)' }}
              className='bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between relative group'
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${action.color}`}>
                  {action.icon}
                </div>
                <h4 className='font-bold text-gray-900 dark:text-white text-base mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors'>{action.title}</h4>
                <p className='text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 font-normal'>{action.desc}</p>
              </div>

              <button
                disabled={isLoading}
                onClick={() => handleRunAction(action)}
                className={`w-full py-2.5 px-4 rounded-2xl text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 ${action.buttonColor} disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <BsArrowRepeat size={16} className='animate-spin' />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <span>Run AI Action</span>
                    <BsArrowRight size={15} />
                  </>
                )}
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Interactive Action Output Modal */}
      <AnimatePresence>
        {activeAction && (
          <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-7 border border-gray-200 dark:border-gray-800 shadow-2xl relative transition-colors duration-300'
            >
              <div className='flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4'>
                <div className='flex items-center gap-3'>
                  <div className={`p-2.5 rounded-2xl border ${activeAction.color}`}>
                    {activeAction.icon}
                  </div>
                  <div>
                    <h3 className='font-bold text-gray-900 dark:text-white text-lg'>{activeAction.resultTitle}</h3>
                    <p className='text-xs text-gray-400 dark:text-gray-400'>OpenRouter AI Result for {doc?.title || 'Document'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveAction(null)}
                  className='p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition'
                >
                  <BsX size={20} />
                </button>
              </div>

              {/* Output Display Box */}
              <div className='bg-gray-50 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-5 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-normal whitespace-pre-line max-h-96 overflow-y-auto mb-6'>
                {actionOutput}
              </div>

              {/* Modal Actions */}
              <div className='flex justify-between items-center'>
                <button
                  onClick={() => handleCopy(actionOutput)}
                  className='flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-gray-100 dark:bg-gray-800 px-3.5 py-2 rounded-xl cursor-pointer transition'
                >
                  {copied ? <BsCheck2 size={14} className='text-emerald-600 dark:text-emerald-400' /> : <BsCopy size={13} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => setActiveAction(null)}
                  className='bg-black dark:bg-emerald-600 hover:bg-gray-900 dark:hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer transition'
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DocumentActionsTab
