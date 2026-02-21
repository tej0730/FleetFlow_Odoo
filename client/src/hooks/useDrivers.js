import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useDrivers() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: () => api.get('/drivers').then(r => r.data),
    refetchInterval: 8000,
  });
}
