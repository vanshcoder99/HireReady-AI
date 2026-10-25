import React, { useState } from 'react'
import { FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AuthModel from '../components/AuthModel'
import { ServerUrl } from '../App'
import { setUserData } from '../redux/userSlice'

function Pricing() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userData } = useSelector((state: any) => state.user)

  const [selectedPlan, setSelectedPlan] = useState("basic")
  const [showAuth, setShowAuth] = useState(false)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      credits: 100,
      description: "Perfect for beginners starting interview preparation.",
      features: [
        "100 AI Interview Credits",
        "Basic Performance Report",
        "Voice Interview Access",
        "Limited History Tracking",
      ],
      default: true,
    },
    {
      id: "basic",
      name: "Starter Pack",
      price: "₹100",
      credits: 150,
      description: "Great for focused practice and skill improvement.",
      features: [
        "150 AI Interview Credits",
        "Detailed Feedback",
        "Performance Analytics",
        "Full Interview History",
      ],
    },
    {
      id: "pro",
      name: "Pro Pack",
      price: "₹500",
      credits: 650,
      description: "Best value for serious job preparation.",
      features: [
        "650 AI Interview Credits",
        "Advanced AI Feedback",
        "Skill Trend Analytics",
        "Priority AI Processing",
      ],
      badge: "Best Value",
    },
  ]

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleProceedToPay = async (plan: any, e: React.MouseEvent) => {
    e.stopPropagation()
    setToastMessage(null)

    if (!userData) {
      setShowAuth(true)
      return
    }

    setLoadingPlanId(plan.id)

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setToastMessage({
          type: 'error',
          text: 'Failed to load Razorpay SDK. Please check your network connection.',
        })
        setLoadingPlanId(null)
        return
      }

      // 1. Create Order on Backend
      const amountNumber = parseInt(plan.price.replace(/[^\d]/g, ''), 10)
      const res = await axios.post(
        `${ServerUrl}/api/payment/create-order`,
        {
          planId: plan.id,
          amount: amountNumber,
          credits: plan.credits,
        },
        { withCredentials: true }
      )

      const { orderId, amount, currency, key } = res.data
      const razorpayKey = key || import.meta.env.VITE_RAZORPAY_KEY_ID

      // 2. Open Official Razorpay Checkout Modal
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency || 'INR',
        name: 'HireReady.AI',
        description: `${plan.name} — ${plan.credits} AI Interview Credits`,
        order_id: orderId,
        prefill: {
          name: userData.name || '',
          email: userData.email || '',
        },
        theme: {
          color: '#10b981', // Emerald theme
        },
        handler: async function (response: any) {
          try {
            // 3. Verify Payment Signature on Backend
            const verifyRes = await axios.post(
              `${ServerUrl}/api/payment/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true }
            )

            if (verifyRes.data.user) {
              dispatch(setUserData(verifyRes.data.user))
            } else {
              const userRes = await axios.get(`${ServerUrl}/api/user/current-user`, { withCredentials: true })
              if (userRes.data.user) {
                dispatch(setUserData(userRes.data.user))
              }
            }

            setToastMessage({
              type: 'success',
              text: verifyRes.data.message || `Payment successful! ${plan.credits} credits added to your account.`,
            })
          } catch (err: any) {
            console.error('Payment verification error:', err)
            setToastMessage({
              type: 'error',
              text: err.response?.data?.message || 'Payment verification failed. Please contact support.',
            })
          } finally {
            setLoadingPlanId(null)
          }
        },
        modal: {
          ondismiss: function () {
            setLoadingPlanId(null)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setToastMessage({
          type: 'error',
          text: response.error?.description || 'Payment process failed. Please try again.',
        })
        setLoadingPlanId(null)
      })
      rzp.open()
    } catch (err: any) {
      console.error('Create order error:', err)
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to initiate payment order. Please try again.',
      })
      setLoadingPlanId(null)
    }
  }

  return (
    <div className='min-h-screen bg-[#fafafa] dark:bg-[#090d16] text-gray-900 dark:text-gray-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden transition-colors duration-300'>
      {/* Background Decorative Lighting */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10 dark:from-emerald-500/20 dark:via-teal-500/10' />

      <Navbar />

      <div className='pt-28 pb-20 px-6 max-w-6xl mx-auto w-full flex-1'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <span className='text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/60'>
            Pricing Plans
          </span>
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight'>
            Choose Your <span className='text-emerald-600 dark:text-emerald-400'>Plan</span>
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-3 text-base sm:text-lg max-w-xl mx-auto font-normal'>
            Flexible pricing tailored to match your placement preparation goals.
          </p>
        </div>

        {/* Feedback Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-8 p-4 rounded-2xl max-w-xl mx-auto text-sm font-semibold flex items-center justify-between border shadow-sm ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
              }`}
            >
              <span>{toastMessage.text}</span>
              <button
                onClick={() => setToastMessage(null)}
                className='ml-4 text-xs font-bold underline cursor-pointer hover:opacity-80'
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing Cards Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id

            return (
              <motion.div
                key={plan.id}
                whileHover={!plan.default ? { y: -6 } : {}}
                onClick={() => !plan.default && setSelectedPlan(plan.id)}
                className={`relative rounded-3xl p-8 transition-all duration-300 border bg-white dark:bg-gray-900 flex flex-col justify-between ${
                  isSelected
                    ? "border-emerald-500 shadow-xl ring-2 ring-emerald-500/20"
                    : "border-gray-200/90 dark:border-gray-800 shadow-sm hover:shadow-md"
                } ${plan.default ? "cursor-default" : "cursor-pointer"}`}
              >
                <div>
                  {/* Badge */}
                  {plan.badge && (
                    <div className='absolute top-6 right-6 bg-emerald-600 text-white text-xs font-bold px-3.5 py-1 rounded-full shadow-sm'>
                      {plan.badge}
                    </div>
                  )}

                  {/* Default Tag */}
                  {plan.default && (
                    <div className='absolute top-6 right-6 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700'>
                      Default
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className='text-xl font-bold text-gray-900 dark:text-white'>{plan.name}</h3>

                  {/* Price & Credits */}
                  <div className='mt-4 flex items-baseline gap-2'>
                    <span className='text-4xl font-extrabold text-gray-900 dark:text-white'>{plan.price}</span>
                    <span className='text-sm text-emerald-600 dark:text-emerald-400 font-semibold'>/ {plan.credits} Credits</span>
                  </div>

                  {/* Description */}
                  <p className='text-gray-600 dark:text-gray-400 mt-3 text-sm leading-relaxed'>{plan.description}</p>

                  {/* Features List */}
                  <div className='mt-6 space-y-3.5 text-left border-t border-gray-100 dark:border-gray-800 pt-6'>
                    {plan.features.map((feature, i) => (
                      <div key={i} className='flex items-center gap-3'>
                        <FaCheckCircle className='text-emerald-500 text-sm flex-shrink-0' />
                        <span className='text-gray-700 dark:text-gray-300 text-sm font-medium'>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action Button */}
                {!plan.default && (
                  <button
                    disabled={loadingPlanId === plan.id}
                    onClick={(e) => {
                      if (isSelected) {
                        handleProceedToPay(plan, e)
                      } else {
                        e.stopPropagation()
                        setSelectedPlan(plan.id)
                      }
                    }}
                    className={`w-full cursor-pointer mt-8 py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:text-emerald-700 dark:hover:text-emerald-400"
                    } ${loadingPlanId === plan.id ? "opacity-75 cursor-not-allowed" : ""}`}
                  >
                    {loadingPlanId === plan.id ? (
                      <>
                        <FaSpinner className="animate-spin text-base" />
                        <span>Processing...</span>
                      </>
                    ) : isSelected ? (
                      "Proceed to Pay"
                    ) : (
                      "Select Plan"
                    )}
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <Footer />
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default Pricing
