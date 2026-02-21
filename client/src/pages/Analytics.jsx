import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { Download, TrendingUp, PieChart } from 'lucide-react'
import api from '../lib/api'
import { formatCurrency, exportToCSV } from '../lib/utils'
import LoadingSpinner from '../components/LoadingSpinner'

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  labelStyle: { color: '#6b7280', fontSize: 12 },
  itemStyle: { color: '#374151', fontSize: 12 },
}

const STATUS_COLORS = ['#10b981', '#6366f1', '#ef4444', '#9ca3af']

export default function Analytics() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => api.get('/analytics/summary').then(r => r.data),
    retry: 1,
  })

  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ['monthly-report'],
    queryFn: () => api.get('/analytics/monthly').then(r => r.data),
    retry: 1,
  })

  const handleExport = () => {
    if (!monthly?.length) return
    exportToCSV(monthly, 'fleetflow_monthly_report.csv')
  }

  // Utilization trend from summary (single point for now, or empty)
  const utilizationData = summary
    ? [{ month: 'Current', utilization: summary.utilizationRate || 0 }]
    : []

  // Vehicle status breakdown
  const statusBreakdown = summary
    ? [
        { status: 'Available',  count: 0 }, // backend /analytics/summary doesn't return breakdown
        { status: 'On Trip',    count: 0 },
        { status: 'In Shop',    count: 0 },
        { status: 'Retired',    count: 0 },
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
          disabled={!monthly?.length}
          className="btn-primary"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Fleet Utilization" value={`${summary.utilizationRate}%`} />
          <StatCard label="Total Acq. Cost" value={formatCurrency(summary.totalAcquisitionCost)} />
          <StatCard label="Avg Cost / Vehicle" value={formatCurrency(summary.fleetCostPerVehicle)} />
        </div>
      )}

      {/* Monthly Financial Table */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-700">Monthly Financial Summary</h3>
          </div>
          <span className="text-xs text-gray-400">Click Export CSV to download</span>
        </div>

        {loadingMonthly ? (
          <div className="py-10 flex justify-center"><LoadingSpinner size="lg" /></div>
        ) : !monthly?.length ? (
          <p className="text-gray-400 text-sm py-10 text-center">No monthly report data yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="ff-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Fuel (Est.) </th>
                  <th>Maintenance</th>
                  <th>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {monthly.map((row, i) => (
                  <tr key={i}>
                    <td className="font-medium text-gray-900">{row.month}</td>
                    <td className="font-mono text-emerald-600">{formatCurrency(row.revenue)}</td>
                    <td className="font-mono text-amber-600">{formatCurrency(row.estimated_fuel_cost)}</td>
                    <td className="font-mono text-red-500">{formatCurrency(row.maintenance_cost)}</td>
                    <td className={`font-mono font-semibold ${(row.net_profit ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(row.net_profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recharts Revenue Bar Chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <PieChart className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-700">Monthly Revenue vs Costs</h3>
        </div>
        {loadingMonthly ? (
          <div className="h-56 flex items-center justify-center"><LoadingSpinner size="lg" /></div>
        ) : !monthly?.length ? (
          <div className="h-56 flex items-center justify-center">
            <p className="text-gray-400 text-sm">No data available yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v, name) => [formatCurrency(v), name]} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#6b7280' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[3,3,0,0]} />
              <Bar dataKey="maintenance_cost" name="Maintenance" fill="#ef4444" radius={[3,3,0,0]} />
              <Bar dataKey="estimated_fuel_cost" name="Fuel (Est.)" fill="#f59e0b" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-2xl font-bold text-indigo-700">{value}</p>
    </div>
  )
}
