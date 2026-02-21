import { useState } from 'react'
import { Truck, Plus, Power } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import StatusPill from '../components/StatusPill'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

export default function VehicleRegistry() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '', license_plate: '', type: 'Van', max_capacity_kg: '', acquisition_cost: ''
  })
  const [formError, setFormError] = useState('')

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles', 'all'],
    queryFn: () => api.get('/vehicles').then(r => r.data),
    refetchInterval: 8000
  })

  const createVehicle = useMutation({
    mutationFn: (data) => api.post('/vehicles', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setIsModalOpen(false)
      setFormData({ name: '', license_plate: '', type: 'Van', max_capacity_kg: '', acquisition_cost: '' })
      setFormError('')
      toast.success('Vehicle registered successfully!')
    },
    onError: (err) => {
      setFormError(err.response?.data?.error || 'Failed to create vehicle')
    }
  })

  // Retire / Restore toggle mutation
  const toggleRetire = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/vehicles/${id}`, { status }).then(r => r.data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success(vars.status === 'Retired' ? 'Vehicle retired' : 'Vehicle restored to Available')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update vehicle')
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    if (!formData.name || !formData.license_plate || !formData.max_capacity_kg || !formData.acquisition_cost) {
      setFormError('All fields are required')
      return
    }
    if (vehicles.some(v => v.license_plate === formData.license_plate)) {
      setFormError('License plate already exists')
      return
    }
    createVehicle.mutate({
      ...formData,
      max_capacity_kg: Number(formData.max_capacity_kg),
      acquisition_cost: Number(formData.acquisition_cost)
    })
  }

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))

  // Summary counts
  const available = vehicles.filter(v => v.status === 'Available').length
  const onTrip = vehicles.filter(v => v.status === 'On Trip').length
  const inShop = vehicles.filter(v => v.status === 'In Shop').length
  const retired = vehicles.filter(v => v.status === 'Retired').length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Registry</h1>
          <p className="page-subtitle">Manage your fleet assets, track capacity and status</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {/* Fleet Summary Bar */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{available} Available</span>
        <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{onTrip} On Trip</span>
        <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{inShop} In Shop</span>
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">{retired} Retired</span>
      </div>

      {/* Add Vehicle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Vehicle">
        {formError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            ⚠️ {formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Vehicle Name / Model</label>
            <input type="text" required placeholder="e.g. Toyota Van-05" className="input" value={formData.name} onChange={set('name')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">License Plate</label>
              <input type="text" required placeholder="e.g. MH-12-AB-1234" className="input" value={formData.license_plate} onChange={set('license_plate')} />
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={formData.type} onChange={set('type')}>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Bike">Bike</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max Capacity (kg)</label>
              <input type="number" required min="1" className="input" value={formData.max_capacity_kg} onChange={set('max_capacity_kg')} />
            </div>
            <div>
              <label className="label">Acquisition Cost ($)</label>
              <input type="number" required min="1" className="input" value={formData.acquisition_cost} onChange={set('acquisition_cost')} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createVehicle.isPending} className="btn-primary">
              {createVehicle.isPending ? 'Saving...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Vehicle Table */}
      <div className="table-wrapper">
        <table className="ff-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-400">Loading vehicles...</td></tr>
            ) : vehicles.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-gray-400">No vehicles registered yet.</td></tr>
            ) : (
              vehicles.map(v => (
                <tr key={v.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{v.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{v.license_plate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-700">{v.type}</td>
                  <td className="text-gray-700">{v.max_capacity_kg?.toLocaleString()} kg</td>
                  <td className="text-gray-700 font-mono">{v.odometer?.toLocaleString()} km</td>
                  <td><StatusPill status={v.status} /></td>
                  <td className="text-right">
                    {v.status === 'Available' && (
                      <button
                        onClick={() => toggleRetire.mutate({ id: v.id, status: 'Retired' })}
                        className="btn-ghost text-gray-500 hover:text-red-600"
                        title="Retire this vehicle"
                      >
                        <Power className="w-3.5 h-3.5" /> Retire
                      </button>
                    )}
                    {v.status === 'Retired' && (
                      <button
                        onClick={() => toggleRetire.mutate({ id: v.id, status: 'Available' })}
                        className="btn-ghost text-emerald-600 hover:text-emerald-800"
                        title="Restore to Available"
                      >
                        <Power className="w-3.5 h-3.5" /> Restore
                      </button>
                    )}
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
