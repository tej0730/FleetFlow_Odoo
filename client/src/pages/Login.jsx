import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Zap, Eye, EyeOff, Shield, Truck, BarChart3, MapPin } from 'lucide-react'

const DEMO_ROLES = [
  { email: 'manager@fleetflow.test',    role: 'Fleet Manager',      icon: Truck,     color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { email: 'dispatcher@fleetflow.test', role: 'Dispatcher',         icon: MapPin,    color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { email: 'safety@fleetflow.test',     role: 'Safety Officer',     icon: Shield,    color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { email: 'analyst@fleetflow.test',    role: 'Financial Analyst',  icon: BarChart3, color: 'bg-amber-50 border-amber-200 text-amber-700' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FleetFlow</h1>
          <p className="text-gray-500 text-sm mt-1.5">Modular Fleet & Logistics Management</p>
        </div>

        {/* Main Card */}
        <div className="card shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Sign in</h2>
            <Link to="/register" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              New user? Create account →
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="email@fleetflow.test"
                className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                })}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="password123"
                  className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 text-sm font-semibold"
            >
              {isLoading ? <><LoadingSpinner size="sm" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          {/* Role selector */}
          <div className="mt-5">
            <p className="text-xs text-gray-400 text-center mb-3 font-medium uppercase tracking-wider">Quick login — click a role</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map(({ email, role, icon: Icon, color }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillCredentials(email)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs font-medium transition-all hover:scale-[1.02] ${color}`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{role}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-2">Password for all: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">password123</code></p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          FleetFlow v1.0 · Built for Odoo Hackathon 2025
        </p>
      </div>
    </div>
  )
}
