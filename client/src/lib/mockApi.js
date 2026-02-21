// Dummy data to simulate backend response
let MOCK_DB = {
  vehicles: [
    { id: 1, name: 'Toyota Van-01', license_plate: 'VAN-101', type: 'Van', max_capacity_kg: 1000, odometer: 15000, status: 'Available', acquisition_cost: 25000 },
    { id: 2, name: 'Ford Truck-02', license_plate: 'TRK-202', type: 'Truck', max_capacity_kg: 5000, odometer: 42000, status: 'On Trip', acquisition_cost: 85000 },
    { id: 3, name: 'Honda Bike-03', license_plate: 'BIK-303', type: 'Bike', max_capacity_kg: 100, odometer: 5000, status: 'Available', acquisition_cost: 5000 },
    { id: 4, name: 'Mercedes Van-04', license_plate: 'VAN-404', type: 'Van', max_capacity_kg: 1200, odometer: 80000, status: 'In Shop', acquisition_cost: 30000 },
  ],
  drivers: [
    { id: 1, name: 'John Doe', license_number: 'DL-10001', duty_status: 'On Duty', license_expiry: '2027-01-01', safety_score: 90 },
    { id: 2, name: 'Jane Smith', license_number: 'DL-10002', duty_status: 'On Duty', license_expiry: '2026-05-05', safety_score: 100 },
    { id: 3, name: 'Mike Johnson', license_number: 'DL-10003', duty_status: 'Off Duty', license_expiry: '2023-01-01', safety_score: 80 },
  ],
  trips: [
    { id: 1, vehicle_id: 2, driver_id: 1, cargo_weight_kg: 4500, origin: 'Port', destination: 'Distributor Hub', status: 'Dispatched', created_at: new Date().toISOString() }
  ],
  dashboardStats: {
    activeFleet: 3,
    maintenanceAlerts: 1,
    utilizationRate: 25,
    pendingCargo: 0
  }
};

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
          // --- VEHICLES ---
          else if (url.includes('/vehicles')) {
            if (method === 'get') {
              // Parse query param ?status=Available
              const statusParam = new URLSearchParams(url.split('?')[1]).get('status');
              responseData = statusParam ? MOCK_DB.vehicles.filter(v => v.status === statusParam) : MOCK_DB.vehicles;
            } else if (method === 'post') {
              const body = JSON.parse(config.data);
              // validation
              if (MOCK_DB.vehicles.some(v => v.license_plate === body.license_plate)) {
                return reject({ response: { status: 400, data: { error: 'License plate already exists' } } });
              }
              const newVeh = { id: Math.floor(Math.random() * 10000), ...body, status: 'Available', odometer: 0 };
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
            if (method === 'get') {
              responseData = MOCK_DB.drivers;
            }
          }
          // --- TRIPS ---
          else if (url.includes('/trips')) {
            if (method === 'get') {
              // Populate vehicle and driver names for the table
              responseData = MOCK_DB.trips.map(t => ({
                ...t,
                vehicle_name: MOCK_DB.vehicles.find(v => v.id === parseInt(t.vehicle_id))?.name || 'Unknown',
                driver_name: MOCK_DB.drivers.find(d => d.id === parseInt(t.driver_id))?.name || 'Unknown'
              }));
            } else if (method === 'post') {
              const body = JSON.parse(config.data);
              const newTrip = { id: Math.floor(Math.random() * 10000), ...body, status: 'Draft', created_at: new Date().toISOString() };
              MOCK_DB.trips.push(newTrip);
              responseData = newTrip;
            } else if (method === 'patch') {
              // e.g. /trips/1/status
              const parts = url.split('/');
              const id = parseInt(parts[parts.length - 2]); // handle /trips/:id/status
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
                }
              }
              responseData = trip;
            }
          }
          // --- DASHBOARD ---
          else if (url.includes('/dashboard/stats')) {
             // dynamically calculate for mock
             responseData = {
                activeFleet: MOCK_DB.vehicles.filter(v => ['Available', 'On Trip'].includes(v.status)).length,
                maintenanceAlerts: MOCK_DB.vehicles.filter(v => v.status === 'In Shop').length,
                utilizationRate: 50,
                pendingCargo: MOCK_DB.trips.filter(t => t.status === 'Draft').reduce((sum, t) => sum + t.cargo_weight_kg, 0)
             }
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
