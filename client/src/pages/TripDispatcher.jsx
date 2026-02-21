import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import StatusPill from '../components/StatusPill';

export default function TripDispatcher() {
  const queryClient = useQueryClient();

  // ─── Form State ───
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // ─── Data Queries ───
  const { data: vehicles = [], isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles-available'],
    queryFn: () => api.get('/vehicles?status=Available').then(r => r.data),
    refetchInterval: 8000,
  });

  const { data: allDrivers = [], isLoading: loadingDrivers } = useQuery({
    queryKey: ['drivers-all'],
    queryFn: () => api.get('/drivers').then(r => r.data),
    refetchInterval: 8000,
  });

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get('/trips').then(r => r.data),
    refetchInterval: 8000,
  });

  // Also fetch all vehicles & drivers for table display (to show names)
  const { data: allVehicles = [] } = useQuery({
    queryKey: ['vehicles-all'],
    queryFn: () => api.get('/vehicles').then(r => r.data),
  });

  // ─── Filter drivers: On Duty + valid (non-expired) license only ───
  const eligibleDrivers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allDrivers.filter(d => {
      const expiry = new Date(d.license_expiry);
      return d.duty_status === 'On Duty' && expiry >= today;
    });
  }, [allDrivers]);

  // ─── Selected vehicle's capacity ───
  const selectedVehicle = vehicles.find(v => v.id === Number(vehicleId));
  const maxCapacity = selectedVehicle?.max_capacity_kg || 0;
  const cargoNum = Number(cargoWeight) || 0;
  const capacityPercent = maxCapacity > 0 ? Math.min((cargoNum / maxCapacity) * 100, 100) : 0;
  const isOverweight = cargoNum > maxCapacity && maxCapacity > 0;
  const isNearCapacity = capacityPercent >= 90 && !isOverweight;

  // ─── Mutations ───
  const createTrip = useMutation({
    mutationFn: (data) => api.post('/trips', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-available'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-all'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setFormSuccess('Trip created successfully!');
      setTimeout(() => setFormSuccess(''), 3000);
      resetForm();
    },
    onError: (err) => {
      setFormError(err.response?.data?.error || 'Failed to create trip');
    },
  });

  const updateTripStatus = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/trips/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-available'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles-all'] });
      queryClient.invalidateQueries({ queryKey: ['drivers-all'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const resetForm = () => {
    setVehicleId('');
    setDriverId('');
    setCargoWeight('');
    setOrigin('');
    setDestination('');
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!vehicleId || !driverId || !cargoWeight || !origin || !destination) {
      setFormError('All fields are required');
      return;
    }
    if (isOverweight) {
      setFormError(`Cargo weight (${cargoNum}kg) exceeds vehicle max capacity (${maxCapacity}kg)`);
      return;
    }

    createTrip.mutate({
      vehicle_id: Number(vehicleId),
      driver_id: Number(driverId),
      cargo_weight_kg: cargoNum,
      origin,
      destination,
    });
  };

  // ─── Helpers for table display ───
  const getVehicleName = (id) => {
    const v = allVehicles.find(v => v.id === id);
    return v ? `${v.name} (${v.license_plate})` : `Vehicle #${id}`;
  };

  const getDriverName = (id) => {
    const d = allDrivers.find(d => d.id === id);
    return d ? d.name : `Driver #${id}`;
  };

  const getActions = (trip) => {
    const btns = [];
    if (trip.status === 'Draft') {
      btns.push(
        <button
          key="dispatch"
          className="btn btn-sm btn-dispatch"
          onClick={() => updateTripStatus.mutate({ id: trip.id, status: 'Dispatched' })}
          disabled={updateTripStatus.isPending}
        >
          🚀 Dispatch
        </button>
      );
      btns.push(
        <button
          key="cancel"
          className="btn btn-sm btn-cancel"
          onClick={() => updateTripStatus.mutate({ id: trip.id, status: 'Cancelled' })}
          disabled={updateTripStatus.isPending}
        >
          ✕ Cancel
        </button>
      );
    } else if (trip.status === 'Dispatched') {
      btns.push(
        <button
          key="complete"
          className="btn btn-sm btn-complete"
          onClick={() => updateTripStatus.mutate({ id: trip.id, status: 'Completed' })}
          disabled={updateTripStatus.isPending}
        >
          ✓ Complete
        </button>
      );
      btns.push(
        <button
          key="cancel"
          className="btn btn-sm btn-cancel"
          onClick={() => updateTripStatus.mutate({ id: trip.id, status: 'Cancelled' })}
          disabled={updateTripStatus.isPending}
        >
          ✕ Cancel
        </button>
      );
    }
    return btns;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Trip Dispatcher</h2>
        <p>Create trips, assign vehicles & drivers, and manage dispatch lifecycle</p>
      </div>

      {/* ═══ NEW TRIP FORM ═══ */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          📋 Create New Trip
        </h3>

        {formError && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#f87171',
            fontSize: '0.8125rem',
          }}>
            ⚠️ {formError}
          </div>
        )}

        {formSuccess && (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#4ade80',
            fontSize: '0.8125rem',
          }}>
            ✅ {formSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Vehicle Dropdown */}
            <div className="form-group">
              <label className="form-label">Vehicle (Available Only)</label>
              <select
                className="form-select"
                value={vehicleId}
                onChange={(e) => { setVehicleId(e.target.value); setFormError(''); }}
              >
                <option value="">Select a vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} — {v.license_plate} (Max: {v.max_capacity_kg}kg)
                  </option>
                ))}
              </select>
              {vehicles.length === 0 && !loadingVehicles && (
                <span className="form-warning">⚠️ No available vehicles</span>
              )}
            </div>

            {/* Driver Dropdown */}
            <div className="form-group">
              <label className="form-label">Driver (On Duty + Valid License)</label>
              <select
                className="form-select"
                value={driverId}
                onChange={(e) => { setDriverId(e.target.value); setFormError(''); }}
              >
                <option value="">Select a driver...</option>
                {eligibleDrivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} — License: {d.license_number}
                  </option>
                ))}
              </select>
              {eligibleDrivers.length === 0 && !loadingDrivers && (
                <span className="form-warning">⚠️ No eligible drivers (On Duty + valid license)</span>
              )}
            </div>

            {/* Cargo Weight */}
            <div className="form-group">
              <label className="form-label">Cargo Weight (kg)</label>
              <input
                type="number"
                className={`form-input ${isOverweight ? 'error' : ''}`}
                placeholder="Enter cargo weight in kg"
                value={cargoWeight}
                onChange={(e) => { setCargoWeight(e.target.value); setFormError(''); }}
                min="1"
              />
              {selectedVehicle && cargoNum > 0 && (
                <div className="capacity-bar-wrapper">
                  <div className="capacity-bar">
                    <div
                      className={`capacity-bar-fill ${isOverweight ? 'danger' : isNearCapacity ? 'warning' : 'safe'}`}
                      style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                    />
                  </div>
                  <span className="capacity-text">
                    {cargoNum} / {maxCapacity} kg ({Math.round(capacityPercent)}%)
                  </span>
                </div>
              )}
              {isOverweight && (
                <span className="form-error">
                  ❌ Exceeds vehicle capacity by {cargoNum - maxCapacity}kg — submission blocked
                </span>
              )}
              {isNearCapacity && (
                <span className="form-warning">
                  ⚡ Approaching max capacity ({Math.round(capacityPercent)}%)
                </span>
              )}
            </div>

            {/* Origin */}
            <div className="form-group">
              <label className="form-label">Origin</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mumbai Warehouse"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>

            {/* Destination */}
            <div className="form-group">
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Delhi Distribution Center"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createTrip.isPending || isOverweight || !vehicleId || !driverId}
            >
              {createTrip.isPending ? '⏳ Creating...' : '🚀 Create Trip'}
            </button>
          </div>
        </form>
      </div>

      {/* ═══ TRIPS TABLE ═══ */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          📦 All Trips
        </h3>

        {loadingTrips ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            Loading trips...
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <p>No trips yet. Create your first trip above!</p>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Cargo (kg)</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>#{trip.id}</td>
                    <td>{getVehicleName(trip.vehicle_id)}</td>
                    <td>{getDriverName(trip.driver_id)}</td>
                    <td>{trip.origin}</td>
                    <td>{trip.destination}</td>
                    <td style={{ fontWeight: 600 }}>{trip.cargo_weight_kg} kg</td>
                    <td><StatusPill status={trip.status} /></td>
                    <td>{new Date(trip.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-btns">
                        {getActions(trip)}
                        {(trip.status === 'Completed' || trip.status === 'Cancelled') && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                            {trip.status === 'Completed' ? '✓ Done' : '— Cancelled'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
