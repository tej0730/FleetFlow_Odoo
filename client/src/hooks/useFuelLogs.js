// useFuelLogs.js — Custom hook for fuel log operations
// OWNER: Member C
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export function useFuelLogs(tripId) {
  return useQuery({
    queryKey: ['fuel-logs', tripId],
    queryFn: () => api.get('/fuel-logs', { params: tripId ? { trip_id: tripId } : {} }).then(r => r.data),
    enabled: !!tripId || tripId === undefined, // fetch all if no tripId
  })
}

export function useCreateFuelLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => api.post('/fuel-logs', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel-logs'] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] })
    },
  })
}
