import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus } from 'lucide-react'
import api from '../lib/api'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DriverProfiles() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const qc = useQueryClient()

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get('/drivers').then(r => r.data),
    refetchInterval: 10000,
  })

  // Check if expiring soon
  const isExpiringSoon = (dateStr) => {
    const expiry = new Date(dateStr)
    const now = new Date()
    const diffTime = expiry - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 30
  }

  const isExpired = (dateStr) => {
    const expiry = new Date(dateStr)
    const now = new Date()
    return expiry < now
  }

  const getSafetyBadgeStyle = (score) => {
    if (score > 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    if (score > 60) return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    return 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      duty_status: 'Off Duty'
    }
  })

  const addDriver = useMutation({
    mutationFn: (data) => api.post('/drivers', data),
    onSuccess: () => {
      toast.success('Driver added successfully!')
      qc.invalidateQueries({ queryKey: ['drivers'] })
      setIsModalOpen(false)
      reset()
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to add driver'
      toast.error(msg)
    },
  })

  const onSubmit = (data) => {
    addDriver.mutate(data)
  }

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'license_number', header: 'License',
      render: (v) => <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded">{v}</span>
    },
    {
      key: 'license_expiry', header: 'Expiry',
      render: (v) => {
        const expired = isExpired(v)
        const soon = isExpiringSoon(v)
        return (
          <div className="flex items-center space-x-2">
            <span>{new Date(v).toLocaleDateString()}</span>
            {expired && <StatusPill status="EXPIRED" />}
            {soon && <StatusPill status="EXPIRING SOON" />}
          </div>
        )
      }
    },
    {
      key: 'duty_status', header: 'Duty Status',
      render: (v) => <StatusPill status={v} />
    },
    {
      key: 'safety_score', header: 'Safety Score',
      render: (v) => {
        const score = v || 100
        return (
          <span className={`badge border ${getSafetyBadgeStyle(score)}`}>
            {parseFloat(score).toFixed(0)}%
          </span>
        )
      }
    },
    {
      key: 'trip_completion_rate', header: 'Trip Success',
      render: (v) => <span className="text-slate-400">{v || 100}%</span>
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Profiles</h1>
          <p className="page-subtitle">Track compliance and safety · {drivers?.length ?? 0} drivers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        isLoading={isLoading}
        emptyMessage="No drivers registered yet. Click '+ Add Driver' to add one."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); reset() }}
        title="Add New Driver"
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Full Name</label>
              <input
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g. Jane Doe"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">License Number</label>
              <input
                className={`input ${errors.license_number ? 'border-red-500' : ''}`}
                placeholder="DL-XXXX"
                {...register('license_number', { required: 'License is required' })}
              />
              {errors.license_number && <p className="field-error">{errors.license_number.message}</p>}
            </div>

            <div>
              <label className="label">Expiry Date</label>
              <input
                type="date"
                className={`input ${errors.license_expiry ? 'border-red-500' : ''}`}
                {...register('license_expiry', { required: 'Expiry date is required' })}
              />
              {errors.license_expiry && <p className="field-error">{errors.license_expiry.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="label">Duty Status</label>
              <select
                className={`input ${errors.duty_status ? 'border-red-500' : ''}`}
                {...register('duty_status')}
              >
                <option value="On Duty">On Duty</option>
                <option value="Off Duty">Off Duty</option>
              </select>
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
              disabled={addDriver.isPending}
              className="btn-primary flex-1 justify-center"
            >
              {addDriver.isPending ? <><LoadingSpinner size="sm" /> Saving...</> : 'Add Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
