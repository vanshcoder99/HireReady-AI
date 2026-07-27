import React from 'react'
import { motion } from 'motion/react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'SDE at Microsoft',
    quote: 'HireReady.AI transformed my interview prep. The AI feedback on confidence and communication was incredibly accurate. Landed my dream role in 3 weeks.',
    initial: 'P',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
  },
  {
    name: 'Arjun Patel',
    role: 'Frontend Dev at Razorpay',
    quote: 'The resume analysis caught gaps I never noticed. Combined with mock interviews, I felt 10x more prepared than using any other platform.',
    initial: 'A',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300',
  },
  {
    name: 'Sneha Gupta',
    role: 'Data Analyst at Google',
    quote: 'I used the flashcards and quizzes daily for 2 weeks. The progress tracking kept me motivated. Best placement prep tool I\'ve used.',
    initial: 'S',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
  },
]

function TestimonialsSection() {
  return (
    <section className='py-24 px-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className='text-center mb-16'
        >
          <span className='text-emerald-600 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wider'>Testimonials</span>
          <h2 className='text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mt-3 mb-4'>
            Loved by Students
          </h2>
          <p className='text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto'>
            Join thousands of students who landed their dream placements.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className='grid md:grid-cols-3 gap-6'>
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className='bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-2xl p-7 hover:shadow-md transition-shadow duration-300'
            >
              {/* Quote mark */}
              <div className='text-4xl text-emerald-200 dark:text-emerald-800 font-serif leading-none mb-3'>"</div>

              <p className='text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6'>{t.quote}</p>

              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>
                  {t.initial}
                </div>
                <div>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>{t.name}</p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
