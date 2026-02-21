/* ─────────────────────────────────────────────────────────
   DriverProfiles.jsx
   OWNER: Member D — Maintenance, Drivers & Safety

   This file is a skeleton placeholder for Member D.
   Member D should implement:
     - Driver table: name, license number, expiry date, duty status, safety score
     - Add Driver form modal
     - Red badge on drivers with expired / expiring licenses
     - Duty status toggle button (On Duty / Off Duty / Suspended)
     - Safety score badge: green >80%, amber >60%, red <60%
     - Trip completion rate on each driver row

   API endpoints to use:
     GET  /api/drivers               → list all drivers
     POST /api/drivers               → add new driver
     PATCH /api/drivers/:id          → update duty_status, safety_score
     GET  /api/drivers/expiring-soon → drivers expiring in 30 days (used by Layout banner)

   Shared components available:
     StatusPill, DataTable, Modal, LoadingSpinner (from src/components/)
     isLicenseExpired(dateStr), isLicenseExpiringSoon(dateStr) (from src/lib/utils.js)
──────────────────────────────────────────────────────────── */
import { Users } from 'lucide-react'

export default function DriverProfiles() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Profiles</h1>
          <p className="page-subtitle">Safety compliance & license tracking</p>
        </div>
      </div>

      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <Users className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 font-medium mb-1">Driver Profiles — Under Construction</p>
        <p className="text-slate-600 text-sm">This page is being built by Member D.</p>
      </div>
    </div>
  )
}
