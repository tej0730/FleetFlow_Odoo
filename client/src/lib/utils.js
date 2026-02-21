import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function isLicenseExpired(dateStr) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export function isLicenseExpiringSoon(dateStr) {
  if (!dateStr) return false
  const expiry = new Date(dateStr)
  const inThirtyDays = new Date()
  inThirtyDays.setDate(inThirtyDays.getDate() + 30)
  return expiry <= inThirtyDays && expiry >= new Date()
}

export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) return
  import('xlsx').then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    XLSX.writeFile(wb, filename)
  })
}
