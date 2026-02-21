import { useQuery } from '@tanstack/react-query'
import { Truck, Wrench, Activity, Package } from 'lucide-react'
import api from '../lib/api'
import KPICard from '../components/KPICard'

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 8000,
    retry: 1,
  })

  const kpis = [
    {
      title: 'Active Fleet',
      value: stats?.activeFleet ?? '—',
      subtitle: 'Vehicles currently on trip',
      icon: Truck,
      color: 'blue',
    },
    {
      title: 'Maintenance Alerts',
      value: stats?.maintenanceAlerts ?? '—',
      subtitle: 'Vehicles in shop',
      icon: Wrench,
      color: 'red',
    },
    {
      title: 'Utilization Rate',
      value: stats?.utilizationRate != null ? `${stats.utilizationRate}%` : '—',
      subtitle: 'Fleet efficiency',
      icon: Activity,
      color: 'green',
    },
    {
      title: 'Pending Cargo',
      value: stats?.pendingCargo ?? '—',
      subtitle: 'Trips in Draft status',
      icon: Package,
      color: 'amber',
    },
  ]

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Live fleet overview · Auto-refreshes every 8 seconds
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow inline-block" />
          Live
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <KPICard key={kpi.title} {...kpi} isLoading={isLoading} />
        ))}
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">System Overview</h3>
          <div className="space-y-2">
            <InfoRow label="Backend API" value="http://localhost:5000/api" />
            <InfoRow label="Auto-refresh" value="Every 8 seconds" />
            <InfoRow label="Auth method" value="JWT Bearer Token" />
            <InfoRow label="Database" value="PostgreSQL (fleetflow_dev)" />
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Navigation Guide</h3>
          <div className="space-y-2">
            <InfoRow label="Vehicle Registry" value="Manage fleet assets" />
            <InfoRow label="Trip Dispatcher" value="Create & manage deliveries" />
            <InfoRow label="Driver Profiles" value="Safety & license tracking" />
            <InfoRow label="Analytics" value="Charts & CSV export" />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs text-slate-300 font-mono">{value}</span>
    </div>
  )
}
