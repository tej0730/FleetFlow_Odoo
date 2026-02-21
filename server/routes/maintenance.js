const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');
const Joi = require('joi');
const validateRequest = require('../middleware/validate');

const maintSchema = Joi.object({
    vehicle_id: Joi.number().integer().required(),
    service_type: Joi.string().required(),
    cost: Joi.number().precision(2).required(),
    date: Joi.date().iso().required(),
    notes: Joi.string().allow('').optional()
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { vehicle_id } = req.query;
        let query = 'SELECT m.*, v.name as vehicle_name FROM maintenance_logs m JOIN vehicles v ON m.vehicle_id = v.id';
        const params = [];

        if (vehicle_id) {
            query += ' WHERE m.vehicle_id = $1';
            params.push(vehicle_id);
        }

        query += ' ORDER BY m.date DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticateToken, validateRequest(maintSchema), async (req, res) => {
    const client = await pool.connect();
    try {
        const { vehicle_id, service_type, cost, date, notes } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO maintenance_logs (vehicle_id, service_type, cost, date, notes, status) 
             VALUES ($1, $2, $3, $4, $5, 'Open') RETURNING *`,
            [vehicle_id, service_type, cost, date, notes]
        );

        await client.query("UPDATE vehicles SET status = 'In Shop' WHERE id = $1", [vehicle_id]);

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

router.patch('/:id/close', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        await client.query('BEGIN');

        const result = await client.query(
            "UPDATE maintenance_logs SET status = 'Closed' WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Maintenance log not found' });
        }

        const vehicle_id = result.rows[0].vehicle_id;
        await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [vehicle_id]);

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
