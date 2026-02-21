import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    refetchInterval: 8000,
  });

  // Fleet Health Score = (available vehicles / total fleet) * 100
  // activeFleet includes Available + On Trip, so we use the utilization differently
  // We'll fetch vehicle counts separately for accurate health score
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-all'],
    queryFn: () => api.get('/vehicles').then(r => r.data),
    refetchInterval: 8000,
  });

  const totalVehicles = vehicles?.length || 0;
  const availableVehicles = vehicles?.filter(v => v.status === 'Available').length || 0;
  const healthScore = totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0;
  const healthClass = healthScore >= 75 ? 'health-good' : healthScore >= 50 ? 'health-warn' : 'health-bad';

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Real-time fleet overview — auto-refreshes every 8 seconds</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Active Fleet</span>
          <span className="kpi-value" style={{ color: '#60a5fa' }}>
            {stats?.activeFleet ?? '—'}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Maintenance Alerts</span>
          <span className="kpi-value" style={{ color: stats?.maintenanceAlerts > 0 ? '#f87171' : '#4ade80' }}>
            {stats?.maintenanceAlerts ?? '—'}
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Utilization Rate</span>
          <span className="kpi-value" style={{ color: '#a78bfa' }}>
            {stats?.utilizationRate ?? '—'}%
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pending Cargo</span>
          <span className="kpi-value" style={{ color: '#fbbf24' }}>
            {stats?.pendingCargo ?? 0} kg
          </span>
        </div>
        <div className="kpi-card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <span className="kpi-label">🛡️ Fleet Health Score</span>
          <span className={`kpi-value ${healthClass}`}>
            {healthScore}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {availableVehicles} of {totalVehicles} vehicles available
          </span>
        </div>
      </div>
    </div>
  );
}
