import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BsX, BsTrash, BsExclamationTriangleFill } from 'react-icons/bs'

function ConfirmDeleteModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4'>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className='bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 max-w-md w-full border border-gray-200 dark:border-gray-800 shadow-2xl relative transition-colors duration-300'
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            disabled={loading}
            className='absolute top-5 right-5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1.5 rounded-xl transition cursor-pointer'
          >
            <BsX size={20} />
          </button>

          {/* Icon & Title */}
          <div className='space-y-4 mb-6'>
            <div className='w-12 h-12 bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center border border-rose-100 dark:border-rose-800/60 shadow-xs'>
              <BsTrash size={22} />
            </div>

            <div>
              <h3 className='text-xl font-extrabold text-gray-900 dark:text-white tracking-tight'>
                {title || 'Delete Item?'}
              </h3>
              <p className='text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed mt-1.5 font-normal'>
                {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={onCancel}
              disabled={loading}
              className='px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={onConfirm}
              disabled={loading}
              className='bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer transition shadow-md shadow-rose-600/20 inline-flex items-center gap-2'
            >
              {loading ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <BsTrash size={14} />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ConfirmDeleteModal
