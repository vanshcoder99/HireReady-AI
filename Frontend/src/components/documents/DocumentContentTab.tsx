import React, { useState } from 'react'
import { motion } from 'motion/react'
import { 
  BsZoomIn, 
  BsZoomOut, 
  BsBoxArrowUpRight, 
  BsChevronLeft, 
  BsChevronRight,
  BsFileEarmarkPdf,
  BsArrowCounterclockwise
} from 'react-icons/bs'
import { ServerUrl } from '../../App'

function DocumentContentTab({ doc }) {
  const [zoom, setZoom] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = doc?.pageCount || doc?.pages || 1

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))
  const handleResetZoom = () => setZoom(100)

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))

  const handleOpenNewTab = () => {
    if (doc?.fileUrl) {
      window.open(`${ServerUrl}${doc.fileUrl}`, '_blank')
    } else {
      alert('Original file download unavailable.')
    }
  }

  const extractedText = doc?.extractedText || 'Content extracted from document.'

  return (
    <div className='flex flex-col h-[750px] bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-xl relative'>
      {/* Sticky Top Toolbar */}
      <div className='sticky top-0 z-30 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white'>
        {/* Document info */}
        <div className='flex items-center gap-2.5 min-w-0'>
          <div className='p-1.5 bg-rose-500/20 text-rose-400 rounded-lg'>
            <BsFileEarmarkPdf size={18} />
          </div>
          <span className='font-semibold text-sm truncate max-w-[200px] sm:max-w-xs'>
            {doc?.title || 'Document.pdf'}
          </span>
        </div>

        {/* Page Navigation Controls */}
        <div className='flex items-center gap-2 bg-gray-800/80 px-3 py-1.5 rounded-xl border border-gray-700/60 text-xs'>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className='p-1 hover:bg-gray-700 rounded-md disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition'
            title='Previous Page'
          >
            <BsChevronLeft size={13} />
          </button>

          <span className='font-medium text-gray-300 px-1'>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className='p-1 hover:bg-gray-700 rounded-md disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition'
            title='Next Page'
          >
            <BsChevronRight size={13} />
          </button>
        </div>

        {/* Zoom & Action Tools */}
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-1 bg-gray-800/80 px-2 py-1.5 rounded-xl border border-gray-700/60 text-xs'>
            <button
              onClick={handleZoomOut}
              className='p-1 hover:bg-gray-700 rounded-md cursor-pointer transition text-gray-300'
              title='Zoom Out'
            >
              <BsZoomOut size={14} />
            </button>

            <span className='w-12 text-center font-medium text-gray-300'>{zoom}%</span>

            <button
              onClick={handleZoomIn}
              className='p-1 hover:bg-gray-700 rounded-md cursor-pointer transition text-gray-300'
              title='Zoom In'
            >
              <BsZoomIn size={14} />
            </button>

            <button
              onClick={handleResetZoom}
              className='p-1 hover:bg-gray-700 rounded-md cursor-pointer transition text-gray-400 ml-1'
              title='Reset Zoom'
            >
              <BsArrowCounterclockwise size={13} />
            </button>
          </div>

          {doc?.fileUrl && (
            <button
              onClick={handleOpenNewTab}
              className='flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm'
            >
              <span>Open File</span>
              <BsBoxArrowUpRight size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Document Viewer Canvas */}
      <div className='flex-1 bg-gray-950 overflow-auto p-6 flex justify-center items-start relative'>
        <motion.div
          animate={{ scale: zoom / 100 }}
          transition={{ duration: 0.2 }}
          className='bg-white text-gray-900 rounded-lg shadow-2xl p-10 md:p-14 max-w-3xl w-full min-h-[850px] transition-transform origin-top space-y-6 relative border border-gray-200'
        >
          {/* Document Header Line */}
          <div className='border-b border-gray-200 pb-4 flex justify-between items-center text-xs text-gray-400 font-mono'>
            <span>HIREREADY.AI DOCUMENT VIEWER</span>
            <span>
              PAGE {currentPage} / {totalPages}
            </span>
          </div>

          {/* Document Content Display */}
          <div className='space-y-4 text-gray-800 text-sm leading-relaxed'>
            <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
              {doc?.title || 'Document Content'}
            </h1>

            <div className='bg-gray-50 border border-gray-200/80 p-6 rounded-2xl text-gray-800 font-sans whitespace-pre-wrap leading-relaxed text-sm'>
              {extractedText}
            </div>

            <p className='text-xs text-gray-400 text-center pt-8 border-t border-gray-100'>
              End of Extracted Document Content • HireReady.AI Document Engine
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DocumentContentTab
