const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');
const Joi = require('joi');
const validateRequest = require('../middleware/validate');

const vehicleSchema = Joi.object({
    name: Joi.string().required(),
    license_plate: Joi.string().required(),
    type: Joi.string().valid('Truck', 'Van', 'Bike').required(),
    max_capacity_kg: Joi.number().integer().min(1).required(),
    acquisition_cost: Joi.number().precision(2).optional(),
    region: Joi.string().optional()
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, type, region } = req.query;
        let query = 'SELECT * FROM vehicles WHERE 1=1';
        const params = [];

        if (status) {
            params.push(status);
            query += ` AND status = $${params.length}`;
        }
        if (type) {
            params.push(type);
            query += ` AND type = $${params.length}`;
        }
        if (region) {
            params.push(region);
            query += ` AND region = $${params.length}`;
        }

        query += ' ORDER BY id ASC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const vehicle = result.rows[0];
        const maintResult = await pool.query('SELECT SUM(cost) as maint_cost FROM maintenance_logs WHERE vehicle_id = $1', [id]);
        vehicle.total_maintenance_cost = maintResult.rows[0].maint_cost || 0;

        res.json(vehicle);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticateToken, validateRequest(vehicleSchema), async (req, res) => {
    try {
        const { name, license_plate, type, max_capacity_kg, acquisition_cost, region } = req.body;

        const checkResult = await pool.query('SELECT * FROM vehicles WHERE license_plate = $1', [license_plate]);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'License plate must be unique' });
        }

        const result = await pool.query(
            `INSERT INTO vehicles (name, license_plate, type, max_capacity_kg, acquisition_cost, region) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, license_plate, type, max_capacity_kg, acquisition_cost || null, region || 'North America']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });

        let query = 'UPDATE vehicles SET ';
        const params = [];
        let index = 1;

        for (const [key, value] of Object.entries(updates)) {
            query += `${key} = $${index}, `;
            params.push(value);
            index++;
        }

        query = query.slice(0, -2); // remove last comma
        query += ` WHERE id = $${index} RETURNING *`;
        params.push(id);

        const result = await pool.query(query, params);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
