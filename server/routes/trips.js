const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');
const Joi = require('joi');
const validateRequest = require('../middleware/validate');

const tripSchema = Joi.object({
    vehicle_id: Joi.number().integer().required(),
    driver_id: Joi.number().integer().required(),
    cargo_weight_kg: Joi.number().integer().min(1).required(),
    origin: Joi.string().required(),
    destination: Joi.string().required()
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM trips';
        const params = [];

        if (status) {
            query += ' WHERE status = $1';
            params.push(status);
        }
        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticateToken, validateRequest(tripSchema), async (req, res) => {
    try {
        const { vehicle_id, driver_id, cargo_weight_kg, origin, destination } = req.body;

        // Validation: Check vehicle max capacity
        const vehicleResult = await pool.query('SELECT max_capacity_kg FROM vehicles WHERE id = $1', [vehicle_id]);
        if (vehicleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }

        const vehicle = vehicleResult.rows[0];
        if (cargo_weight_kg > vehicle.max_capacity_kg) {
            return res.status(400).json({
                error: `Cargo weight (${cargo_weight_kg}kg) exceeds vehicle maximum capacity (${vehicle.max_capacity_kg}kg)`
            });
        }

        // Also validate driver license hasn't expired
        const driverResult = await pool.query('SELECT license_expiry FROM drivers WHERE id = $1', [driver_id]);
        if (driverResult.rows.length === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        const driver = driverResult.rows[0];
        if (new Date(driver.license_expiry) < new Date()) {
            return res.status(400).json({ error: 'Driver license is expired' });
        }

        const result = await pool.query(
            `INSERT INTO trips (vehicle_id, driver_id, cargo_weight_kg, origin, destination, status) 
             VALUES ($1, $2, $3, $4, $5, 'Draft') RETURNING *`,
            [vehicle_id, driver_id, cargo_weight_kg, origin, destination]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.patch('/:id/status', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { status, final_odometer } = req.body;

        const validStatuses = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await client.query('BEGIN');

        const tripResult = await client.query('SELECT * FROM trips WHERE id = $1', [id]);
        if (tripResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Trip not found' });
        }
        const trip = tripResult.rows[0];

        // Update Trip Status
        const updateTripQuery = 'UPDATE trips SET status = $1' + (final_odometer ? ', final_odometer = $2 ' : ' ') + 'WHERE id = $3 RETURNING *';
        const updateParams = final_odometer ? [status, final_odometer, id] : [status, id];
        const updatedTrip = await client.query(updateTripQuery, updateParams);

        // Determine atomic cascade logic
        if (status === 'Dispatched') {
            await client.query("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [trip.vehicle_id]);
            await client.query("UPDATE drivers SET duty_status = 'On Trip' WHERE id = $1", [trip.driver_id]); // 'On Trip' per plan implicitly or keep 'On Duty', let's stick to 'On Duty' conceptually, but plan says "driver flip back to Available/On Duty"
        } else if (status === 'Completed') {
            await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [trip.vehicle_id]);
            await client.query("UPDATE drivers SET trips_completed = trips_completed + 1, trips_total = trips_total + 1 WHERE id = $1", [trip.driver_id]);
            if (final_odometer) {
                await client.query("UPDATE vehicles SET odometer = $1 WHERE id = $2", [final_odometer, trip.vehicle_id]);
            }
        } else if (status === 'Cancelled') {
            await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [trip.vehicle_id]);
            // Depending on previous state, if dispatched then cancelled, we just make them available again
            // Update driver safety score calculation (total + 1, completed + 0)
            await client.query("UPDATE drivers SET trips_total = trips_total + 1 WHERE id = $1", [trip.driver_id]);
        }

        // Update safety scores globally for that driver
        await client.query(`
            UPDATE drivers 
            SET safety_score = CASE WHEN trips_total > 0 THEN (trips_completed::numeric / trips_total::numeric) * 100 ELSE 100 END 
            WHERE id = $1
        `, [trip.driver_id]);

        await client.query('COMMIT');
        res.json(updatedTrip.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
