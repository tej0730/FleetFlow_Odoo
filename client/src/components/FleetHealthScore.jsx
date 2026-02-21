/* ─────────────────────────────────────────────────────────
   FleetHealthScore.jsx
   OWNER: Member C — Fleet Health Score Card
   Note: Dashboard.jsx now includes this as a KPI card via
   the analytics summary endpoint. This standalone component
   can still be used on other pages if needed.
──────────────────────────────────────────────────────────── */
import { Shield } from 'lucide-react'
import { useVehicles } from '../hooks/useVehicles'

export default function FleetHealthScore() {
  const { data: vehicles = [], isLoading } = useVehicles()

  const totalVehicles = vehicles.length
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length
  const healthScore = totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0

  let scoreColor = 'text-emerald-700'
  let barColor = 'bg-emerald-500'
  let bgColor = 'bg-emerald-50 border-emerald-200'
  if (healthScore < 50) {
    scoreColor = 'text-red-700'
    barColor = 'bg-red-500'
    bgColor = 'bg-red-50 border-red-200'
  } else if (healthScore < 75) {
    scoreColor = 'text-amber-700'
    barColor = 'bg-amber-500'
    bgColor = 'bg-amber-50 border-amber-200'
  }

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-6 border ${bgColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-gray-500" />
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Fleet Health Score
        </h3>
      </div>
      <div className={`text-3xl font-extrabold ${scoreColor}`}>
        {healthScore}%
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {availableVehicles} of {totalVehicles} vehicles available
      </p>
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${healthScore}%` }}
        />
      </div>
    </div>
  )
}
