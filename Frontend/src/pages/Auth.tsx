import React, { useState } from 'react';
import {
  BsRobot,
  BsPerson,
  BsBriefcase,
  BsEnvelope,
  BsLock,
  BsEye,
  BsEyeSlash,
  BsExclamationCircle,
  BsAt,
  BsShieldCheck,
} from 'react-icons/bs';
import { IoSparkles } from 'react-icons/io5';
import { motion } from 'motion/react';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

interface AuthProps {
  isModel?: boolean;
}

function Auth({ isModel = false }: AuthProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<'learner' | 'interviewer'>('learner');

  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Switch modes cleanly and reset error
  const handleSwitchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setError(null);
  };

  // 1. Password/Username Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identifier = loginIdentifier.trim();
    if (!identifier) {
      setError('Please enter your email or username');
      return;
    }
    if (!loginPassword) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${ServerUrl}/api/auth/login`,
        { emailOrUsername: identifier, password: loginPassword },
        { withCredentials: true }
      );

      const user = res.data?.user || res.data;
      dispatch(setUserData(user));

      if (user.role === 'interviewer') {
        navigate('/interviewer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Password/Username Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${ServerUrl}/api/auth/signup`,
        {
          name: name.trim(),
          username: username.trim() || undefined,
          email: email.trim(),
          password,
          role: selectedRole,
        },
        { withCredentials: true }
      );

      const user = res.data?.user || res.data;
      dispatch(setUserData(user));

      if (selectedRole === 'interviewer') {
        navigate('/interviewer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Google OAuth Handler
  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await signInWithPopup(auth, provider);
      const User = response.user;
      const userName = User.displayName || 'User';
      const userEmail = User.email;

      // 1. Google OAuth
      const result = await axios.post(
        `${ServerUrl}/api/auth/google`,
        { name: userName, email: userEmail },
        { withCredentials: true }
      );

      // 2. Set User Role
      const roleRes = await axios.post(
        `${ServerUrl}/api/user/role`,
        { role: selectedRole },
        { withCredentials: true }
      );

      const finalUser = roleRes.data?.user || result.data?.user || result.data;
      dispatch(setUserData(finalUser));

      if (selectedRole === 'interviewer') {
        navigate('/interviewer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.response?.data?.message || err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full ${
        isModel
          ? 'py-1'
          : 'min-h-screen bg-[#fafafa] dark:bg-[#0b0f19] flex items-center justify-center px-4 py-16 transition-colors duration-300'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full ${
          isModel
            ? 'max-w-md rounded-3xl p-6 sm:p-8 max-h-[88vh] overflow-y-auto'
            : 'max-w-lg p-8 sm:p-10 rounded-[32px]'
        } bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xl border border-gray-200/90 dark:border-gray-800 relative z-10 transition-colors duration-300`}
      >
        {/* Logo & Brand Header */}
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <div className="bg-black dark:bg-emerald-600 text-white p-2 rounded-xl shadow-xs transition-colors duration-300">
            <BsRobot size={18} />
          </div>
          <h2 className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
            HireReady<span className="text-emerald-600 dark:text-emerald-400">.AI</span>
          </h2>
        </div>

        {/* Role Selection Step */}
        <div className="mb-4 space-y-1.5">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block text-center">
            Select Your Account Role
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100/80 dark:bg-gray-800/90 rounded-2xl border border-gray-200/80 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setSelectedRole('learner')}
              className={`py-2 px-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                selectedRole === 'learner'
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-md border border-gray-200/80 dark:border-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BsPerson size={16} />
              <span>Learner / Candidate</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('interviewer')}
              className={`py-2 px-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer flex flex-col items-center gap-1 ${
                selectedRole === 'interviewer'
                  ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-300 shadow-md border border-gray-200/80 dark:border-gray-600'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BsBriefcase size={16} />
              <span>Tech Interviewer</span>
            </button>
          </div>
        </div>

        {/* Auth Mode Tabs (Sign In / Sign Up) */}
        <div className="flex bg-gray-100/90 dark:bg-gray-800 rounded-xl p-1 mb-4 border border-gray-200/80 dark:border-gray-700">
          <button
            type="button"
            onClick={() => handleSwitchMode('signin')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
          >
            <BsExclamationCircle size={15} className="flex-shrink-0" />
            <span className="leading-snug">{error}</span>
          </motion.div>
        )}

        {/* 1. SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 block">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsEnvelope size={15} />
                </span>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="name@example.com or @username"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 block">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsLock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <BsEyeSlash size={15} /> : <BsEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        )}

        {/* 2. SIGN UP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 block">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsPerson size={15} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 block">
                Username <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsAt size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alexjohnson"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsEnvelope size={15} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 block">
                Password <span className="text-gray-400 font-normal">(min 6 chars)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsLock size={15} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <BsEyeSlash size={15} /> : <BsEye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1 block">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <BsShieldCheck size={15} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showConfirmPassword ? <BsEyeSlash size={15} /> : <BsEye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-md shadow-emerald-600/20 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 font-bold tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-black dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm border border-transparent dark:border-gray-700 active:scale-[0.99] disabled:opacity-60"
        >
          <FcGoogle size={18} className="bg-white rounded-full p-0.5" />
          <span>Continue with Google</span>
        </button>

        {/* Bottom Switcher */}
        <div className="mt-4 text-center">
          {mode === 'signin' ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-3 font-normal">
          By continuing, you agree to HireReady.AI's{' '}
          <span
            onClick={() => navigate('/terms')}
            className="underline cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            Terms
          </span>{' '}
          &{' '}
          <span
            onClick={() => navigate('/privacy')}
            className="underline cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
          >
            Privacy Policy
          </span>
          .
        </p>
      </motion.div>
    </div>
  );
}

export default Auth;
