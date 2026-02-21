/* ─────────────────────────────────────────────────────────
   FleetHealthScore.jsx
   OWNER: Member C — Fleet Health Score Card

   Formula: (availableVehicles / totalVehicles) * 100
   Used on Dashboard page as a KPI widget
──────────────────────────────────────────────────────────── */
import { Shield } from 'lucide-react'
import { useVehicles } from '../hooks/useVehicles'

export default function FleetHealthScore() {
  const { data: vehicles = [], isLoading } = useVehicles()

  const totalVehicles = vehicles.length
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length
  const healthScore = totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0

  // Color coding: green >= 75%, amber >= 50%, red < 50%
  let scoreColor = 'text-emerald-400'
  let barColor = 'bg-emerald-500'
  let bgGlow = 'border-emerald-500/20'
  if (healthScore < 50) {
    scoreColor = 'text-red-400'
    barColor = 'bg-red-500'
    bgGlow = 'border-red-500/20'
  } else if (healthScore < 75) {
    scoreColor = 'text-amber-400'
    barColor = 'bg-amber-500'
    bgGlow = 'border-amber-500/20'
  }

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4 mb-4" />
        <div className="h-8 bg-slate-700 rounded w-1/2" />
      </div>
    )
  }

  return (
    <div className={`card ${bgGlow}`}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-slate-400" />
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          Fleet Health Score
        </h3>
      </div>
      <div className={`text-3xl font-extrabold ${scoreColor}`}>
        {healthScore}%
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {availableVehicles} of {totalVehicles} vehicles available
      </p>

      {/* Health bar */}
      <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${healthScore}%` }}
        />
      </div>
    </div>
  )
}
