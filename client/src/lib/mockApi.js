// ─────────────────────────────────────────────────────────
// mockApi.js — Mock backend adapter for offline development
// OWNER: Member C
// Provides in-memory data simulation when PostgreSQL is unavailable.
// Supports: vehicles, drivers, trips, fuel-logs, dashboard stats
// ─────────────────────────────────────────────────────────

let MOCK_DB = {
  vehicles: [
    { id: 1, name: 'Toyota Van-01', license_plate: 'VAN-101', type: 'Van', max_capacity_kg: 1000, odometer: 15000, status: 'Available', acquisition_cost: 25000 },
    { id: 2, name: 'Ford Truck-02', license_plate: 'TRK-202', type: 'Truck', max_capacity_kg: 5000, odometer: 42000, status: 'On Trip', acquisition_cost: 85000 },
    { id: 3, name: 'Honda Bike-03', license_plate: 'BIK-303', type: 'Bike', max_capacity_kg: 100, odometer: 5000, status: 'Available', acquisition_cost: 5000 },
    { id: 4, name: 'Mercedes Van-04', license_plate: 'VAN-404', type: 'Van', max_capacity_kg: 1200, odometer: 80000, status: 'In Shop', acquisition_cost: 30000 },
    { id: 5, name: 'Tata Truck-05', license_plate: 'TRK-505', type: 'Truck', max_capacity_kg: 8000, odometer: 120000, status: 'Retired', acquisition_cost: 65000 },
  ],
  drivers: [
    { id: 1, name: 'John Doe', license_number: 'DL-10001', duty_status: 'On Duty', license_expiry: '2027-01-01', safety_score: 90, trips_completed: 45, trips_total: 50 },
    { id: 2, name: 'Jane Smith', license_number: 'DL-10002', duty_status: 'On Duty', license_expiry: '2026-05-05', safety_score: 100, trips_completed: 30, trips_total: 30 },
    { id: 3, name: 'Mike Johnson', license_number: 'DL-10003', duty_status: 'Off Duty', license_expiry: '2023-01-01', safety_score: 80, trips_completed: 20, trips_total: 25 },
    { id: 4, name: 'Sarah Lee', license_number: 'DL-10004', duty_status: 'On Duty', license_expiry: '2026-03-15', safety_score: 95, trips_completed: 38, trips_total: 40 },
    { id: 5, name: 'Bob Wilson', license_number: 'DL-10005', duty_status: 'Suspended', license_expiry: '2025-12-01', safety_score: 55, trips_completed: 10, trips_total: 18 },
  ],
  trips: [
    { id: 1, vehicle_id: 2, driver_id: 1, cargo_weight_kg: 4500, origin: 'Port', destination: 'Distributor Hub', status: 'Dispatched', created_at: new Date().toISOString(), fuel_liters: null, fuel_cost: null, fuel_efficiency: null },
    { id: 2, vehicle_id: 1, driver_id: 2, cargo_weight_kg: 800, origin: 'Warehouse A', destination: 'Retail Store', status: 'Completed', created_at: new Date(Date.now() - 86400000).toISOString(), fuel_liters: 35, fuel_cost: 62.50, fuel_efficiency: '12.5' },
  ],
  fuelLogs: [
    { id: 1, trip_id: 2, liters: 35, cost: 62.50, odometer_reading: 15800, date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  ],
  maintenanceLogs: [
    { id: 1, vehicle_id: 4, service_type: 'Oil Change', cost: 150, date: new Date().toISOString().split('T')[0], notes: 'Routine oil change', status: 'Open' },
  ],
};

// Helper: generate a unique ID
const nextId = (collection) => Math.max(0, ...collection.map(i => i.id)) + 1;

export const applyMockAdapter = (api) => {
  api.defaults.adapter = async (config) => {
    const url = config.url || '';
    const method = config.method?.toLowerCase();
    
    console.log(`[MOCK API] ${method.toUpperCase()} ${url}`);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let responseData = null;
        let status = 200;

        try {
          // --- AUTH ---
          if (url.includes('/auth/login')) {
            responseData = { token: 'mock-jwt-token', user: { id: 2, name: 'Bob Dispatcher', role: 'dispatcher' } };
          }
          // --- FUEL LOGS ---
          else if (url.includes('/fuel-logs')) {
            if (method === 'post') {
              const body = JSON.parse(config.data);
              const log = { id: nextId(MOCK_DB.fuelLogs), ...body };
              MOCK_DB.fuelLogs.push(log);

              // Attach fuel data to the trip for display
              const trip = MOCK_DB.trips.find(t => t.id === body.trip_id);
              if (trip) {
                trip.fuel_liters = body.liters;
                trip.fuel_cost = body.cost;
                // Calculate fuel efficiency if odometer data available
                const vehicle = MOCK_DB.vehicles.find(v => v.id == trip.vehicle_id);
                if (vehicle && body.odometer_reading > vehicle.odometer) {
                  const distKm = body.odometer_reading - vehicle.odometer;
                  trip.fuel_efficiency = (distKm / body.liters).toFixed(1);
                  vehicle.odometer = body.odometer_reading; // update vehicle odometer
                }
              }
              responseData = log;
            } else if (method === 'get') {
              responseData = MOCK_DB.fuelLogs;
            }
          }
          // --- VEHICLES ---
          else if (url.includes('/vehicles')) {
            if (method === 'get') {
              const statusParam = new URLSearchParams(url.split('?')[1]).get('status');
              responseData = statusParam ? MOCK_DB.vehicles.filter(v => v.status === statusParam) : MOCK_DB.vehicles;
            } else if (method === 'post') {
              const body = JSON.parse(config.data);
              if (MOCK_DB.vehicles.some(v => v.license_plate === body.license_plate)) {
                return reject({ response: { status: 400, data: { error: 'License plate already exists' } } });
              }
              const newVeh = { id: nextId(MOCK_DB.vehicles), ...body, status: 'Available', odometer: 0 };
              MOCK_DB.vehicles.push(newVeh);
              responseData = newVeh;
            } else if (method === 'patch') {
              const id = parseInt(url.split('/').pop());
              const body = JSON.parse(config.data);
              const v = MOCK_DB.vehicles.find(v => v.id === id);
              if (v) Object.assign(v, body);
              responseData = v;
            }
          }
          // --- DRIVERS ---
          else if (url.includes('/drivers')) {
            if (url.includes('/expiring-soon')) {
              const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
              responseData = MOCK_DB.drivers.filter(d => d.license_expiry <= thirtyDaysFromNow);
            } else if (method === 'get') {
              responseData = MOCK_DB.drivers;
            }
          }
          // --- TRIPS ---
          else if (url.includes('/trips')) {
            if (method === 'get') {
              responseData = MOCK_DB.trips.map(t => ({
                ...t,
                vehicle_name: MOCK_DB.vehicles.find(v => v.id === parseInt(t.vehicle_id))?.name || 'Unknown',
                driver_name: MOCK_DB.drivers.find(d => d.id === parseInt(t.driver_id))?.name || 'Unknown'
              }));
            } else if (method === 'post') {
              const body = JSON.parse(config.data);
              const newTrip = { id: nextId(MOCK_DB.trips), ...body, status: 'Draft', created_at: new Date().toISOString(), fuel_liters: null, fuel_cost: null, fuel_efficiency: null };
              MOCK_DB.trips.push(newTrip);
              responseData = newTrip;
            } else if (method === 'patch') {
              const parts = url.split('/');
              const id = parseInt(parts[parts.length - 2]);
              const body = JSON.parse(config.data);
              const trip = MOCK_DB.trips.find(t => t.id === id);
              
              if (trip) {
                trip.status = body.status;
                const vehicle = MOCK_DB.vehicles.find(v => v.id == trip.vehicle_id);
                const driver = MOCK_DB.drivers.find(d => d.id == trip.driver_id);
                
                // Simulate atomic status flip
                if (body.status === 'Dispatched') {
                  if (vehicle) vehicle.status = 'On Trip';
                  if (driver) driver.duty_status = 'On Trip';
                } else if (body.status === 'Completed' || body.status === 'Cancelled') {
                  if (vehicle) vehicle.status = 'Available';
                  if (driver) driver.duty_status = 'On Duty';
                  // Increment driver stats on completion
                  if (body.status === 'Completed' && driver) {
                    driver.trips_completed = (driver.trips_completed || 0) + 1;
                    driver.trips_total = (driver.trips_total || 0) + 1;
                    driver.safety_score = Math.round((driver.trips_completed / driver.trips_total) * 100);
                  }
                }
              }
              responseData = trip;
            }
          }
          // --- MAINTENANCE ---
          else if (url.includes('/maintenance')) {
            if (method === 'get') {
              responseData = MOCK_DB.maintenanceLogs.map(l => ({
                ...l,
                vehicle_name: MOCK_DB.vehicles.find(v => v.id === l.vehicle_id)?.name || 'Unknown'
              }));
            } else if (method === 'post') {
              const body = JSON.parse(config.data);
              const log = { id: nextId(MOCK_DB.maintenanceLogs), ...body, status: 'Open' };
              MOCK_DB.maintenanceLogs.push(log);
              // Atomic: vehicle → In Shop
              const veh = MOCK_DB.vehicles.find(v => v.id === body.vehicle_id);
              if (veh) veh.status = 'In Shop';
              responseData = log;
            } else if (method === 'patch') {
              // Close maintenance
              const id = parseInt(url.split('/').filter(Boolean).slice(-2, -1)[0]);
              const log = MOCK_DB.maintenanceLogs.find(l => l.id === id);
              if (log) {
                log.status = 'Closed';
                const veh = MOCK_DB.vehicles.find(v => v.id === log.vehicle_id);
                if (veh) veh.status = 'Available';
              }
              responseData = log;
            }
          }
          // --- DASHBOARD ---
          else if (url.includes('/dashboard/stats')) {
             const activeVehicles = MOCK_DB.vehicles.filter(v => ['Available', 'On Trip'].includes(v.status));
             responseData = {
                activeFleet: activeVehicles.length,
                maintenanceAlerts: MOCK_DB.vehicles.filter(v => v.status === 'In Shop').length,
                utilizationRate: MOCK_DB.vehicles.length > 0
                  ? Math.round((MOCK_DB.vehicles.filter(v => v.status === 'On Trip').length / MOCK_DB.vehicles.filter(v => v.status !== 'Retired').length) * 100)
                  : 0,
                pendingCargo: MOCK_DB.trips.filter(t => t.status === 'Draft').reduce((sum, t) => sum + t.cargo_weight_kg, 0)
             }
          }
          // --- ANALYTICS ---
          else if (url.includes('/analytics/summary')) {
            const total = MOCK_DB.vehicles.filter(v => v.status !== 'Retired').length;
            const onTrip = MOCK_DB.vehicles.filter(v => v.status === 'On Trip').length;
            const totalFuelCost = MOCK_DB.fuelLogs.reduce((sum, l) => sum + l.cost, 0);
            const totalMaintCost = MOCK_DB.maintenanceLogs.reduce((sum, l) => sum + (l.cost || 0), 0);
            responseData = {
              utilizationRate: total > 0 ? Math.round((onTrip / total) * 100) : 0,
              totalFuelCost,
              totalMaintenanceCost: totalMaintCost,
              totalTripsCompleted: MOCK_DB.trips.filter(t => t.status === 'Completed').length,
              avgFuelEfficiency: MOCK_DB.trips.filter(t => t.fuel_efficiency).length > 0
                ? (MOCK_DB.trips.filter(t => t.fuel_efficiency).reduce((sum, t) => sum + parseFloat(t.fuel_efficiency), 0) / MOCK_DB.trips.filter(t => t.fuel_efficiency).length).toFixed(1)
                : null,
              net_profit: 125000 - totalFuelCost - totalMaintCost,
            }
          }
          // --- REPORTS MONTHLY ---
          else if (url.includes('/reports/monthly')) {
            responseData = [
              { month: '2026-01', revenue: 45000, fuel_cost: totalFuelCost || 2500, maintenance_cost: 1200 },
              { month: '2026-02', revenue: 52000, fuel_cost: totalFuelCost || 3100, maintenance_cost: 800 },
            ]
          }

          resolve({
            data: responseData,
            status,
            statusText: 'OK',
            headers: {},
            config,
            request: {}
          });
        } catch (err) {
          reject({ response: { status: 500, data: { error: err.message } } });
        }
      }, 300); // simulate 300ms network delay
    });
  };
};
