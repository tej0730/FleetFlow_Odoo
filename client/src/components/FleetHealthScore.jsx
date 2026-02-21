import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const FleetHealthScore = () => {
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles', 'all'],
    queryFn: () => api.get('/vehicles').then(r => r.data),
    refetchInterval: 8000,
  });

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const healthScore = totalVehicles > 0 ? Math.round((availableVehicles / totalVehicles) * 100) : 0;

  // Color coding: green >= 75%, amber >= 50%, red < 50%
  let scoreColor = 'text-green-600';
  let bgColor = 'bg-green-50 border-green-200';
  if (healthScore < 50) {
    scoreColor = 'text-red-600';
    bgColor = 'bg-red-50 border-red-200';
  } else if (healthScore < 75) {
    scoreColor = 'text-yellow-600';
    bgColor = 'bg-yellow-50 border-yellow-200';
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow p-6 border ${bgColor}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          🛡️ Fleet Health Score
        </h3>
      </div>
      <div className={`text-4xl font-extrabold ${scoreColor}`}>
        {healthScore}%
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {availableVehicles} of {totalVehicles} vehicles available
      </p>

      {/* Health bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            healthScore >= 75 ? 'bg-green-500' : healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${healthScore}%` }}
        />
      </div>
    </div>
  );
};

export default FleetHealthScore;
