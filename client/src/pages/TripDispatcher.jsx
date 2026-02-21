<<<<<<< HEAD
import React, { useState, useMemo } from 'react';
import { useVehicles } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import { useTrips, useCreateTrip, useUpdateTripStatus } from '../hooks/useTrips';
import StatusPill from '../components/StatusPill';

const TripDispatcher = () => {
  // Data Fetching
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useVehicles('Available');
  const { data: drivers = [], isLoading: isLoadingDrivers } = useDrivers();
  const { data: trips = [], isLoading: isLoadingTrips } = useTrips();
  
  const createTrip = useCreateTrip();
  const updateStatus = useUpdateTripStatus();

  // Filter available drivers locally (assuming API returns all)
  const availableDrivers = useMemo(() => 
    drivers.filter(d => d.duty_status === 'Available' || d.duty_status === 'On Duty' || !d.duty_status), 
  [drivers]);

  // Form State
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Validation
  const vehicle = vehicles.find(v => v.id.toString() === selectedVehicle);
  const maxCapacity = vehicle ? vehicle.max_capacity_kg : 0;
  const isOverweight = cargoWeight && vehicle && Number(cargoWeight) > maxCapacity;
  
  const isFormValid = selectedVehicle && selectedDriver && cargoWeight && origin && destination && !isOverweight;

  // Handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    createTrip.mutate({
      vehicle_id: selectedVehicle,
      driver_id: selectedDriver,
      cargo_weight_kg: Number(cargoWeight),
      origin,
      destination
    }, {
      onSuccess: () => {
        // Reset form
        setSelectedVehicle('');
        setSelectedDriver('');
        setCargoWeight('');
        setOrigin('');
        setDestination('');
      }
    });
  };

  const handleStatusChange = (id, newStatus) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Trip Dispatcher</h1>
      </div>

      {/* Dispatch Form Card */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Create New Trip</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          
          <div className="space-y-1 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} (Max: {v.max_capacity_kg}kg)
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Driver</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              required
            >
              <option value="">Select Driver</option>
              {availableDrivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Cargo Weight (kg)</label>
            <input
              type="number"
              value={cargoWeight}
              onChange={(e) => setCargoWeight(e.target.value)}
              className={`mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border ${isOverweight ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
              placeholder="e.g. 1500"
              required
            />
            {isOverweight && (
              <p className="text-xs text-red-600 mt-1">Exceeds vehicle capacity ({maxCapacity}kg)!</p>
            )}
          </div>

          <div className="space-y-1 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Origin</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              placeholder="City A"
              required
            />
          </div>

          <div className="space-y-1 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Destination</label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              placeholder="City B"
              required
            />
          </div>

          <div className="lg:col-span-5 flex justify-end mt-2">
            <button
              type="submit"
              disabled={!isFormValid || createTrip.isPending}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {createTrip.isPending ? 'Dispatching...' : 'Dispatch Trip'}
            </button>
          </div>
        </form>
      </div>

      {/* Trips Table Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Active & Recent Trips</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle/Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingTrips ? (
                <tr><td colSpan="6" className="text-center py-4 text-gray-500">Loading trips...</td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-gray-500">No trips found.</td></tr>
              ) : (
                trips.map(trip => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">#{trip.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">V: {trip.vehicle_name || trip.vehicle_id}</div>
                      <div className="text-sm text-gray-500">D: {trip.driver_name || trip.driver_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{trip.origin}</div>
                      <div className="text-xs text-gray-500">to {trip.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.cargo_weight_kg} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusPill status={trip.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {trip.status === 'Draft' && (
                        <button onClick={() => handleStatusChange(trip.id, 'Dispatched')} className="text-blue-600 hover:text-blue-900">Dispatch</button>
                      )}
                      {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                        <button onClick={() => handleStatusChange(trip.id, 'Cancelled')} className="text-red-600 hover:text-red-900">Cancel</button>
                      )}
                      {trip.status === 'Dispatched' && (
                        <button onClick={() => handleStatusChange(trip.id, 'Completed')} className="text-green-600 hover:text-green-900">Complete</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TripDispatcher;
=======
/* ─────────────────────────────────────────────────────────
   TripDispatcher.jsx
   OWNER: Member C — Trip Dispatcher & Core Logic

   This file is a skeleton placeholder for Member C.
   Member C should implement:
     - Vehicle dropdown (Available only)
     - Driver dropdown (On Duty + valid license only)
     - Cargo weight input with live validation against max_capacity_kg
     - Trips table with status pills and action buttons (Dispatch / Complete / Cancel)
     - Wire status buttons to PATCH /api/trips/:id/status
     - Fleet Health Score card: (available/totalVehicles * 100)

   API endpoints to use:
     GET  /api/trips            → list all trips
     POST /api/trips            → create new trip
     PATCH /api/trips/:id/status → update status + atomic vehicle/driver flip
     GET  /api/vehicles?status=Available
     GET  /api/drivers          → filter On Duty + non-expired license client-side
──────────────────────────────────────────────────────────── */
import { MapPin } from 'lucide-react'

export default function TripDispatcher() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trip Dispatcher</h1>
          <p className="page-subtitle">Assign vehicles & drivers to deliveries</p>
        </div>
      </div>

      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <MapPin className="w-12 h-12 text-slate-600 mb-4" />
        <p className="text-slate-400 font-medium mb-1">Trip Dispatcher — Under Construction</p>
        <p className="text-slate-600 text-sm">This page is being built by Member C.</p>
      </div>
    </div>
  )
}
>>>>>>> 9a40a4a1074228d482b033af20aba18bcce06150
