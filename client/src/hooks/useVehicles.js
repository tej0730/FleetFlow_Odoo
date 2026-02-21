import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export function useVehicles(status) {
  return useQuery({
    queryKey: ['vehicles', status || 'all'],
    queryFn: () => {
      const url = status ? `/vehicles?status=${status}` : '/vehicles';
      return api.get(url).then(r => r.data);
    },
    refetchInterval: 8000,
  });
}
