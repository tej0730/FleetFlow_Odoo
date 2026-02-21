import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { CheckCircle } from 'lucide-react'
import api from '../lib/api'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import { formatCurrency } from '../lib/utils'

export default function MaintenanceLogs() {
    const qc = useQueryClient()

    const { data: logs, isLoading } = useQuery({
        queryKey: ['maintenance'],
        queryFn: () => api.get('/maintenance').then(r => r.data),
        refetchInterval: 10000,
    })

    const closeMaintenance = useMutation({
        mutationFn: (id) => api.patch(`/maintenance/${id}/close`),
        onSuccess: () => {
            toast.success('Maintenance completed successfully!')
            qc.invalidateQueries({ queryKey: ['maintenance'] })
            qc.invalidateQueries({ queryKey: ['vehicles'] })
        },
        onError: (err) => {
            const msg = err.response?.data?.error || 'Failed to close maintenance'
            toast.error(msg)
        },
    })

    const handleClose = (id) => {
        if (confirm('Are you sure this maintenance is completed?')) {
            closeMaintenance.mutate(id)
        }
    }

    const columns = [
        { key: 'vehicle_name', header: 'Vehicle / Asset' },
        { key: 'service_type', header: 'Service Type' },
        {
            key: 'cost', header: 'Cost',
            render: (v) => <span className="font-mono text-slate-400">{formatCurrency(v)}</span>
        },
        {
            key: 'date', header: 'Date',
            render: (v) => <span className="text-slate-300">{new Date(v).toLocaleDateString()}</span>
        },
        {
            key: 'status', header: 'Status',
            render: (v) => <StatusPill status={v} />
        },
        {
            key: 'notes', header: 'Notes',
            render: (v) => <span className="text-sm text-slate-400">{v || '—'}</span>
        },
        {
            key: 'actions', header: '',
            render: (_, row) => {
                if (row.status === 'Open') {
                    return (
                        <button
                            onClick={() => handleClose(row.id)}
                            disabled={closeMaintenance.isPending}
                            className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                        </button>
                    )
                }
                return null
            }
        },
    ]

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Maintenance Logs</h1>
                    <p className="page-subtitle">Track repairs and service history · {logs?.length ?? 0} records</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={logs}
                isLoading={isLoading}
                emptyMessage="No maintenance logs found."
            />
        </div>
    )
}
