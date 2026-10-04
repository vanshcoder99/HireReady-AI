import React from 'react'
import Navbar from '../components/Navbar'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import TestimonialsSection from '../components/landing/TestimonialsSection'
import Footer from '../components/Footer'

function Home() {
  return (
    <div className='min-h-screen bg-[#fafafa] dark:bg-[#090d16] text-gray-900 dark:text-gray-100 selection:bg-emerald-500 selection:text-white relative overflow-hidden transition-colors duration-300'>
      {/* Background Decorative Ambient Lighting */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10 dark:from-emerald-500/20 dark:via-teal-500/10' />
      <div className='absolute top-[500px] -right-40 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10' />
      <div className='absolute top-[1200px] -left-40 w-96 h-96 bg-teal-400/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10' />

      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <Footer />
    </div>
  )
}

export default Home
