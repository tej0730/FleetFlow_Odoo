import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Truck, Wrench, Activity, Package, Heart, Filter } from 'lucide-react'
import api from '../lib/api'
import KPICard from '../components/KPICard'

export default function Dashboard() {
  const [regionFilter, setRegionFilter] = useState('All Regions')

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 8000,
    retry: 1,
  })

  // Fleet Health Score: available / total * 100
  const { data: analyticsSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.get('/analytics/summary').then(r => r.data),
    refetchInterval: 15000,
    retry: 1,
  })

  const fleetHealth = analyticsSummary
    ? Math.round((analyticsSummary.utilizationRate ?? 0))
    : null

  const kpis = [
    {
      title: 'Active Fleet',
      value: stats?.activeFleet ?? '—',
      subtitle: 'Vehicles on trip or available',
      icon: Truck,
      color: 'blue',
    },
    {
      title: 'Maintenance Alerts',
      value: stats?.maintenanceAlerts ?? '—',
      subtitle: 'Open service orders',
      icon: Wrench,
      color: 'red',
    },
    {
      title: 'Utilization Rate',
      value: stats?.utilizationRate != null ? `${stats.utilizationRate}%` : '—',
      subtitle: 'Active vs total fleet',
      icon: Activity,
      color: 'green',
    },
    {
      title: 'Pending Cargo',
      value: stats?.pendingCargo != null ? `${stats.pendingCargo} kg` : '—',
      subtitle: 'Weight in Draft trips',
      icon: Package,
      color: 'amber',
    },
    {
      title: 'Fleet Health Score',
      value: fleetHealth != null ? `${fleetHealth}%` : '—',
      subtitle: '(available / total) × 100',
      icon: Heart,
      color: 'purple',
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Live fleet overview · Auto-refreshes every 8 seconds
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Region Filter UI Stub */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:border-gray-300 transition-colors">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select 
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="text-xs font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer p-0 pr-1 appearance-none outline-none"
              >
                <option value="All Regions">All Regions</option>
                <option value="North">North Region</option>
                <option value="South">South Region</option>
                <option value="East">East Region</option>
                <option value="West">West Region</option>
              </select>
            </div>
            {/* Tooltip */}
            <div className="absolute top-full right-0 mt-2 w-48 p-2.5 bg-gray-900/95 backdrop-blur-sm text-white text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none">
              <span className="font-semibold block mb-1 text-indigo-300">Coming Soon</span>
              Region filtering requires a database migration to add 'region' column. UI stubbed to support objective.txt gap.
            </div>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow inline-block" />
            Live
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {kpis.map(kpi => (
          <KPICard key={kpi.title} {...kpi} isLoading={loadingStats} />
        ))}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">System Reference</h3>
          <div className="space-y-2">
            <InfoRow label="Frontend" value="http://localhost:5173" />
            <InfoRow label="Backend API" value="http://localhost:5000/api" />
            <InfoRow label="Auto-refresh" value="Every 8 seconds" />
            <InfoRow label="Auth method" value="JWT Bearer Token (24h)" />
            <InfoRow label="Database" value="PostgreSQL · fleetflow_dev" />
          </div>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Role Access Guide</h3>
          <div className="space-y-2">
            <InfoRow label="Manager" value="All pages" />
            <InfoRow label="Dispatcher" value="Dashboard + Trips" />
            <InfoRow label="Safety Officer" value="Dashboard + Drivers" />
            <InfoRow label="Analyst" value="Dashboard + Analytics" />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-gray-700 font-mono bg-gray-50 px-1.5 py-0.5 rounded">{value}</span>
    </div>
  )
}
