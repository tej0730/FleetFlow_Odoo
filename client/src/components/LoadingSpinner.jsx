import { cn } from '../lib/utils'

export default function LoadingSpinner({ size = 'md', className }) {
  const sizeClass = {
    xs:  'w-3 h-3 border',
    sm:  'w-4 h-4 border-2',
    md:  'w-6 h-6 border-2',
    lg:  'w-8 h-8 border-2',
    xl:  'w-12 h-12 border-[3px]',
  }[size] || 'w-6 h-6 border-2'

  return (
    <div
      className={cn(
        sizeClass,
        'rounded-full border-gray-200 border-t-indigo-600 animate-spin',
        className
      )}
    />
  )
}
