const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');
const Joi = require('joi');
const validateRequest = require('../middleware/validate');

const fuelSchema = Joi.object({
    vehicle_id: Joi.number().integer().required(),
    liters: Joi.number().precision(2).min(0.1).required(),
    cost: Joi.number().precision(2).min(0).required(),
    date: Joi.date().iso().required()
});

router.post('/', authenticateToken, validateRequest(fuelSchema), async (req, res) => {
    try {
        const { vehicle_id, liters, cost, date } = req.body;
        const result = await pool.query(
            `INSERT INTO fuel_logs (vehicle_id, liters, cost, date) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [vehicle_id, liters, cost, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { vehicle_id } = req.query;
        let query = `SELECT f.*, v.name as vehicle_name 
                     FROM fuel_logs f 
                     JOIN vehicles v ON f.vehicle_id = v.id 
                     WHERE 1=1`;
        const params = [];

        if (vehicle_id) {
            params.push(vehicle_id);
            query += ` AND f.vehicle_id = $${params.length}`;
        }

        query += ' ORDER BY f.date DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
