import React, { useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { 
  BsShieldCheck, 
  BsLock, 
  BsFileEarmarkText, 
  BsMic, 
  BsCameraVideo, 
  BsCoin, 
  BsArrowLeft,
  BsEnvelope,
  BsCheckCircleFill,
  BsRobot
} from 'react-icons/bs'

function PrivacyPolicy() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const sections = [
    { id: 'introduction', title: '1. Introduction & Overview' },
    { id: 'information-collected', title: '2. Information We Collect' },
    { id: 'ai-data-processing', title: '3. AI Voice, Video & Speech Data' },
    { id: 'resume-data', title: '4. Resume & ATS Audit Data' },
    { id: 'webrtc-interviews', title: '5. WebRTC 1-on-1 Live Sessions' },
    { id: 'payments-credits', title: '6. Payments, Credits & Payouts' },
    { id: 'how-we-use', title: '7. How We Use Information' },
    { id: 'data-sharing', title: '8. Third-Party Services & AI Providers' },
    { id: 'security-retention', title: '9. Data Security & Retention' },
    { id: 'user-rights', title: '10. Your Rights & Data Choices' },
    { id: 'contact', title: '11. Contact Information' },
  ]

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className='min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors duration-300'>
      <Navbar />

      <main className='pt-28 md:pt-36 pb-20 px-6'>
        <div className='max-w-5xl mx-auto space-y-12'>
          
          {/* Breadcrumb & Back */}
          <div className='flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400'>
            <button 
              onClick={() => navigate('/')} 
              className='hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5'
            >
              <BsArrowLeft size={13} />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className='text-gray-900 dark:text-white font-bold'>Privacy Policy</span>
          </div>

          {/* Hero Banner */}
          <div className='bg-gradient-to-br from-emerald-600 via-teal-700 to-gray-900 dark:from-emerald-950 dark:via-gray-900 dark:to-gray-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden border border-emerald-500/20'>
            <div className='absolute -right-10 -top-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none' />
            
            <div className='relative z-10 space-y-4 max-w-3xl'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-emerald-500/10 border border-white/20 dark:border-emerald-500/20 text-xs font-bold tracking-wide uppercase'>
                <BsShieldCheck className='text-emerald-300' /> Official Legal Document
              </div>
              <h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight'>
                Privacy Policy
              </h1>
              <p className='text-emerald-100 dark:text-gray-300 text-sm md:text-base leading-relaxed'>
                At <span className='font-bold text-white'>HireReady.AI</span>, we value your trust and are committed to protecting your personal data, resume information, voice inputs, and technical interview recordings. This Privacy Policy details how we collect, process, and safeguard your data.
              </p>
              <p className='text-xs text-emerald-200/80 dark:text-gray-400 pt-2'>
                <strong>Effective Date:</strong> November 18, 2026 • <strong>Last Updated:</strong> November 2026
              </p>
            </div>
          </div>

          {/* Core Content Layout with Sticky Quick-Nav */}
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-10 items-start'>
            
            {/* Table of Contents Sticky Sidebar */}
            <aside className='hidden lg:block sticky top-28 bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-3'>
              <h3 className='text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                Table of Contents
              </h3>
              <nav className='space-y-1.5'>
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className='block w-full text-left text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition cursor-pointer truncate'
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Privacy Policy Detailed Articles */}
            <div className='lg:col-span-3 space-y-10 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300'>

              {/* Section 1 */}
              <section id='introduction' className='space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>1.</span>
                  <span>Introduction & Overview</span>
                </h2>
                <p>
                  Welcome to <strong>HireReady.AI</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). HireReady.AI is an AI-powered mock interview, technical assessment, and mentorship platform operated by Vansh Nagpal. We provide candidates and mentors with comprehensive interview practice tools, including real-time voice and video AI mock interviews, ATS resume analysis, dynamic skill roadmaps, live 1-on-1 human mock sessions via WebRTC, and the Blind 75 DSA practice sheet.
                </p>
                <p>
                  By creating an account, browsing our website, uploading resumes or documents, participating in mock interviews, or using our credit purchasing system, you acknowledge and agree to the data collection and processing practices described in this Privacy Policy.
                </p>
              </section>

              {/* Section 2 */}
              <section id='information-collected' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>2.</span>
                  <span>Information We Collect</span>
                </h2>
                <p>We collect several categories of information to provide you with seamless placement preparation services:</p>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>
                    <strong>Account & Authentication Information:</strong> Your name, email address, profile avatar, authentication credentials, and user role (Candidate/Learner or Interviewer/Mentor) provided via Google OAuth or email sign-in.
                  </li>
                  <li>
                    <strong>Interviewer KYC & Credential Data:</strong> For users registered as mentors/interviewers, we collect verification documents including degree certificates, resumes, professional titles, company affiliations, years of experience, and payout details (bank account number, IFSC code, and UPI ID).
                  </li>
                  <li>
                    <strong>Credit & Payment Metadata:</strong> Razorpay order IDs, payment transaction IDs, purchased credit package amounts, and current wallet balances. We do not store full credit card numbers or banking passwords on our servers; payments are processed securely through Razorpay.
                  </li>
                  <li>
                    <strong>Usage Data & Progress History:</strong> Blind 75 question completion checkmarks, quiz attempt scores, flashcard review intervals, and interview scorecards.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id='ai-data-processing' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>3.</span>
                  <span>AI Voice, Video & Speech Data</span>
                </h2>
                <p>
                  During AI Mock Interview sessions, our system utilizes dynamic speech technology:
                </p>
                <div className='p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2'>
                  <div className='flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm'>
                    <BsMic size={16} /> Speech Recognition (STT) & Speech Synthesis (TTS)
                  </div>
                  <p className='text-xs sm:text-sm text-gray-700 dark:text-gray-300'>
                    Your spoken responses are converted to text in real time using client-side Web Speech Recognition APIs. The transcribed answers are transmitted to our OpenRouter AI engine solely to calculate multi-pillar scores (Confidence, Correctness, and Communication) and generate constructive feedback. We do not sell or monetize raw voice recordings.
                  </p>
                </div>
              </section>

              {/* Section 4 */}
              <section id='resume-data' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>4.</span>
                  <span>Resume & ATS Audit Data</span>
                </h2>
                <p>
                  When you upload a resume PDF for ATS scoring or personalized roadmaps:
                </p>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>
                    Text is extracted locally using <code>pdfjs-dist</code> to detect your work history, skills, contact layout, and project metrics.
                  </li>
                  <li>
                    Temporary files uploaded to the server during resume analysis are automatically unlinked (deleted) from local filesystem storage immediately following parsing.
                  </li>
                  <li>
                    Structured analysis results (ATS score, matched skills, recommended skills, section scores) are saved to your user profile in PostgreSQL so you can reference them on your dashboard. You may delete this saved analysis at any time with one click.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id='webrtc-interviews' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>5.</span>
                  <span>WebRTC 1-on-1 Live Sessions</span>
                </h2>
                <p>
                  When participating in live 1-on-1 human mock interviews:
                </p>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>
                    Audio and video streams are transmitted directly peer-to-peer (P2P) between the candidate and the interviewer using <strong>WebRTC</strong> encryption protocols and Google STUN traversal servers.
                  </li>
                  <li>
                    Live video feeds are not recorded or stored on HireReady.AI servers.
                  </li>
                  <li>
                    Text chat messages exchanged inside the live interview room are stored in our secure database to maintain the official session audit log and generate post-interview summary reports.
                  </li>
                </ul>
              </section>

              {/* Section 6 */}
              <section id='payments-credits' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>6.</span>
                  <span>Payments, Credits & Payouts</span>
                </h2>
                <p>
                  HireReady.AI operates a credit-based preparation model:
                </p>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>
                    New registered accounts receive <strong>100 complimentary credits</strong>. Credit recharges (Starter Pack ₹100 for 150 credits, Pro Pack ₹500 for 650 credits) and human interview bookings are processed securely via <strong>Razorpay</strong>.
                  </li>
                  <li>
                    AI Mock Interviews require 50 credits per completed session; AI Document processing and Flashcard generation require 20 credits; Dynamic AI Hint Guidance in the Blind 75 sheet consumes 50 credits per query.
                  </li>
                  <li>
                    For interviewers, 80% of booking fees are credited to their platform wallet upon session completion, with 20% retained as platform commission. Bank and UPI withdrawal details are encrypted and used solely for fund disbursements.
                  </li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id='how-we-use' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>7.</span>
                  <span>How We Use Information</span>
                </h2>
                <p>We use your information strictly to provide, maintain, and enhance our services:</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                  <div className='p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
                    <h4 className='font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1'>Personalization</h4>
                    <p className='text-xs'>Generate interview questions and 4-phase learning roadmaps tailored to your skill gaps.</p>
                  </div>
                  <div className='p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
                    <h4 className='font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1'>Performance Scoring</h4>
                    <p className='text-xs'>Deliver real-time analytics across confidence, technical correctness, and articulation.</p>
                  </div>
                  <div className='p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
                    <h4 className='font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1'>Safety & KYC</h4>
                    <p className='text-xs'>Audit interviewer credentials and prevent fraud or impersonation on our marketplace.</p>
                  </div>
                  <div className='p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
                    <h4 className='font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1'>Platform Security</h4>
                    <p className='text-xs'>Prevent unauthorized access, verify JWT session tokens, and ensure server integrity.</p>
                  </div>
                </div>
              </section>

              {/* Section 8 */}
              <section id='data-sharing' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>8.</span>
                  <span>Third-Party Services & AI Providers</span>
                </h2>
                <p>
                  We do not sell, rent, or trade your personal data. We partner exclusively with industry-standard infrastructure providers:
                </p>
                <ul className='list-disc pl-5 space-y-1.5 text-sm'>
                  <li><strong>OpenRouter.ai:</strong> For processing AI interview evaluations, hints, flashcards, and summaries.</li>
                  <li><strong>Razorpay:</strong> For secure payment gateway operations, billing, and mentor payouts.</li>
                  <li><strong>Neon PostgreSQL:</strong> Encrypted cloud database hosting.</li>
                  <li><strong>Firebase Authentication:</strong> Secure Google OAuth identity verification.</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section id='security-retention' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>9.</span>
                  <span>Data Security & Retention</span>
                </h2>
                <p>
                  We apply industry-standard technical measures including HTTPS encryption in transit, strict password hashing, JWT HTTP-only cookies, and restricted database access. Your data is retained as long as your account remains active. You can delete uploaded documents, past interview sessions, and resume audits directly from your account dashboard at any time.
                </p>
              </section>

              {/* Section 10 */}
              <section id='user-rights' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>10.</span>
                  <span>Your Rights & Data Choices</span>
                </h2>
                <p>You have full ownership of your data on HireReady.AI:</p>
                <ul className='list-disc pl-5 space-y-1.5'>
                  <li><strong>Access & Review:</strong> Inspect your profile, interview history, scores, and credit transactions.</li>
                  <li><strong>Correction:</strong> Update your bio, target role, skills, or banking information.</li>
                  <li><strong>Deletion:</strong> Request permanent account and data deletion by contacting our team.</li>
                  <li><strong>Export:</strong> Download official PDF scorecards for completed interviews.</li>
                </ul>
              </section>

              {/* Section 11 */}
              <section id='contact' className='space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>11.</span>
                  <span>Contact Information</span>
                </h2>
                <p>
                  If you have questions, feedback, or data privacy requests regarding HireReady.AI, please reach out directly:
                </p>
                <div className='p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3'>
                  <p className='font-bold text-gray-900 dark:text-white text-base'>
                    HireReady.AI — Lead Developer & Maintainer
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    <strong>Developer:</strong> Vansh Nagpal
                  </p>
                  <div className='flex items-center gap-4 pt-2 text-xs font-semibold'>
                    <a 
                      href='https://github.com/vanshcoder99' 
                      target='_blank' 
                      rel='noopener noreferrer'
                      className='text-emerald-600 dark:text-emerald-400 hover:underline'
                    >
                      GitHub Profile
                    </a>
                    <span>•</span>
                    <a 
                      href='https://www.linkedin.com/in/vansh-nagpal-424a28338' 
                      target='_blank' 
                      rel='noopener noreferrer'
                      className='text-emerald-600 dark:text-emerald-400 hover:underline'
                    >
                      LinkedIn Profile
                    </a>
                    <span>•</span>
                    <a 
                      href='https://x.com/VanshNagpa81393' 
                      target='_blank' 
                      rel='noopener noreferrer'
                      className='text-emerald-600 dark:text-emerald-400 hover:underline'
                    >
                      X (Twitter)
                    </a>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PrivacyPolicy
