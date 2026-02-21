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
  Activity,
  Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',            label: 'Dashboard',         icon: LayoutDashboard },
  { to: '/vehicles',    label: 'Vehicle Registry',  icon: Truck },
  { to: '/trips',       label: 'Trip Dispatcher',   icon: MapPin },
  { to: '/drivers',     label: 'Driver Profiles',   icon: Users },
  { to: '/maintenance', label: 'Maintenance Logs',  icon: Wrench },
  { to: '/analytics',   label: 'Analytics',         icon: BarChart3 },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Global license expiry banner data
  const { data: expiringDrivers } = useQuery({
    queryKey: ['expiring-drivers'],
    queryFn: () => api.get('/drivers/expiring-soon').then(r => r.data),
    refetchInterval: 60_000,
    retry: false,
  })

  const expiringCount = expiringDrivers?.length || 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* ─── Sidebar ─── */}
      <aside className="fixed top-0 left-0 h-screen w-60 flex flex-col bg-slate-900 border-r border-slate-800 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">FleetFlow</p>
            <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-widest">Pro</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg bg-slate-800/50">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-100 text-xs font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-slate-500 text-[10px] truncate capitalize">{user?.role || 'manager'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Global License Expiry Banner */}
        {expiringCount > 0 && (
          <div className="expiry-banner animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>
              <span className="font-semibold">{expiringCount} driver{expiringCount > 1 ? 's' : ''}</span>
              {' '}
              {expiringCount > 1 ? 'have' : 'has'} an expiring or expired license.{' '}
              <NavLink to="/drivers" className="underline hover:no-underline font-medium">
                Review Driver Profiles →
              </NavLink>
            </span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-red-300 uppercase tracking-wider">
              <Activity className="w-3 h-3" /> Safety Alert
            </span>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
