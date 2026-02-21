import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Download, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, exportToCSV } from '../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'

const chartTooltipStyle = {
  contentStyle: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#e2e8f0' },
}

export default function Analytics() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.get('/analytics/summary').then(r => r.data),
    retry: 1,
  })

  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ['monthly-report'],
    queryFn: () => api.get('/reports/monthly').then(r => r.data),
    retry: 1,
  })

  const handleExport = () => {
    if (!monthly || monthly.length === 0) return
    exportToCSV(monthly, 'fleetflow_monthly_report.csv')
  }

  // Utilization chart data from summary
  const utilizationData = summary?.utilizationByMonth || []

  // Vehicle status breakdown data
  const statusData = summary?.vehicleStatusBreakdown
    ? [
        { status: 'Available', count: summary.vehicleStatusBreakdown.available || 0 },
        { status: 'On Trip',   count: summary.vehicleStatusBreakdown.onTrip || 0 },
        { status: 'In Shop',   count: summary.vehicleStatusBreakdown.inShop || 0 },
        { status: 'Retired',   count: summary.vehicleStatusBreakdown.retired || 0 },
      ]
    : []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Fleet performance & financial overview</p>
        </div>
        <button
          id="export-csv-btn"
          onClick={handleExport}
          disabled={!monthly || monthly.length === 0}
          className="btn-primary"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        {/* Utilization LineChart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Fleet Utilization Rate (%)</h3>
          </div>
          {loadingSummary ? (
            <div className="h-56 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : utilizationData.length === 0 ? (
            <EmptyChartState message="No utilization data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                <Tooltip {...chartTooltipStyle} formatter={v => [`${v}%`, 'Utilization']} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="utilization"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6, fill: '#60a5fa' }}
                  name="Utilization"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Vehicle Status BarChart */}
        <div className="card">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-200">Vehicle Status Breakdown</h3>
          </div>
          {loadingSummary ? (
            <div className="h-56 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : statusData.length === 0 ? (
            <EmptyChartState message="No vehicle status data available yet." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="status" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} formatter={v => [v, 'Vehicles']} />
                <Bar dataKey="count" name="Vehicles" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => {
                    const colors = ['#10b981', '#3b82f6', '#ef4444', '#6b7280']
                    return <rect key={index} fill={colors[index] || '#3b82f6'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-200">Monthly Financial Summary</h3>
          <span className="text-xs text-slate-500">Click Export CSV to download</span>
        </div>

        {loadingMonthly ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : !monthly || monthly.length === 0 ? (
          <p className="text-slate-500 text-sm py-10 text-center">
            No monthly report data available yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="ff-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Fuel Cost</th>
                  <th>Maintenance</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((row, i) => {
                  const net = (row.revenue || 0) - (row.fuel_cost || 0) - (row.maintenance_cost || 0)
                  return (
                    <tr key={i}>
                      <td className="font-medium text-slate-100">{row.month}</td>
                      <td className="font-mono text-emerald-400">{formatCurrency(row.revenue)}</td>
                      <td className="font-mono text-amber-400">{formatCurrency(row.fuel_cost)}</td>
                      <td className="font-mono text-red-400">{formatCurrency(row.maintenance_cost)}</td>
                      <td className={`font-mono font-semibold ${net >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                        {formatCurrency(net)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyChartState({ message }) {
  return (
    <div className="h-56 flex items-center justify-center">
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  )
}
