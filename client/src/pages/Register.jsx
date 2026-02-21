import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Zap, Eye, EyeOff,
  Truck, MapPin, ShieldCheck, BarChart3,
  UserPlus
} from 'lucide-react'

const ROLES = [
  {
    value: 'manager',
    label: 'Fleet Manager',
    description: 'Full access — vehicles, trips, drivers, analytics',
    icon: Truck,
    color: 'border-indigo-300 bg-indigo-50 text-indigo-700',
    activeColor: 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200',
  },
  {
    value: 'dispatcher',
    label: 'Dispatcher',
    description: 'Trip creation and dispatching',
    icon: MapPin,
    color: 'border-blue-300 bg-blue-50 text-blue-700',
    activeColor: 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200',
  },
  {
    value: 'safety',
    label: 'Safety Officer',
    description: 'Driver profiles and license monitoring',
    icon: ShieldCheck,
    color: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    activeColor: 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200',
  },
  {
    value: 'analyst',
    label: 'Financial Analyst',
    description: 'Analytics, reporting, and CSV exports',
    icon: BarChart3,
    color: 'border-amber-300 bg-amber-50 text-amber-700',
    activeColor: 'border-amber-600 bg-amber-600 text-white shadow-lg shadow-amber-200',
  },
]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ name, email, password }) => {
    if (!selectedRole) {
      toast.error('Please select a role to continue.')
      return
    }

    setIsLoading(true)
    try {
      // Call the register endpoint
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: selectedRole }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Auto-login after registration by storing token + user from response
      const { token, user } = data
      localStorage.setItem('fleetflow_token', token)
      localStorage.setItem('fleetflow_user', JSON.stringify(user))

      // Re-trigger React state by calling login context directly
      await login(email, password)

      toast.success(`Welcome to FleetFlow, ${user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg mb-4">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FleetFlow</h1>
          <p className="text-gray-500 text-sm mt-1.5">Create your account</p>
        </div>

        {/* Card */}
        <div className="card shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Create Account
            </h2>
            <Link
              to="/login"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Already have an account? Sign in →
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label">Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Alice Manager"
                className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('name', {
                  required: 'Full name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
              />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@company.com"
                className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' }
                })}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="label !mb-0">Password</label>
                <span className="text-[10px] text-gray-500 font-medium tracking-wide">Must be at least 6 characters</span>
              </div>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className={`input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
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

            {/* Role Selection */}
            <div>
              <label className="label mb-2.5">Select Your Role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(({ value, label, description, icon: Icon, color, activeColor }) => {
                  const isActive = selectedRole === value
                  return (
                    <button
                      key={value}
                      type="button"
                      id={`role-${value}`}
                      onClick={() => setSelectedRole(value)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-150 hover:scale-[1.02] ${isActive ? activeColor : color}`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold leading-none mb-1">{label}</p>
                        <p className={`text-[10px] leading-tight ${isActive ? 'text-white/80' : 'opacity-60'}`}>
                          {description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {!selectedRole && (
                <p className="text-gray-400 text-[10px] mt-1.5 text-center">Click a role to select it</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 text-sm font-semibold mt-2"
            >
              {isLoading
                ? <><LoadingSpinner size="sm" /> Creating account...</>
                : <><UserPlus className="w-4 h-4" /> Create Account</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          FleetFlow v1.0 · Built for Odoo Hackathon 2025
        </p>
      </div>
    </div>
  )
}
