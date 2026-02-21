import { cn } from '../lib/utils'

const STATUS_STYLES = {
  // Vehicle
  Available:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'On Trip':   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'In Shop':   'bg-red-500/20 text-red-400 border-red-500/30',
  Retired:     'bg-slate-600/40 text-slate-400 border-slate-600/30',

  // Driver
  'On Duty':   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Off Duty':  'bg-slate-600/40 text-slate-400 border-slate-600/30',
  Suspended:   'bg-red-500/20 text-red-400 border-red-500/30',

  // Trip
  Draft:       'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Dispatched:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Completed:   'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Cancelled:   'bg-slate-600/40 text-slate-400 border-slate-600/30',

  // Maintenance
  Open:        'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Closed:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',

  // License
  EXPIRED:     'bg-red-600/30 text-red-400 border-red-600/50',
  'EXPIRING SOON': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export default function StatusPill({ status, className }) {
  const style = STATUS_STYLES[status] || 'bg-slate-700/40 text-slate-400 border-slate-700/30'
  return (
    <span className={cn('badge border', style, className)}>
      {status}
    </span>
  )
}
