import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Truck } from 'lucide-react'
import api from '../lib/api'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency } from '../lib/utils'

const VEHICLE_TYPES = ['Truck', 'Van', 'Bike']

export default function VehicleRegistry() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles').then(r => r.data),
    refetchInterval: 10000,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const addVehicle = useMutation({
    mutationFn: (data) => api.post('/vehicles', data),
    onSuccess: () => {
      toast.success('Vehicle added successfully!')
      qc.invalidateQueries({ queryKey: ['vehicles'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
      setIsModalOpen(false)
      reset()
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to add vehicle'
      toast.error(msg)
    },
  })

  const onSubmit = (data) => {
    addVehicle.mutate({
      ...data,
      max_capacity_kg: parseInt(data.max_capacity_kg),
      acquisition_cost: parseFloat(data.acquisition_cost),
    })
  }

  const columns = [
    { key: 'name',             header: 'Name / Model' },
    { key: 'license_plate',    header: 'License Plate',
      render: (v) => <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded">{v}</span> },
    { key: 'type',             header: 'Type' },
    { key: 'max_capacity_kg',  header: 'Capacity (kg)',
      render: (v) => <span className="font-mono">{v?.toLocaleString()}</span> },
    { key: 'odometer',         header: 'Odometer',
      render: (v) => <span className="font-mono">{v?.toLocaleString()} km</span> },
    { key: 'acquisition_cost', header: 'Acq. Cost',
      render: (v) => <span className="font-mono text-slate-400">{formatCurrency(v)}</span> },
    { key: 'status',           header: 'Status',
      render: (v) => <StatusPill status={v} /> },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicle Registry</h1>
          <p className="page-subtitle">Manage fleet assets · {vehicles?.length ?? 0} vehicles</p>
        </div>
        <button
          id="add-vehicle-btn"
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        emptyMessage="No vehicles registered yet. Click '+ Add Vehicle' to add one."
      />

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset() }}
        title="Register New Vehicle"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <label className="label">Vehicle Name / Model</label>
              <input
                id="vehicle-name"
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Toyota Van-05"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            {/* License Plate */}
            <div>
              <label className="label">License Plate</label>
              <input
                id="license-plate"
                className={`input ${errors.license_plate ? 'border-red-500' : ''}`}
                placeholder="MH-01-AB-1234"
                {...register('license_plate', { required: 'License plate is required' })}
              />
              {errors.license_plate && <p className="field-error">{errors.license_plate.message}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="label">Vehicle Type</label>
              <select
                id="vehicle-type"
                className={`input ${errors.type ? 'border-red-500' : ''}`}
                {...register('type', { required: 'Type is required' })}
              >
                <option value="">Select type...</option>
                {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <p className="field-error">{errors.type.message}</p>}
            </div>

            {/* Max Capacity */}
            <div>
              <label className="label">Max Capacity (kg)</label>
              <input
                id="max-capacity"
                type="number"
                className={`input ${errors.max_capacity_kg ? 'border-red-500' : ''}`}
                placeholder="1000"
                {...register('max_capacity_kg', {
                  required: 'Capacity is required',
                  min: { value: 1, message: 'Must be > 0' }
                })}
              />
              {errors.max_capacity_kg && <p className="field-error">{errors.max_capacity_kg.message}</p>}
            </div>

            {/* Acquisition Cost */}
            <div>
              <label className="label">Acquisition Cost (₹)</label>
              <input
                id="acquisition-cost"
                type="number"
                className={`input ${errors.acquisition_cost ? 'border-red-500' : ''}`}
                placeholder="800000"
                {...register('acquisition_cost', {
                  required: 'Acquisition cost is required',
                  min: { value: 0, message: 'Must be ≥ 0' }
                })}
              />
              {errors.acquisition_cost && <p className="field-error">{errors.acquisition_cost.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); reset() }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addVehicle.isPending}
              className="btn-primary flex-1 justify-center"
            >
              {addVehicle.isPending ? <><LoadingSpinner size="sm" /> Saving...</> : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
