const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');
const Joi = require('joi');
const validateRequest = require('../middleware/validate');

const driverSchema = Joi.object({
    name: Joi.string().required(),
    license_number: Joi.string().required(),
    license_expiry: Joi.date().iso().required(),
    duty_status: Joi.string().valid('On Duty', 'Off Duty', 'Suspended', 'On Leave').optional(),
});

router.get('/expiring-soon', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM drivers 
            WHERE license_expiry <= CURRENT_DATE + INTERVAL '30 days'
            ORDER BY license_expiry ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM drivers ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticateToken, validateRequest(driverSchema), async (req, res) => {
    try {
        const { name, license_number, license_expiry, duty_status } = req.body;

        const checkResult = await pool.query('SELECT * FROM drivers WHERE license_number = $1', [license_number]);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: 'License number must be unique' });
        }

        const result = await pool.query(
            `INSERT INTO drivers (name, license_number, license_expiry, duty_status) 
             VALUES ($1, $2, $3, COALESCE($4, 'Off Duty')) RETURNING *`,
            [name, license_number, license_expiry, duty_status]
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

        let query = 'UPDATE drivers SET ';
        const params = [];
        let index = 1;

        for (const [key, value] of Object.entries(updates)) {
            query += `${key} = $${index}, `;
            params.push(value);
            index++;
        }

        query = query.slice(0, -2);
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
