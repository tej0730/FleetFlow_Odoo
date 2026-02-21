import { cn } from '../lib/utils'
import LoadingSpinner from './LoadingSpinner'

export default function KPICard({ title, value, icon: Icon, color, subtitle, isLoading }) {
  const colorMap = {
    blue:   { 
      bg: 'from-blue-50/50 to-white hover:from-blue-50/80', 
      icon: 'text-blue-600', 
      border: 'border-blue-100/60 hover:border-blue-300', 
      value: 'text-blue-700', 
      ring: 'bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 shadow-sm' 
    },
    red:    { 
      bg: 'from-red-50/50 to-white hover:from-red-50/80', 
      icon: 'text-red-600', 
      border: 'border-red-100/60 hover:border-red-300', 
      value: 'text-red-700', 
      ring: 'bg-gradient-to-br from-red-100 to-red-50 border border-red-200 shadow-sm' 
    },
    green:  { 
      bg: 'from-emerald-50/50 to-white hover:from-emerald-50/80', 
      icon: 'text-emerald-600', 
      border: 'border-emerald-100/60 hover:border-emerald-300', 
      value: 'text-emerald-700',
      ring: 'bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 shadow-sm' 
    },
    amber:  { 
      bg: 'from-amber-50/50 to-white hover:from-amber-50/80', 
      icon: 'text-amber-600', 
      border: 'border-amber-100/60 hover:border-amber-300', 
      value: 'text-amber-700', 
      ring: 'bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 shadow-sm' 
    },
    purple: { 
      bg: 'from-indigo-50/50 to-white hover:from-indigo-50/80', 
      icon: 'text-indigo-600', 
      border: 'border-indigo-100/60 hover:border-indigo-300', 
      value: 'text-indigo-700', 
      ring: 'bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-200 shadow-sm' 
    },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={cn(
      'group relative overflow-hidden bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-to-br',
      c.bg, c.border, 'border'
    )}>
      {/* Decorative background glow */}
      <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] opacity-20 transition-opacity group-hover:opacity-40", colorMap[color]?.icon.replace('text', 'bg'))} />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 opacity-80">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-200/50 rounded-lg animate-pulse" />
          ) : (
            <p className={cn('text-4xl font-extrabold tracking-tight', c.value)}>{value ?? '—'}</p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-2">{subtitle}</p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 group-hover:scale-110 transition-transform duration-300', c.ring)}>
          {isLoading
            ? <LoadingSpinner size="sm" />
            : <Icon className={cn('w-6 h-6 drop-shadow-sm', c.icon)} />
          }
        </div>
      </div>
    </div>
  )
}
