/* ─────────────────────────────────────────────────────────
   MaintenanceLogs.jsx
   OWNER: Member D — Maintenance, Drivers & Safety

   This file is a skeleton placeholder for Member D.
   Member D should implement:
     - Table: vehicle name, service type, cost, date, open/closed status
     - 'New Maintenance Log' form modal
     - 'Close Maintenance' button → PATCH /api/maintenance/:id/close
       (atomically: log.status = Closed + vehicle.status = Available)

   API endpoints to use:
     GET  /api/maintenance         → all logs (supports ?vehicle_id= filter)
     POST /api/maintenance         → create log, vehicle becomes In Shop atomically
     PATCH /api/maintenance/:id/close → close log, vehicle returns Available

   Shared components available:
     StatusPill, DataTable, Modal, LoadingSpinner (from src/components/)
     formatCurrency, formatDate (from src/lib/utils.js)
──────────────────────────────────────────────────────────── */
import { Wrench } from 'lucide-react'

export default function MaintenanceLogs() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance Logs</h1>
          <p className="page-subtitle">Track vehicle service history & costs</p>
        </div>
      </div>

      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <Wrench className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 font-medium mb-1">Maintenance Logs — Under Construction</p>
        <p className="text-slate-600 text-sm">This page is being built by Member D.</p>
      </div>
    </div>
  )
}
