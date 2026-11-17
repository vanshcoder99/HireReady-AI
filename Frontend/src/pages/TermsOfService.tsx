import React, { useEffect } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { 
  BsFileText, 
  BsShieldLock, 
  BsCheckCircleFill, 
  BsCoin, 
  BsCameraVideo, 
  BsArrowLeft, 
  BsExclamationTriangle,
  BsAward
} from 'react-icons/bs'

function TermsOfService() {
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'eligibility-accounts', title: '2. Eligibility & User Accounts' },
    { id: 'services-overview', title: '3. Description of Platform Services' },
    { id: 'credits-billing', title: '4. Credits, Billing & Refund Policy' },
    { id: 'human-interviews', title: '5. 1-on-1 Mentorship & Payouts' },
    { id: 'code-of-conduct', title: '6. User Conduct & Video Room Rules' },
    { id: 'intellectual-property', title: '7. Intellectual Property Rights' },
    { id: 'ai-disclaimers', title: '8. AI Scoring Disclaimers' },
    { id: 'limitation-liability', title: '9. Limitation of Liability' },
    { id: 'termination', title: '10. Termination & Account Cancellation' },
    { id: 'governing-law', title: '11. Governing Law & Contact' },
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
          
          {/* Breadcrumb */}
          <div className='flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400'>
            <button 
              onClick={() => navigate('/')} 
              className='hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5'
            >
              <BsArrowLeft size={13} />
              <span>Home</span>
            </button>
            <span>/</span>
            <span className='text-gray-900 dark:text-white font-bold'>Terms of Service</span>
          </div>

          {/* Hero Banner */}
          <div className='bg-gradient-to-br from-emerald-600 via-teal-700 to-gray-900 dark:from-emerald-950 dark:via-gray-900 dark:to-gray-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden border border-emerald-500/20'>
            <div className='absolute -right-10 -top-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none' />
            
            <div className='relative z-10 space-y-4 max-w-3xl'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-emerald-500/10 border border-white/20 dark:border-emerald-500/20 text-xs font-bold tracking-wide uppercase'>
                <BsFileText className='text-emerald-300' /> Agreement & Conditions
              </div>
              <h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight'>
                Terms of Service
              </h1>
              <p className='text-emerald-100 dark:text-gray-300 text-sm md:text-base leading-relaxed'>
                Please review these Terms of Service carefully before utilizing <span className='font-bold text-white'>HireReady.AI</span>. By accessing or using our AI mock interview engine, WebRTC live video rooms, or career roadmaps, you agree to be bound by these terms.
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

            {/* Terms Articles */}
            <div className='lg:col-span-3 space-y-10 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300'>

              {/* Section 1 */}
              <section id='acceptance' className='space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>1.</span>
                  <span>Acceptance of Terms</span>
                </h2>
                <p>
                  These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Candidate&rdquo;, &ldquo;Interviewer&rdquo;, or &ldquo;you&rdquo;) and <strong>HireReady.AI</strong>, created and maintained by Vansh Nagpal.
                </p>
                <p>
                  By creating an account, authenticating via Google OAuth or email, using AI mock interviews, booking 1-on-1 human interview sessions, uploading documents, or purchasing credits, you represent that you have read, understood, and agreed to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not access or use HireReady.AI.
                </p>
              </section>

              {/* Section 2 */}
              <section id='eligibility-accounts' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>2.</span>
                  <span>Eligibility & User Accounts</span>
                </h2>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>
                    <strong>Age Requirement:</strong> You must be at least 16 years of age (or the minimum legal age in your jurisdiction) to use our platform.
                  </li>
                  <li>
                    <strong>Account Roles:</strong> You may use HireReady.AI as a <em>Candidate (Learner)</em> to practice technical interviews and audit resumes, or switch to <em>Interviewer (Mentor)</em> mode to conduct mock sessions.
                  </li>
                  <li>
                    <strong>Account Integrity:</strong> You are responsible for safeguarding your login credentials and for all activities that occur under your account. You agree to provide true, accurate, and current information at all times.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id='services-overview' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>3.</span>
                  <span>Description of Platform Services</span>
                </h2>
                <p>HireReady.AI provides an integrated suite of placement and interview preparation tools:</p>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
                  <div className='p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900'>
                    <h4 className='font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1'>AI Mock Interview Studio</h4>
                    <p className='text-xs'>Interactive male/female video avatars, speech-to-text voice recognition, and 3-pillar scoring (Confidence, Correctness, Communication).</p>
                  </div>
                  <div className='p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900'>
                    <h4 className='font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1'>1-on-1 Human Mock Rounds</h4>
                    <p className='text-xs'>Live peer and mentor mock sessions via encrypted WebRTC video, screen sharing, live chat, and AI Co-Interviewer support.</p>
                  </div>
                  <div className='p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900'>
                    <h4 className='font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1'>ATS Resume Auditor & Roadmaps</h4>
                    <p className='text-xs'>Deep PDF parsing evaluating keyword density, matched skills, missing competencies, and 4-phase milestone curricula.</p>
                  </div>
                  <div className='p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900'>
                    <h4 className='font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 mb-1'>Blind 75 DSA Sheet & AI Guide</h4>
                    <p className='text-xs'>Curated 75 canonical coding problems with direct LeetCode links, checkmark progress tracking, and on-demand AI hints.</p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id='credits-billing' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>4.</span>
                  <span>Credits, Billing & Refund Policy</span>
                </h2>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>
                    <strong>Credit Economy:</strong> Every newly registered user receives 100 free credits. The credit consumption schedule is:
                    <ul className='list-circle pl-5 mt-1 space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      <li>Full AI Mock Interview Session: <strong>50 credits</strong></li>
                      <li>Blind 75 AI Deep Dive Chat Query: <strong>50 credits</strong></li>
                      <li>Smart Document Processing / Notes: <strong>20 credits</strong></li>
                      <li>AI Flashcards & Quiz Generation: <strong>20 credits</strong></li>
                    </ul>
                  </li>
                  <li>
                    <strong>Credit Purchases:</strong> Users can purchase credit recharge packs (Starter Pack: ₹100 for 150 credits; Pro Pack: ₹500 for 650 credits) securely via <strong>Razorpay</strong>. All charges are in Indian Rupees (INR) unless otherwise specified.
                  </li>
                  <li>
                    <strong>Refund Policy:</strong> Due to the immediate computation costs incurred through third-party AI APIs (OpenRouter), purchased credits and completed AI mock interviews are non-refundable once utilized. If a technical error prevents session completion, users may contact support to receive a credit credit-back.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id='human-interviews' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>5.</span>
                  <span>1-on-1 Mentorship & Payouts</span>
                </h2>
                <ul className='list-disc pl-5 space-y-2'>
                  <li>
                    <strong>Interviewer Verification (KYC):</strong> Interviewers must submit authentic credentials (degrees, resumes) and bank details. HireReady.AI reserves the right to suspend any mentor account found submitting forged documents or misleading credentials.
                  </li>
                  <li>
                    <strong>Revenue Split & Platform Fee:</strong> HireReady.AI operates an <strong>80/20 revenue distribution model</strong>. The mentor receives 80% net earnings from each completed booking, and HireReady.AI retains 20% platform commission.
                  </li>
                  <li>
                    <strong>Wallet & Withdrawals:</strong> Mentors can request withdrawal payouts to their verified Indian Bank Account (via IFSC) or UPI ID once sessions are marked completed.
                  </li>
                  <li>
                    <strong>Cancellation & No-Shows:</strong> Candidates and interviewers must adhere to scheduled interview times. Repeated no-shows may lead to slot revocation and account penalties.
                  </li>
                </ul>
              </section>

              {/* Section 6 */}
              <section id='code-of-conduct' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>6.</span>
                  <span>User Conduct & Video Room Rules</span>
                </h2>
                <p>To ensure a professional and respectful interview environment, you strictly agree NOT to:</p>
                <ul className='list-disc pl-5 space-y-1.5 text-sm'>
                  <li>Harass, intimidate, discriminate against, or verbally abuse any peer, mentor, or candidate during WebRTC video sessions.</li>
                  <li>Record, screenshot, or distribute live interview video feeds of other users without their express written consent.</li>
                  <li>Upload malicious files, viruses, or non-educational content via the document upload feature.</li>
                  <li>Attempt to bypass credit barriers, exploit socket connections, or reverse-engineer the HireReady.AI software.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section id='intellectual-property' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>7.</span>
                  <span>Intellectual Property Rights</span>
                </h2>
                <p>
                  You retain all ownership rights to the content you upload (including your resume text, project summaries, and personal notes).
                </p>
                <p>
                  The HireReady.AI branding, logo, user interface design, proprietary algorithms, avatars, scoring metrics, and software codebase are the exclusive intellectual property of Vansh Nagpal and HireReady.AI, protected under applicable intellectual property and copyright laws.
                </p>
              </section>

              {/* Section 8 */}
              <section id='ai-disclaimers' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>8.</span>
                  <span>AI Scoring Disclaimers</span>
                </h2>
                <div className='p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2 text-amber-900 dark:text-amber-200 text-xs sm:text-sm'>
                  <div className='flex items-center gap-2 font-bold'>
                    <BsExclamationTriangle size={16} className='text-amber-600 dark:text-amber-400' /> Educational & Practice Disclaimer
                  </div>
                  <p>
                    HireReady.AI is designed as an interactive educational training simulator. While our AI models and scoring rubrics are calibrated to replicate industry interview standards, HireReady.AI does not guarantee employment, job offers, or placement success at any specific organization.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section id='limitation-liability' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>9.</span>
                  <span>Limitation of Liability</span>
                </h2>
                <p>
                  To the maximum extent permitted by applicable law, HireReady.AI and its maintainers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data loss, or business interruption arising out of your access to or inability to use our platform.
                </p>
              </section>

              {/* Section 10 */}
              <section id='termination' className='space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>10.</span>
                  <span>Termination & Account Cancellation</span>
                </h2>
                <p>
                  We reserve the right to suspend or terminate your account and access to HireReady.AI at our discretion, without prior notice, if you violate these Terms or engage in conduct detrimental to other users. You may terminate your account at any time by contacting our support team.
                </p>
              </section>

              {/* Section 11 */}
              <section id='governing-law' className='space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800/80'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5'>
                  <span className='text-emerald-600 dark:text-emerald-400'>11.</span>
                  <span>Governing Law & Contact</span>
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India. For any legal inquiries, questions, or clarification regarding these Terms, please contact:
                </p>
                <div className='p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3'>
                  <p className='font-bold text-gray-900 dark:text-white text-base'>
                    HireReady.AI
                  </p>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    <strong>Founder & Lead Developer:</strong> Vansh Nagpal
                  </p>
                  <div className='flex items-center gap-4 pt-2 text-xs font-semibold'>
                    <a 
                      href='https://github.com/vanshcoder99' 
                      target='_blank' 
                      rel='noopener noreferrer'
                      className='text-emerald-600 dark:text-emerald-400 hover:underline'
                    >
                      GitHub
                    </a>
                    <span>•</span>
                    <a 
                      href='https://www.linkedin.com/in/vansh-nagpal-424a28338' 
                      target='_blank' 
                      rel='noopener noreferrer'
                      className='text-emerald-600 dark:text-emerald-400 hover:underline'
                    >
                      LinkedIn
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

export default TermsOfService
