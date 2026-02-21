/* ─────────────────────────────────────────────────────────
   TripDispatcher.jsx
   OWNER: Member C — Trip Dispatcher & Core Logic

   This file is a skeleton placeholder for Member C.
   Member C should implement:
     - Vehicle dropdown (Available only)
     - Driver dropdown (On Duty + valid license only)
     - Cargo weight input with live validation against max_capacity_kg
     - Trips table with status pills and action buttons (Dispatch / Complete / Cancel)
     - Wire status buttons to PATCH /api/trips/:id/status
     - Fleet Health Score card: (available/totalVehicles * 100)

   API endpoints to use:
     GET  /api/trips            → list all trips
     POST /api/trips            → create new trip
     PATCH /api/trips/:id/status → update status + atomic vehicle/driver flip
     GET  /api/vehicles?status=Available
     GET  /api/drivers          → filter On Duty + non-expired license client-side
──────────────────────────────────────────────────────────── */
import { MapPin } from 'lucide-react'

export default function TripDispatcher() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trip Dispatcher</h1>
          <p className="page-subtitle">Assign vehicles & drivers to deliveries</p>
        </div>
      </div>

      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <MapPin className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 font-medium mb-1">Trip Dispatcher — Under Construction</p>
        <p className="text-slate-600 text-sm">This page is being built by Member C.</p>
      </div>
    </div>
  )
}
