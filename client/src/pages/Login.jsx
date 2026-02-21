import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import { Zap, Eye, EyeOff, Shield, Truck, BarChart3, MapPin } from 'lucide-react'

const DEMO_ROLES = [
  { email: 'manager@fleetflow.test', role: 'Fleet Manager', icon: Truck, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { email: 'dispatcher@fleetflow.test', role: 'Dispatcher', icon: MapPin, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { email: 'safety@fleetflow.test', role: 'Safety Officer', icon: Shield, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { email: 'analyst@fleetflow.test', role: 'Financial Analyst', icon: BarChart3, color: 'bg-amber-50 border-amber-200 text-amber-700' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Reset Password State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [resetStep, setResetStep] = useState(1) // 1: Email, 2: Token + Password
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  const handleSendResetEmail = async (e) => {
    e.preventDefault()
    if (!resetEmail) return toast.error('Please enter your email')

    setIsResetting(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to request reset')

      toast.success('Reset PIN sent to your email!')
      setResetStep(2) // Move to step 2
    } catch (err) {
      toast.error(err.message || 'Failed to request reset')
    } finally {
      setIsResetting(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetToken || !resetPassword) return toast.error('Please fill all fields')
    if (resetToken.length !== 6) return toast.error('PIN must be 6 digits')
    if (resetPassword.length < 6) return toast.error('Password must be at least 6 characters')

    setIsResetting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, token: resetToken, newPassword: resetPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')

      toast.success('Password updated! You can now sign in.')
      setIsResetModalOpen(false)
      // Reset state for next time
      setResetStep(1)
      setResetEmail('')
      setResetToken('')
      setResetPassword('')
      // Pre-fill login box
      setValue('email', resetEmail)
    } catch (err) {
      toast.error(err.message || 'Failed to reset password')
    } finally {
      setIsResetting(false)
    }
  }
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Invalid credentials. Please try again.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (email) => {
    setValue('email', email)
    setValue('password', 'password123')
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-[#f8fafc] overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-brand-400/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-xl mb-5 hover:scale-105 transition-transform duration-300">
            <Zap className="w-8 h-8 text-white drop-shadow-md" />
          </div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">FleetFlow</h1>
          <p className="text-slate-500 font-medium text-sm mt-2">Modular Fleet & Logistics Management</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-8 backdrop-blur-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Sign In</h2>
            <Link
              to="/register"
              className="text-xs text-brand-600 hover:text-brand-700 font-bold hover:underline"
            >
              New user? Create account &rarr;
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                className={`input-glass ${errors.email ? 'border-red-400 ring-1 ring-red-400/50' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                })}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-[11px] text-brand-600 hover:text-brand-700 font-bold hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input-glass pr-10 ${errors.password ? 'border-red-400 ring-1 ring-red-400/50' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be 6+ chars' }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-sm font-bold shadow-lg shadow-brand-500/30"
            >
              {isLoading ? <><LoadingSpinner size="sm" /> Signing in...</> : 'Sign in to FleetFlow'}
            </button>
          </form>

          {/* Role selector */}
          <div className="mt-8 pt-6 border-t border-slate-200/50">
            <p className="text-[10px] text-slate-400 text-center mb-3 font-bold uppercase tracking-widest">Quick login — click a role</p>
            <div className="grid grid-cols-2 gap-2.5">
              {DEMO_ROLES.map(({ email, role, icon: Icon, color }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillCredentials(email)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border bg-white/50 backdrop-blur-sm text-left text-xs font-bold transition-all hover:scale-[1.03] hover:shadow-md ${color}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{role}</span>
                </button>
              ))}
            </div>

          </div>
        </div>

        <p className="text-center text-xs font-medium text-slate-400 mt-8">
          FleetFlow v1.0 &middot; Built for Odoo Hackathon 2025
        </p>
      </div>

      <Modal isOpen={isResetModalOpen} onClose={() => { setIsResetModalOpen(false); setResetStep(1) }} title="Reset Password" size="sm">
        {resetStep === 1 ? (
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">Enter your email and we'll send you a 6-digit reset PIN.</p>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                required className="input" placeholder="you@company.com"
              />
            </div>
            <button type="submit" disabled={isResetting} className="btn-primary w-full justify-center mt-2">
              {isResetting ? <><LoadingSpinner size="sm" /> Sending PIN...</> : 'Send Reset PIN'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">Check your email (server console) for the 6-digit PIN.</p>
            <div>
              <label className="label">6-Digit PIN</label>
              <input
                type="text" value={resetToken} onChange={e => setResetToken(e.target.value)}
                required className="input font-mono tracking-widest text-center" placeholder="------" maxLength={6}
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)}
                required className="input" placeholder="Min. 6 characters" minLength={6}
              />
            </div>
            <button type="submit" disabled={isResetting} className="btn-primary w-full justify-center mt-2">
              {isResetting ? <><LoadingSpinner size="sm" /> Resetting...</> : 'Confirm Reset Password'}
            </button>
          </form>
        )}
      </Modal>

    </div>
  )
}
