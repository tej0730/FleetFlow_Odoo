import { cn } from '../lib/utils'
import LoadingSpinner from './LoadingSpinner'

export default function KPICard({ title, value, icon: Icon, color, subtitle, isLoading }) {
  const colorMap = {
    blue:    { bg: 'bg-blue-600/10',    icon: 'text-blue-400',    border: 'border-blue-600/20',    value: 'text-blue-100'  },
    red:     { bg: 'bg-red-600/10',     icon: 'text-red-400',     border: 'border-red-600/20',     value: 'text-red-100'   },
    green:   { bg: 'bg-emerald-600/10', icon: 'text-emerald-400', border: 'border-emerald-600/20', value: 'text-emerald-100'},
    amber:   { bg: 'bg-amber-600/10',   icon: 'text-amber-400',   border: 'border-amber-600/20',   value: 'text-amber-100' },
    purple:  { bg: 'bg-purple-600/10',  icon: 'text-purple-400',  border: 'border-purple-600/20',  value: 'text-purple-100'},
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={cn('card border', c.border, 'hover:border-opacity-50 transition-all duration-200 group')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className={cn('text-3xl font-bold', c.value)}>{value ?? '—'}</p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1.5">{subtitle}</p>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-4', c.bg)}>
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Icon className={cn('w-5 h-5', c.icon)} />
          )}
        </div>
      </div>
    </div>
  )
}
