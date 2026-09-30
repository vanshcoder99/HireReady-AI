import React from 'react'
import { BsRobot, BsGithub, BsTwitterX, BsLinkedin } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'

const footerLinks = {
  Platform: [
    { label: 'AI Interviews', href: '/interview' },
    { label: 'Resume Analysis', href: '/interview' },
    { label: 'Flashcards', href: '/dashboard' },
    { label: 'Quizzes', href: '/dashboard' },
    { label: 'Progress Tracking', href: '/dashboard' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Roadmaps', href: '#' },
    { label: 'Study Guides', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '#' },
    { label: 'Careers', href: '#' },
  ],
}

function LandingFooter() {
  const navigate = useNavigate()

  return (
    <footer className='bg-gray-950 text-gray-400 pt-16 pb-8 px-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Top section */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-10 mb-14'>
          {/* Brand */}
          <div className='col-span-2'>
            <div className='flex items-center gap-2.5 mb-4'>
              <div className='bg-black text-white p-2 rounded-xl shadow-xs'>
                <BsRobot size={18} />
              </div>
              <span className='font-bold text-white text-lg'>
                HireReady<span className='text-emerald-500'>.AI</span>
              </span>
            </div>
            <p className='text-sm leading-relaxed max-w-xs mb-6'>
              AI-powered placement preparation platform. Prepare smarter, interview better, get hired faster.
            </p>
            <div className='flex items-center gap-4'>
              <a href='#' className='hover:text-white transition'><BsTwitterX size={16} /></a>
              <a href='#' className='hover:text-white transition'><BsLinkedin size={16} /></a>
              <a href='#' className='hover:text-white transition'><BsGithub size={16} /></a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className='text-white font-semibold text-sm mb-4'>{title}</h4>
              <ul className='space-y-2.5'>
                {links.map((link, i) => (
                  <li key={i}>
                    <button
                      onClick={() => link.href !== '#' && navigate(link.href)}
                      className='text-sm hover:text-white transition cursor-pointer'
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className='border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
          <p className='text-xs'>© {new Date().getFullYear()} HireReady.AI. All rights reserved.</p>
          <div className='flex items-center gap-6 text-xs'>
            <a href='#' className='hover:text-white transition'>Privacy Policy</a>
            <a href='#' className='hover:text-white transition'>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter
