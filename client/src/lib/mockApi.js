// ─────────────────────────────────────────────────────────
// mockApi.js — Mock backend adapter for offline development
// OWNER: Member C
// Provides in-memory data simulation when PostgreSQL is unavailable.
// Supports: vehicles, drivers, trips, fuel-logs, dashboard stats
// ─────────────────────────────────────────────────────────

let MOCK_DB = {
  vehicles: [
    { id: 1, name: 'Freightliner Cascadia', license_plate: 'TRK-9001', type: 'Truck', max_capacity_kg: 15000, odometer: 245000, status: 'Available', acquisition_cost: 145000.00 },
    { id: 2, name: 'Volvo FH16', license_plate: 'TRK-9002', type: 'Truck', max_capacity_kg: 18000, odometer: 112000, status: 'On Trip', acquisition_cost: 165000.00 },
    { id: 3, name: 'Peterbilt 579', license_plate: 'TRK-9003', type: 'Truck', max_capacity_kg: 16000, odometer: 310000, status: 'In Shop', acquisition_cost: 130000.00 },
    { id: 4, name: 'DAF XF 480', license_plate: 'TRK-9004', type: 'Truck', max_capacity_kg: 14000, odometer: 45000, status: 'Available', acquisition_cost: 120000.00 },
    { id: 5, name: 'Scania R500', license_plate: 'TRK-9005', type: 'Truck', max_capacity_kg: 17000, odometer: 500000, status: 'Retired', acquisition_cost: 150000.00 },
    { id: 6, name: 'Mercedes Sprinter 2500', license_plate: 'VAN-4001', type: 'Van', max_capacity_kg: 1800, odometer: 45000, status: 'Available', acquisition_cost: 45000.00 },
    { id: 7, name: 'Ford Transit 350', license_plate: 'VAN-4002', type: 'Van', max_capacity_kg: 2100, odometer: 82000, status: 'On Trip', acquisition_cost: 42000.00 },
    { id: 8, name: 'Ram ProMaster', license_plate: 'VAN-4003', type: 'Van', max_capacity_kg: 1900, odometer: 15000, status: 'Available', acquisition_cost: 38000.00 },
    { id: 9, name: 'VW Crafter', license_plate: 'VAN-4004', type: 'Van', max_capacity_kg: 2000, odometer: 105000, status: 'Available', acquisition_cost: 48000.00 },
    { id: 10, name: 'Nissan NV3500', license_plate: 'VAN-4005', type: 'Van', max_capacity_kg: 1700, odometer: 190000, status: 'In Shop', acquisition_cost: 36000.00 },
    { id: 11, name: 'Honda CB500X', license_plate: 'BIK-1001', type: 'Bike', max_capacity_kg: 150, odometer: 12000, status: 'Available', acquisition_cost: 6500.00 },
    { id: 12, name: 'Yamaha Tracer 7', license_plate: 'BIK-1002', type: 'Bike', max_capacity_kg: 180, odometer: 8000, status: 'On Trip', acquisition_cost: 8200.00 },
    { id: 13, name: 'Kawasaki Versys', license_plate: 'BIK-1003', type: 'Bike', max_capacity_kg: 160, odometer: 25000, status: 'Available', acquisition_cost: 7000.00 },
    { id: 14, name: 'Suzuki V-Strom', license_plate: 'BIK-1004', type: 'Bike', max_capacity_kg: 170, odometer: 31000, status: 'Available', acquisition_cost: 7500.00 },
    { id: 15, name: 'BMW F750 GS', license_plate: 'BIK-1005', type: 'Bike', max_capacity_kg: 200, odometer: 5000, status: 'Available', acquisition_cost: 12000.00 },
  ],
  drivers: [
    { id: 1, name: 'Marcus Johnson', license_number: 'DL-NY-8472', duty_status: 'On Duty', license_expiry: new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0], safety_score: 96.67, trips_completed: 145, trips_total: 150 },
    { id: 2, name: 'Sarah Chen', license_number: 'DL-CA-9931', duty_status: 'On Duty', license_expiry: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0], safety_score: 100.00, trips_completed: 210, trips_total: 210 },
    { id: 3, name: 'David Miller', license_number: 'DL-TX-1104', duty_status: 'Off Duty', license_expiry: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], safety_score: 80.00, trips_completed: 20, trips_total: 25 },
    { id: 4, name: 'Elena Rodriguez', license_number: 'DL-FL-5592', duty_status: 'Suspended', license_expiry: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0], safety_score: 69.23, trips_completed: 45, trips_total: 65 },
    { id: 5, name: 'James Wilson', license_number: 'DL-WA-3321', duty_status: 'On Duty', license_expiry: new Date(Date.now() + 1825 * 86400000).toISOString().split('T')[0], safety_score: 98.76, trips_completed: 400, trips_total: 405 },
    { id: 6, name: 'Priya Patel', license_number: 'DL-IL-7744', duty_status: 'On Duty', license_expiry: new Date(Date.now() + 1095 * 86400000).toISOString().split('T')[0], safety_score: 94.44, trips_completed: 85, trips_total: 90 },
    { id: 7, name: 'Michael Chang', license_number: 'DL-NV-2281', duty_status: 'Suspended', license_expiry: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0], safety_score: 66.67, trips_completed: 10, trips_total: 15 },
    { id: 8, name: 'Emma Thompson', license_number: 'DL-OR-6619', duty_status: 'On Duty', license_expiry: new Date(Date.now() + 240 * 86400000).toISOString().split('T')[0], safety_score: 98.43, trips_completed: 315, trips_total: 320 },
    { id: 9, name: 'Robert Taylor', license_number: 'DL-AZ-4455', duty_status: 'Off Duty', license_expiry: new Date(Date.now() + 1460 * 86400000).toISOString().split('T')[0], safety_score: 93.75, trips_completed: 150, trips_total: 160 },
    { id: 10, name: 'Lisa Garcia', license_number: 'DL-NM-8822', duty_status: 'On Duty', license_expiry: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0], safety_score: 100.00, trips_completed: 50, trips_total: 50 },
    { id: 11, name: 'William Davis', license_number: 'DL-CO-1199', duty_status: 'On Duty', license_expiry: new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0], safety_score: 85.71, trips_completed: 12, trips_total: 14 },
    { id: 12, name: 'Sophie Martin', license_number: 'DL-UT-5533', duty_status: 'On Duty', license_expiry: new Date(Date.now() + 1095 * 86400000).toISOString().split('T')[0], safety_score: 98.21, trips_completed: 275, trips_total: 280 },
  ],
  trips: [
    { id: 1, vehicle_id: 1, driver_id: 1, cargo_weight_kg: 14000, origin: 'Newark Port, NJ', destination: 'Chicago Distribution Center', status: 'Completed', created_at: new Date(Date.now() - 432000000).toISOString() },
    { id: 2, vehicle_id: 4, driver_id: 5, cargo_weight_kg: 12500, origin: 'Rotterdam Port', destination: 'Berlin Logistics Hub', status: 'Completed', created_at: new Date(Date.now() - 345600000).toISOString() },
    { id: 3, vehicle_id: 2, driver_id: 2, cargo_weight_kg: 17500, origin: 'Hamburg Terminal', destination: 'Munich Fulfillment', status: 'Dispatched', created_at: new Date(Date.now() - 43200000).toISOString() },
    { id: 4, vehicle_id: 1, driver_id: 8, cargo_weight_kg: 13800, origin: 'Chicago Distribution Center', destination: 'Dallas Regional Depot', status: 'Draft', created_at: new Date().toISOString() },
    { id: 5, vehicle_id: 6, driver_id: 6, cargo_weight_kg: 1500, origin: 'Brooklyn Sorting Facility', destination: 'Manhattan Retail 01', status: 'Completed', created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 6, vehicle_id: 8, driver_id: 9, cargo_weight_kg: 1700, origin: 'Seattle Hub', destination: 'Portland City Store', status: 'Completed', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 7, vehicle_id: 9, driver_id: 12, cargo_weight_kg: 1900, origin: 'London Gateway', destination: 'Birmingham Central', status: 'Completed', created_at: new Date(Date.now() - 259200000).toISOString() },
    { id: 8, vehicle_id: 7, driver_id: 10, cargo_weight_kg: 2050, origin: 'Los Angeles Port', destination: 'San Diego Storefront', status: 'Dispatched', created_at: new Date(Date.now() - 10800000).toISOString() },
    { id: 9, vehicle_id: 6, driver_id: 6, cargo_weight_kg: 1200, origin: 'Manhattan Retail 01', destination: 'Queens Local Depot', status: 'Draft', created_at: new Date().toISOString() },
    { id: 10, vehicle_id: 8, driver_id: 1, cargo_weight_kg: 1850, origin: 'Portland City Store', destination: 'Seattle Hub Return', status: 'Draft', created_at: new Date().toISOString() },
    { id: 11, vehicle_id: 11, driver_id: 11, cargo_weight_kg: 45, origin: 'Tokyo Central Post', destination: 'Shibuya Office Complex', status: 'Completed', created_at: new Date(Date.now() - 43200000).toISOString() },
    { id: 12, vehicle_id: 13, driver_id: 11, cargo_weight_kg: 80, origin: 'Singapore Hub', destination: 'Marina Bay Residence', status: 'Completed', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 13, vehicle_id: 14, driver_id: 12, cargo_weight_kg: 120, origin: 'Toronto Sort Center', destination: 'Downtown Condo Tower', status: 'Completed', created_at: new Date(Date.now() - 18000000).toISOString() },
    { id: 14, vehicle_id: 12, driver_id: 8, cargo_weight_kg: 65, origin: 'Paris Nord Sorting', destination: 'Louvre Area Deliveries', status: 'Dispatched', created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 15, vehicle_id: 15, driver_id: 2, cargo_weight_kg: 85, origin: 'Berlin Central', destination: 'Kreuzberg Dropoff', status: 'Cancelled', created_at: new Date(Date.now() - 864000000).toISOString() }
  ],
  fuelLogs: [
    { id: 1, trip_id: 1, liters: 350.0, cost: 525.00, odometer_reading: 245000, date: new Date(Date.now() - 345600000).toISOString().split('T')[0] },
    { id: 2, trip_id: 2, liters: 280.0, cost: 420.00, odometer_reading: 45000, date: new Date(Date.now() - 259200000).toISOString().split('T')[0] },
    { id: 3, trip_id: 5, liters: 85.0, cost: 127.50, odometer_reading: 45000, date: new Date(Date.now() - 172800000).toISOString().split('T')[0] },
    { id: 4, trip_id: 11, liters: 12.0, cost: 18.00, odometer_reading: 12000, date: new Date(Date.now() - 43200000).toISOString().split('T')[0] }
  ],
  maintenanceLogs: [
    { id: 1, vehicle_id: 1, service_type: 'Full Synthetic Diesel Oil Change', cost: 450.00, date: new Date(Date.now() - 1296000000).toISOString().split('T')[0], notes: 'Routine 25k mile maintenance', status: 'Closed' },
    { id: 2, vehicle_id: 3, service_type: 'Transmission Rebuild', cost: 5200.00, date: new Date(Date.now() - 172800000).toISOString().split('T')[0], notes: 'Gears slipping on incline, completely rebuilt in-house', status: 'Open' },
    { id: 3, vehicle_id: 5, service_type: 'Engine End-of-Life Assessment', cost: 200.00, date: new Date(Date.now() - 2592000000).toISOString().split('T')[0], notes: 'Vehicle retired due to cracked block', status: 'Closed' },
    { id: 4, vehicle_id: 10, service_type: 'Brake Pads & Rotors', cost: 850.00, date: new Date(Date.now() - 432000000).toISOString().split('T')[0], notes: 'Front and rear pads totally worn down', status: 'Open' },
    { id: 5, vehicle_id: 6, service_type: 'Tire Rotation & Alignment', cost: 120.00, date: new Date(Date.now() - 1728000000).toISOString().split('T')[0], notes: 'Standard quarterly alignment', status: 'Closed' }
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
          else if (url.includes('/auth/forgot-password')) {
            // Mock forgot password: just return success to trick the frontend
            responseData = { message: 'If the email exists, a reset pin was sent.' };
          }
          else if (url.includes('/auth/reset-password')) {
            // Mock reset password: just return success
            responseData = { message: 'Password has been reset successfully' };
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
