import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    },
    // Adding a short refetch interval for live KPI updates
    refetchInterval: 8000, 
  });
};
