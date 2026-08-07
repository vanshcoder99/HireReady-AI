import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import axios from 'axios'
import { 
  BsSend, 
  BsRobot, 
  BsPerson, 
  BsLightbulb
} from 'react-icons/bs'
import { ServerUrl } from '../../App'

const promptSuggestions = [
  "Summarize key technical points from this document",
  "Explain main concepts covered in simple terms",
  "Generate 5 mock placement interview questions from this document",
  "What are the core definitions and terms mentioned?",
]

interface ChatMessage {
  id: string | number;
  sender: string;
  text: string;
  timestamp: string;
}

function DocumentChatTab({ doc }: { doc?: any }) {
  const docId = doc?._id || doc?.id;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I'm your OpenRouter AI assistant for "${doc?.title || 'this document'}". Ask me anything about its contents, code snippets, key points, or interview questions.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (textToSend = input) => {
    const messageText = typeof textToSend === 'string' ? textToSend.trim() : input.trim()
    if (!messageText || isTyping) return

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      if (docId) {
        const res = await axios.post(
          `${ServerUrl}/api/document/${docId}/chat`,
          { message: messageText },
          { withCredentials: true }
        )

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: res.data.reply || 'No response received.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, aiMsg])
      } else {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'ai',
              text: `Based on your document, here are the key insights:\n1. Core concepts are structured clearly.\n2. Focus on fundamental principles for interviews.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ])
          setIsTyping(false)
        }, 1000)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'Sorry, I encountered an error communicating with the AI service. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className='flex flex-col h-[700px] bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-sm overflow-hidden relative transition-colors duration-300'>
      {/* Header bar */}
      <div className='bg-gray-50 dark:bg-gray-950 border-b border-gray-200/90 dark:border-gray-800 px-6 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 bg-black dark:bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-xs'>
            <BsRobot size={18} />
          </div>
          <div>
            <h3 className='font-extrabold text-gray-900 dark:text-white text-sm'>AI Document Assistant</h3>
            <p className='text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
              OpenRouter Powered • {doc?.title || 'Document'}
            </p>
          </div>
        </div>

        <span className='text-xs bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/80 font-bold'>
          OpenRouter AI
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className='flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/50 dark:bg-gray-950/40'>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-black dark:bg-emerald-600 text-white' : 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <BsPerson size={16} /> : <BsRobot size={16} />}
            </div>

            <div
              className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200/90 dark:border-gray-700/80 rounded-tl-none shadow-xs'
              }`}
            >
              <div className='whitespace-pre-line font-normal'>{msg.text}</div>
              <span
                className={`text-[10px] block mt-2 ${
                  msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-gray-400 dark:text-gray-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-xs'>
              <BsRobot size={16} />
            </div>
            <div className='bg-white dark:bg-gray-800 border border-gray-200/90 dark:border-gray-700/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs flex items-center gap-1.5'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full animate-bounce' style={{ animationDelay: '0ms' }} />
              <span className='w-2 h-2 bg-emerald-500 rounded-full animate-bounce' style={{ animationDelay: '150ms' }} />
              <span className='w-2 h-2 bg-emerald-500 rounded-full animate-bounce' style={{ animationDelay: '300ms' }} />
              <span className='text-xs text-gray-400 dark:text-gray-400 font-medium ml-2'>OpenRouter AI is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      {messages.length < 4 && (
        <div className='px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 overflow-x-auto text-xs'>
          <span className='text-gray-400 dark:text-gray-400 flex items-center gap-1 font-semibold flex-shrink-0'>
            <BsLightbulb className='text-amber-500' size={14} /> Suggestions:
          </span>
          {promptSuggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className='bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/80 hover:text-emerald-700 dark:hover:text-emerald-300 text-gray-700 dark:text-gray-300 px-3.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition border border-gray-200/80 dark:border-gray-700 flex-shrink-0 font-medium'
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Bar */}
      <div className='p-4 bg-white dark:bg-gray-900 border-t border-gray-200/90 dark:border-gray-800 sticky bottom-0'>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className='flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl px-4 py-3 transition-all'
        >
          <input
            type='text'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ask OpenRouter AI about this document...'
            disabled={isTyping}
            className='flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none'
          />
          <button
            type='submit'
            disabled={!input.trim() || isTyping}
            className='bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white p-2.5 rounded-xl cursor-pointer transition shadow-xs disabled:cursor-not-allowed'
          >
            <BsSend size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default DocumentChatTab
