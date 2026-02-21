import { cn } from '../lib/utils'
import LoadingSpinner from './LoadingSpinner'

export default function KPICard({ title, value, icon: Icon, color, subtitle, isLoading }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',    icon: 'text-blue-600',    border: 'border-blue-100',    value: 'text-blue-700',   ring: 'bg-blue-100' },
    red:    { bg: 'bg-red-50',     icon: 'text-red-600',     border: 'border-red-100',     value: 'text-red-700',    ring: 'bg-red-100'  },
    green:  { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100', value: 'text-emerald-700',ring: 'bg-emerald-100' },
    amber:  { bg: 'bg-amber-50',   icon: 'text-amber-600',   border: 'border-amber-100',   value: 'text-amber-700',  ring: 'bg-amber-100' },
    purple: { bg: 'bg-violet-50',  icon: 'text-violet-600',  border: 'border-violet-100',  value: 'text-violet-700', ring: 'bg-violet-100' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={cn(
      'bg-white border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200',
      c.border
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className={cn('text-3xl font-bold', c.value)}>{value ?? '—'}</p>
          )}
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3', c.ring)}>
          {isLoading
            ? <LoadingSpinner size="sm" />
            : <Icon className={cn('w-5 h-5', c.icon)} />
          }
        </div>
      </div>
    </div>
  )
}
