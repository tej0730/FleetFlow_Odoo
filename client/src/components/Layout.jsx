import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Users,
  Wrench,
  BarChart3,
  LogOut,
  AlertTriangle,
  Zap,
  ShieldCheck,
} from 'lucide-react'

const ALL_NAV = [
  { to: '/',            label: 'Dashboard',        icon: LayoutDashboard, roles: ['manager','dispatcher','safety','analyst'] },
  { to: '/vehicles',    label: 'Vehicle Registry', icon: Truck,           roles: ['manager'] },
  { to: '/trips',       label: 'Trip Dispatcher',  icon: MapPin,          roles: ['manager','dispatcher'] },
  { to: '/drivers',     label: 'Driver Profiles',  icon: Users,           roles: ['manager','safety'] },
  { to: '/maintenance', label: 'Maintenance Logs', icon: Wrench,          roles: ['manager'] },
  { to: '/analytics',   label: 'Analytics',        icon: BarChart3,       roles: ['manager','analyst'] },
]

const ROLE_STYLES = {
  manager:    'bg-indigo-100 text-indigo-700',
  dispatcher: 'bg-blue-100 text-blue-700',
  safety:     'bg-emerald-100 text-emerald-700',
  analyst:    'bg-amber-100 text-amber-700',
}

const ROLE_LABELS = {
  manager:    'Manager',
  dispatcher: 'Dispatcher',
  safety:     'Safety Officer',
  analyst:    'Analyst',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const role = user?.role || 'manager'

  const visibleNav = ALL_NAV.filter(item => item.roles.includes(role))

  const { data: expiringDrivers } = useQuery({
    queryKey: ['expiring-drivers'],
    queryFn: () => api.get('/drivers/expiring-soon').then(r => r.data),
    refetchInterval: 60_000,
    retry: false,
  })
  const expiringCount = expiringDrivers?.length || 0

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
      {/* ─── Sidebar ─── */}
      <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col glass-panel border-r border-slate-200/60 z-40 transition-all duration-300">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200/50">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-500 flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-extrabold text-slate-900 text-lg leading-none tracking-tight">FleetFlow</p>
            <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-widest">Platform</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active shadow-card' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="px-4 py-5 border-t border-slate-200/50 bg-slate-50/30">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-3 rounded-xl bg-white/60 border border-white shadow-sm backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-extrabold truncate">{user?.name || 'User'}</p>
              <p className="text-slate-500 text-[10px] truncate mt-0.5">{ROLE_LABELS[role] || role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50/80 text-sm font-bold transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen relative">
        {/* Background Decorative Blobs */}
        <div className="fixed top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-brand-400/10 blur-[100px] pointer-events-none z-0" />
        <div className="fixed bottom-[-10%] left-[20%] w-[30rem] h-[30rem] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0" />

        {/* License Expiry Banner */}
        {expiringCount > 0 && (
          <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-red-50/90 backdrop-blur-md border-b border-red-200 text-red-800 text-sm shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <span className="font-medium">
                <strong className="font-bold">{expiringCount} driver{expiringCount > 1 ? 's have' : ' has'}</strong>
                {' '}an expiring or expired license.{' '}
                <NavLink to="/drivers" className="underline hover:no-underline font-semibold ml-1 text-red-600">
                  Review Driver Profiles &rarr;
                </NavLink>
              </span>
            </div>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100/50 text-[10px] text-red-600 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Safety Alert
            </span>
          </div>
        )}

        <main className="flex-1 p-8 md:p-10 animate-fade-in relative z-10 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
