-- 01_schema.sql

DROP TABLE IF EXISTS fuel_logs CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(30) NOT NULL
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL,
    max_capacity_kg INTEGER NOT NULL,
    odometer INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Available',
    acquisition_cost NUMERIC(12,2),
    region VARCHAR(100) DEFAULT 'North America'
);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    duty_status VARCHAR(20) DEFAULT 'Off Duty',
    trips_completed INTEGER DEFAULT 0,
    trips_total INTEGER DEFAULT 0,
    safety_score NUMERIC(5,2) DEFAULT 100.00
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES drivers(id),
    cargo_weight_kg INTEGER NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT NOW(),
    final_odometer INTEGER
);

CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    service_type VARCHAR(100) NOT NULL,
    cost NUMERIC(10,2),
    date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'Open'
);

CREATE TABLE fuel_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    liters NUMERIC(8,2) NOT NULL,
    cost NUMERIC(10,2) NOT NULL,
    date DATE NOT NULL
);
