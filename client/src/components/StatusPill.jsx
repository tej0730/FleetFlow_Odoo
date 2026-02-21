import { cn } from '../lib/utils'

const STATUS_STYLES = {
  // Vehicle
  Available:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  'On Trip':   'bg-blue-100 text-blue-700 border-blue-200',
  'In Shop':   'bg-red-100 text-red-700 border-red-200',
  Retired:     'bg-gray-100 text-gray-500 border-gray-200',
  // Driver
  'On Duty':   'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Off Duty':  'bg-gray-100 text-gray-500 border-gray-200',
  Suspended:   'bg-red-100 text-red-700 border-red-200',
  // Trip
  Draft:       'bg-amber-100 text-amber-700 border-amber-200',
  Dispatched:  'bg-blue-100 text-blue-700 border-blue-200',
  Completed:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled:   'bg-gray-100 text-gray-500 border-gray-200',
  // Maintenance
  Open:        'bg-amber-100 text-amber-700 border-amber-200',
  Closed:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  // License
  EXPIRED:         'bg-red-100 text-red-700 border-red-300',
  'EXPIRING SOON': 'bg-orange-100 text-orange-700 border-orange-200',
}

export default function StatusPill({ status, className }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-500 border-gray-200'
  return (
    <span className={cn('badge border', style, className)}>
      {status}
    </span>
  )
}
