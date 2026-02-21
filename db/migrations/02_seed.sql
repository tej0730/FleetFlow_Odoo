-- 02_seed.sql

-- 1. Insert Users (password: 'password123' hashed with bcrypt)
-- Note: Replace password_hash below with the actual hash for 'password123'
-- Hash for 'password123' (10 rounds): $2b$10$EP0M5L68kX3S2W.G37eKqO9v3K/98H5UInI3Jm2VREmQx.Q8A2Hwy
INSERT INTO users (name, email, password_hash, role) VALUES
('Alice Manager', 'manager@fleetflow.test', '$2b$10$EP0M5L68kX3S2W.G37eKqO9v3K/98H5UInI3Jm2VREmQx.Q8A2Hwy', 'manager'),
('Bob Dispatcher', 'dispatcher@fleetflow.test', '$2b$10$EP0M5L68kX3S2W.G37eKqO9v3K/98H5UInI3Jm2VREmQx.Q8A2Hwy', 'dispatcher'),
('Charlie Safety', 'safety@fleetflow.test', '$2b$10$EP0M5L68kX3S2W.G37eKqO9v3K/98H5UInI3Jm2VREmQx.Q8A2Hwy', 'safety'),
('Diana Analyst', 'analyst@fleetflow.test', '$2b$10$EP0M5L68kX3S2W.G37eKqO9v3K/98H5UInI3Jm2VREmQx.Q8A2Hwy', 'analyst');

-- 2. Insert 5 Vehicles
INSERT INTO vehicles (name, license_plate, type, max_capacity_kg, odometer, status, acquisition_cost, region) VALUES
('Toyota Van-01', 'VAN-101', 'Van', 1000, 15000, 'Available', 25000.00, 'North America'),
('Ford Truck-02', 'TRK-202', 'Truck', 5000, 42000, 'On Trip', 85000.00, 'Europe'),
('Honda Bike-03', 'BIK-303', 'Bike', 100, 5000, 'Available', 5000.00, 'Asia-Pacific'),
('Mercedes Van-04', 'VAN-404', 'Van', 1200, 80000, 'In Shop', 30000.00, 'North America'),
('Volvo Truck-05', 'TRK-505', 'Truck', 8000, 120000, 'Retired', 110000.00, 'Europe');

-- 3. Insert 5 Drivers (1 with expired license)
INSERT INTO drivers (name, license_number, license_expiry, duty_status, trips_completed, trips_total, safety_score) VALUES
('John Doe', 'DL-10001', CURRENT_DATE + INTERVAL '2 years', 'On Duty', 45, 50, 90.00),
('Jane Smith', 'DL-10002', CURRENT_DATE + INTERVAL '1 year', 'On Duty', 110, 110, 100.00),
('Mike Johnson', 'DL-10003', CURRENT_DATE - INTERVAL '5 days', 'Off Duty', 20, 25, 80.00), -- Expired license
('Emily Davis', 'DL-10004', CURRENT_DATE + INTERVAL '6 months', 'Suspended', 10, 15, 66.67),
('Chris Brown', 'DL-10005', CURRENT_DATE + INTERVAL '5 years', 'On Duty', 200, 205, 97.56);

-- 4. Insert 8 Trips
INSERT INTO trips (vehicle_id, driver_id, cargo_weight_kg, origin, destination, status, created_at) VALUES
(1, 1, 500, 'Warehouse A', 'Store 1', 'Completed', NOW() - INTERVAL '5 days'),
(1, 1, 800, 'Store 1', 'Warehouse B', 'Completed', NOW() - INTERVAL '4 days'),
(3, 2, 50, 'Restaurant 1', 'Customer House', 'Completed', NOW() - INTERVAL '2 days'),
(3, 2, 80, 'Restaurant 2', 'Office Building', 'Completed', NOW() - INTERVAL '1 day'),
(2, 5, 4500, 'Port', 'Distributor Hub', 'Dispatched', NOW() - INTERVAL '3 hours'),
(1, 1, 900, 'Warehouse A', 'Store 2', 'Draft', NOW()),
(4, 3, 1000, 'Factory', 'Workshop', 'Cancelled', NOW() - INTERVAL '10 days'),
(2, 5, 4000, 'Distributor Hub', 'Regional Hub', 'Draft', NOW());

-- 5. Insert 3 Maintenance Logs
INSERT INTO maintenance_logs (vehicle_id, service_type, cost, date, notes, status) VALUES
(1, 'Oil Change', 85.00, CURRENT_DATE - INTERVAL '15 days', 'Routine maintenance', 'Closed'),
(4, 'Brake Replacement', 450.00, CURRENT_DATE - INTERVAL '2 days', 'Pads and rotors replaced', 'Open'),
(5, 'Engine Overhaul', 5000.00, CURRENT_DATE - INTERVAL '1 month', 'Vehicle retired shortly after', 'Closed');

-- 6. Insert Fuel Logs
INSERT INTO fuel_logs (vehicle_id, liters, cost, date) VALUES
(1, 50.5, 75.00, CURRENT_DATE - INTERVAL '4 days'),
(2, 200.0, 310.00, CURRENT_DATE - INTERVAL '2 days'),
(3, 15.0, 22.50, CURRENT_DATE - INTERVAL '1 day');
