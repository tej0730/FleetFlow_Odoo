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
    <div className="flex min-h-screen bg-gray-50">
      {/* ─── Sidebar ─── */}
      <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col bg-white border-r border-gray-200 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-base leading-none">FleetFlow</p>
            <p className="text-gray-400 text-[10px] mt-0.5 uppercase tracking-widest">Fleet Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg bg-gray-50 border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-xs font-semibold truncate">{user?.name || 'User'}</p>
              <span className={`role-badge mt-0.5 ${ROLE_STYLES[role] || 'bg-gray-100 text-gray-600'}`}>
                {ROLE_LABELS[role] || role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main area ─── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* License Expiry Banner */}
        {expiringCount > 0 && (
          <div className="expiry-banner animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>
              <span className="font-semibold">{expiringCount} driver{expiringCount > 1 ? 's have' : ' has'}</span>
              {' '}an expiring or expired license.{' '}
              <NavLink to="/drivers" className="underline hover:no-underline font-semibold">
                Review Driver Profiles →
              </NavLink>
            </span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-red-400 uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" /> Safety Alert
            </span>
          </div>
        )}

        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
