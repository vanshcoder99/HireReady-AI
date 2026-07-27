import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'motion/react'
import axios from 'axios'
import { 
  BsSliders, 
  BsCheckCircleFill, 
  BsPerson, 
  BsBriefcase, 
  BsStarFill,
  BsBank,
  BsShieldCheck,
  BsX
} from 'react-icons/bs'
import { ServerUrl } from '../App.jsx'
import { setUserData } from '../redux/userSlice.js'

function InterviewerProfile() {
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)
  const profile = userData?.user?.interviewerProfile || {
    title: 'Senior Tech Interviewer',
    company: 'Tech Enterprise',
    yearsOfExperience: 6,
    skills: ['System Design', 'React.js', 'Node.js', 'DSA'],
    languages: ['English'],
    bio: 'Conducting live technical mock interviews for full-stack candidates.',
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
    },
  }

  const [form, setForm] = useState({
    title: profile.title || '',
    company: profile.company || '',
    yearsOfExperience: profile.yearsOfExperience || 5,
    bio: profile.bio || '',
  })

  const [bankForm, setBankForm] = useState({
    accountHolderName: profile.bankDetails?.accountHolderName || '',
    bankName: profile.bankDetails?.bankName || '',
    accountNumber: profile.bankDetails?.accountNumber || '',
    ifscCode: profile.bankDetails?.ifscCode || '',
    upiId: profile.bankDetails?.upiId || '',
  })

  const [skillInput, setSkillInput] = useState('')
  const [skillsList, setSkillsList] = useState(profile.skills || ['System Design', 'React.js', 'Node.js', 'DSA'])
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingBank, setSavingBank] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState('')

  const handleAddSkill = () => {
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList((prev) => [...prev, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skill) => {
    setSkillsList((prev) => prev.filter((s) => s !== skill))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await axios.post(
        `${ServerUrl}/api/user/interviewer-profile`,
        { ...form, skills: skillsList },
        { withCredentials: true }
      )
      if (res.data?.user) {
        dispatch(setUserData({ user: res.data.user }))
        setSavedSuccess('Interviewer credentials updated successfully!')
        setTimeout(() => setSavedSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Update profile error:', error)
      alert('Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleBankSubmit = async (e) => {
    e.preventDefault()
    setSavingBank(true)
    try {
      const res = await axios.post(
        `${ServerUrl}/api/human-interview/bank-details`,
        bankForm,
        { withCredentials: true }
      )
      if (res.data?.user) {
        dispatch(setUserData({ user: res.data.user }))
        setSavedSuccess('KYC Bank & Payout details saved securely!')
        setTimeout(() => setSavedSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Update bank error:', error)
      alert('Failed to save bank details.')
    } finally {
      setSavingBank(false)
    }
  }

  return (
    <div className='py-2 space-y-8 max-w-3xl'>
      <div>
        <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight'>
          Interviewer Profile & KYC Bank Details
        </h1>
        <p className='text-gray-500 text-sm mt-1'>
          Configure your professional background, skills, and secure bank account for payout earnings.
        </p>
      </div>

      {savedSuccess && (
        <div className='bg-emerald-50 text-emerald-800 text-sm font-semibold p-4 rounded-2xl border border-emerald-200 flex items-center gap-2'>
          <BsCheckCircleFill size={16} className='text-emerald-600' />
          {savedSuccess}
        </div>
      )}

      {/* Profile & Credentials Form */}
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleProfileSubmit}
        className='bg-white border border-gray-200/90 rounded-3xl p-8 shadow-xs space-y-6'
      >
        <h3 className='font-extrabold text-gray-900 text-base border-b border-gray-100 pb-3 flex items-center gap-2'>
          <BsPerson className='text-emerald-600' size={18} />
          Professional Experience & Credentials
        </h3>

        <div className='grid sm:grid-cols-2 gap-5'>
          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Professional Title</label>
            <input
              type='text'
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500'
              required
            />
          </div>

          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Company / Organization</label>
            <input
              type='text'
              value={form.company}
              onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500'
              required
            />
          </div>
        </div>

        <div>
          <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Years of Experience</label>
          <input
            type='number'
            min={1}
            max={30}
            value={form.yearsOfExperience}
            onChange={(e) => setForm((p) => ({ ...p, yearsOfExperience: Number(e.target.value) }))}
            className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500'
            required
          />
        </div>

        <div>
          <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Bio & Background Overview</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500'
            placeholder='Tell candidates about your interviewing background...'
          />
        </div>

        {/* Skills Tag Input */}
        <div>
          <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Technical Skills & Technologies</label>
          <div className='flex gap-2 mb-3'>
            <input
              type='text'
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder='Add a skill (e.g., System Design, Node.js)'
              className='flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none'
            />
            <button
              type='button'
              onClick={handleAddSkill}
              className='bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer'
            >
              Add Skill
            </button>
          </div>

          <div className='flex flex-wrap gap-2'>
            {skillsList.map((skill, i) => (
              <span
                key={i}
                className='bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200/80 inline-flex items-center gap-1.5'
              >
                <span>{skill}</span>
                <button type='button' onClick={() => handleRemoveSkill(skill)} className='hover:text-rose-600 cursor-pointer'>
                  <BsX size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type='submit'
          disabled={savingProfile}
          className='bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition shadow-xs disabled:opacity-50'
        >
          {savingProfile ? 'Saving...' : 'Save Profile Credentials'}
        </button>
      </motion.form>

      {/* KYC Bank & Payout Details Form */}
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleBankSubmit}
        className='bg-white border border-gray-200/90 rounded-3xl p-8 shadow-xs space-y-6'
      >
        <div className='flex items-center justify-between border-b border-gray-100 pb-3'>
          <h3 className='font-extrabold text-gray-900 text-base flex items-center gap-2'>
            <BsBank className='text-emerald-600' size={18} />
            Payout & Bank Account (KYC)
          </h3>
          <span className='inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200'>
            <BsShieldCheck size={12} />
            Encrypted & Verified
          </span>
        </div>

        <div className='grid sm:grid-cols-2 gap-5'>
          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Account Holder Full Name</label>
            <input
              type='text'
              value={bankForm.accountHolderName}
              onChange={(e) => setBankForm((p) => ({ ...p, accountHolderName: e.target.value }))}
              placeholder='e.g., Vansh Nagpal'
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500'
              required
            />
          </div>

          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Bank Name</label>
            <input
              type='text'
              value={bankForm.bankName}
              onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
              placeholder='e.g., HDFC Bank / ICICI Bank'
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500'
              required
            />
          </div>
        </div>

        <div className='grid sm:grid-cols-2 gap-5'>
          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>Account Number</label>
            <input
              type='password'
              value={bankForm.accountNumber}
              onChange={(e) => setBankForm((p) => ({ ...p, accountNumber: e.target.value }))}
              placeholder='e.g., 501002394819'
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-mono'
              required
            />
          </div>

          <div>
            <label className='text-xs font-semibold text-gray-600 block mb-1.5'>IFSC Code</label>
            <input
              type='text'
              value={bankForm.ifscCode}
              onChange={(e) => setBankForm((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
              placeholder='e.g., HDFC0001234'
              className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 font-mono uppercase'
              required
            />
          </div>
        </div>

        <div>
          <label className='text-xs font-semibold text-gray-600 block mb-1.5'>UPI ID (Optional)</label>
          <input
            type='text'
            value={bankForm.upiId}
            onChange={(e) => setBankForm((p) => ({ ...p, upiId: e.target.value }))}
            placeholder='e.g., username@upi'
            className='w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500'
          />
        </div>

        <button
          type='submit'
          disabled={savingBank}
          className='bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition shadow-xs disabled:opacity-50'
        >
          {savingBank ? 'Saving KYC Details...' : 'Save Bank & Payout Details'}
        </button>
      </motion.form>
    </div>
  )
}

export default InterviewerProfile
