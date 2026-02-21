/* ─────────────────────────────────────────────────────────
   TripDispatcher.jsx
   OWNER: Member C — Trip Dispatcher & Core Logic

   Features:
     - Vehicle dropdown (Available only)
     - Driver dropdown (On Duty + valid license only)
     - Cargo weight input with live capacity validation
     - Trips table with status pills + action buttons
     - Wired to PATCH /api/trips/:id/status for atomic status changes
──────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react'
import { MapPin, Plus, Send, XCircle, CheckCircle2 } from 'lucide-react'
import { useVehicles } from '../hooks/useVehicles'
import { useDrivers } from '../hooks/useDrivers'
import { useTrips, useCreateTrip, useUpdateTripStatus } from '../hooks/useTrips'
import StatusPill from '../components/StatusPill'
import toast from 'react-hot-toast'

export default function TripDispatcher() {
  // Data Fetching
  const { data: vehicles = [] } = useVehicles('Available')
  const { data: allVehicles = [] } = useVehicles()
  const { data: drivers = [] } = useDrivers()
  const { data: trips = [], isLoading: isLoadingTrips } = useTrips()

  const createTrip = useCreateTrip()
  const updateStatus = useUpdateTripStatus()

  // Only On Duty drivers with valid (non-expired) licenses
  const availableDrivers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return drivers.filter(d =>
      (d.duty_status === 'On Duty' || d.duty_status === 'Available') &&
      (!d.license_expiry || d.license_expiry >= today)
    )
  }, [drivers])

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [cargoWeight, setCargoWeight] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')

  // Validation
  const vehicle = vehicles.find(v => v.id.toString() === selectedVehicle)
  const maxCapacity = vehicle ? vehicle.max_capacity_kg : 0
  const cargoNum = Number(cargoWeight) || 0
  const isOverweight = cargoWeight && vehicle && cargoNum > maxCapacity
  const capacityPercent = vehicle && cargoWeight ? Math.min((cargoNum / maxCapacity) * 100, 100) : 0
  const isNearCapacity = capacityPercent >= 90 && !isOverweight

  const isFormValid = selectedVehicle && selectedDriver && cargoWeight && origin && destination && !isOverweight

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) return

    createTrip.mutate({
      vehicle_id: Number(selectedVehicle),
      driver_id: Number(selectedDriver),
      cargo_weight_kg: cargoNum,
      origin,
      destination
    }, {
      onSuccess: () => {
        toast.success('Trip created successfully!')
        setSelectedVehicle('')
        setSelectedDriver('')
        setCargoWeight('')
        setOrigin('')
        setDestination('')
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Failed to create trip')
      }
    })
  }

  const handleStatusChange = (id, newStatus) => {
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => toast.success(`Trip ${newStatus.toLowerCase()}`),
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to update')
    })
  }

  const getVehicleName = (id) => allVehicles.find(v => v.id === id)?.name || `Vehicle #${id}`
  const getDriverName = (id) => drivers.find(d => d.id === id)?.name || `Driver #${id}`

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Trip Dispatcher</h1>
          <p className="page-subtitle">Assign vehicles & drivers to deliveries</p>
        </div>
      </div>

      {/* Dispatch Form Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Plus className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-900">Create New Trip</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {/* Vehicle dropdown */}
            <div>
              <label className="label">Vehicle</label>
              <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="input" required>
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.max_capacity_kg}kg)</option>
                ))}
              </select>
            </div>

            {/* Driver dropdown */}
            <div>
              <label className="label">Driver</label>
              <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="input" required>
                <option value="">Select Driver</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Cargo Weight */}
            <div>
              <label className="label">Cargo Weight (kg)</label>
              <input
                type="number"
                value={cargoWeight}
                onChange={e => setCargoWeight(e.target.value)}
                className={`input ${isOverweight ? '!border-red-400 !ring-red-400' : isNearCapacity ? '!border-amber-400' : ''}`}
                placeholder="e.g. 1500"
                required
                min="1"
              />
              {vehicle && cargoWeight && (
                <div className="mt-2">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isOverweight ? 'bg-red-500' : isNearCapacity ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${isOverweight ? 'text-red-600' : isNearCapacity ? 'text-amber-600' : 'text-gray-400'}`}>
                    {isOverweight
                      ? `⚠️ Exceeds capacity by ${cargoNum - maxCapacity}kg!`
                      : `${cargoNum}/${maxCapacity}kg (${Math.round(capacityPercent)}%)`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Origin */}
            <div>
              <label className="label">Origin</label>
              <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} className="input" placeholder="Warehouse A" required />
            </div>

            {/* Destination */}
            <div>
              <label className="label">Destination</label>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)} className="input" placeholder="Hub B" required />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={!isFormValid || createTrip.isPending} className="btn-primary">
              <Send className="w-4 h-4" />
              {createTrip.isPending ? 'Creating...' : 'Dispatch Trip'}
            </button>
          </div>
        </form>
      </div>

      {/* Trips Table */}
      <div className="table-wrapper">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
          <MapPin className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-semibold text-gray-900">Active & Recent Trips</h3>
        </div>

        <table className="ff-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle / Driver</th>
              <th>Route</th>
              <th>Cargo</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingTrips ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-400">Loading trips...</td></tr>
            ) : trips.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-400">No trips found. Create one above.</td></tr>
            ) : (
              trips.map(trip => (
                <tr key={trip.id}>
                  <td className="font-mono text-gray-500">#{trip.id}</td>
                  <td>
                    <div className="text-sm text-gray-900 font-medium">{trip.vehicle_name || getVehicleName(trip.vehicle_id)}</div>
                    <div className="text-xs text-gray-500">{trip.driver_name || getDriverName(trip.driver_id)}</div>
                  </td>
                  <td>
                    <div className="text-sm text-gray-900">{trip.origin}</div>
                    <div className="text-xs text-gray-500">→ {trip.destination}</div>
                  </td>
                  <td className="text-gray-700">{trip.cargo_weight_kg} kg</td>
                  <td><StatusPill status={trip.status} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {trip.status === 'Draft' && (
                        <button onClick={() => handleStatusChange(trip.id, 'Dispatched')} className="btn-ghost text-blue-600 hover:text-blue-800">
                          <Send className="w-3.5 h-3.5" /> Dispatch
                        </button>
                      )}
                      {trip.status === 'Dispatched' && (
                        <button onClick={() => handleStatusChange(trip.id, 'Completed')} className="btn-ghost text-emerald-600 hover:text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                        </button>
                      )}
                      {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                        <button onClick={() => handleStatusChange(trip.id, 'Cancelled')} className="btn-ghost text-red-600 hover:text-red-800">
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
