import { useState, useMemo } from 'react'
import { MapPin, Plus, Send, XCircle, CheckCircle2, Fuel } from 'lucide-react'
import { useVehicles } from '../hooks/useVehicles'
import { useDrivers } from '../hooks/useDrivers'
import { useTrips, useCreateTrip, useUpdateTripStatus } from '../hooks/useTrips'
import StatusPill from '../components/StatusPill'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import api from '../lib/api'

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

  // Fuel Logging Modal State
  const [fuelModal, setFuelModal] = useState({ open: false, tripId: null })
  const [fuelData, setFuelData] = useState({ liters: '', cost: '', odometer: '', date: new Date().toISOString().split('T')[0] })
  const [fuelSaving, setFuelSaving] = useState(false)

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
    // If completing, open fuel logging modal first
    if (newStatus === 'Completed') {
      setFuelModal({ open: true, tripId: id })
      setFuelData({ liters: '', cost: '', odometer: '', date: new Date().toISOString().split('T')[0] })
      return
    }
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => toast.success(`Trip ${newStatus.toLowerCase()}`),
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to update')
    })
  }

  // Submit fuel log + complete trip
  const handleFuelSubmit = async (e) => {
    e.preventDefault()
    setFuelSaving(true)
    try {
      // 1. Log fuel data
      await api.post('/fuel-logs', {
        trip_id: fuelModal.tripId,
        liters: Number(fuelData.liters),
        cost: Number(fuelData.cost),
        odometer_reading: Number(fuelData.odometer),
        date: fuelData.date
      })
      // 2. Complete the trip
      updateStatus.mutate({ id: fuelModal.tripId, status: 'Completed' }, {
        onSuccess: () => {
          toast.success('Trip completed with fuel log recorded!')
          setFuelModal({ open: false, tripId: null })
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Failed to complete trip')
      })
    } catch (err) {
      toast.error('Failed to save fuel log')
    } finally {
      setFuelSaving(false)
    }
  }

  // Skip fuel logging and just complete
  const handleSkipFuel = () => {
    updateStatus.mutate({ id: fuelModal.tripId, status: 'Completed' }, {
      onSuccess: () => {
        toast.success('Trip completed (no fuel log)')
        setFuelModal({ open: false, tripId: null })
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to complete trip')
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

      {/* Fuel Logging Modal — appears when completing a trip */}
      <Modal isOpen={fuelModal.open} onClose={() => setFuelModal({ open: false, tripId: null })} title="Complete Trip — Log Fuel & Expense">
        <p className="text-sm text-gray-500 mb-4">Record fuel consumption for this trip. You can also skip if data is not available.</p>
        <form onSubmit={handleFuelSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Fuel (Liters)</label>
              <input type="number" step="0.1" min="0" className="input" placeholder="e.g. 45.5" value={fuelData.liters} onChange={e => setFuelData(p => ({ ...p, liters: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Fuel Cost ($)</label>
              <input type="number" step="0.01" min="0" className="input" placeholder="e.g. 78.50" value={fuelData.cost} onChange={e => setFuelData(p => ({ ...p, cost: e.target.value }))} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Odometer Reading (km)</label>
              <input type="number" min="0" className="input" placeholder="e.g. 45230" value={fuelData.odometer} onChange={e => setFuelData(p => ({ ...p, odometer: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={fuelData.date} onChange={e => setFuelData(p => ({ ...p, date: e.target.value }))} required />
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <button type="button" onClick={handleSkipFuel} className="btn-ghost text-gray-500">Skip — Complete Without Log</button>
            <button type="submit" disabled={fuelSaving} className="btn-success">
              <Fuel className="w-4 h-4" /> {fuelSaving ? 'Saving...' : 'Log & Complete'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dispatch Form Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Plus className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-bold text-slate-900">Create New Trip</h2>
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
                <div className="mt-2 text-slate-700">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isOverweight ? 'bg-red-500' : isNearCapacity ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 font-semibold ${isOverweight ? 'text-red-500' : isNearCapacity ? 'text-amber-500' : 'text-slate-500'}`}>
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

      {/* Submit */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={!isFormValid || createTrip.isPending}
              className="btn-primary py-2.5 px-6"
            >
              <Send className="w-4 h-4" />
              {createTrip.isPending ? 'Creating...' : 'Dispatch Trip'}
            </button>
          </div>
        </form>
      </div>

      {/* Trips Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <MapPin className="w-5 h-5 text-brand-500" />
          <h3 className="text-lg font-bold text-slate-900">Active & Recent Trips</h3>
        </div>

        <div className="table-wrapper border-0 rounded-none">
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
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">Loading trips...</td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-slate-500">No trips found. Create one above.</td></tr>
              ) : (
                trips.map(trip => (
                  <tr key={trip.id}>
                    <td className="font-mono text-slate-500 font-medium">#{trip.id}</td>
                    <td>
                      <div className="text-sm font-bold text-slate-900">{trip.vehicle_name || getVehicleName(trip.vehicle_id)}</div>
                      <div className="text-xs font-semibold text-slate-500 mt-0.5">{trip.driver_name || getDriverName(trip.driver_id)}</div>
                    </td>
                    <td>
                      <div className="text-sm font-semibold text-slate-700">{trip.origin}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">→ {trip.destination}</div>
                    </td>
                    <td className="text-slate-700 font-bold">{trip.cargo_weight_kg} kg</td>
                    <td><StatusPill status={trip.status} /></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {trip.status === 'Draft' && (
                          <button onClick={() => handleStatusChange(trip.id, 'Dispatched')} className="btn-ghost text-brand-600 hover:text-brand-700 hover:bg-brand-50">
                            <Send className="w-4 h-4" /> Dispatch
                          </button>
                        )}
                        {trip.status === 'Dispatched' && (
                          <button onClick={() => handleStatusChange(trip.id, 'Completed')} className="btn-ghost text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                            <CheckCircle2 className="w-4 h-4" /> Complete
                          </button>
                        )}
                        {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                          <button onClick={() => handleStatusChange(trip.id, 'Cancelled')} className="btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50">
                            <XCircle className="w-4 h-4" /> Cancel
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
  </div>
  )
}
