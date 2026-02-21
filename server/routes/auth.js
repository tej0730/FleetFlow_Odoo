const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const Joi = require('joi');
const validateRequest = require('../middleware/validate');

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

router.post('/login', validateRequest(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userResult.rows[0];
        const passwordsMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordsMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ── Register ──────────────────────────────────────────────────────────────────
const registerSchema = Joi.object({
    name:     Joi.string().min(2).max(100).required(),
    email:    Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role:     Joi.string().valid('manager', 'dispatcher', 'safety', 'analyst').required(),
});

router.post('/register', validateRequest(registerSchema), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if email already taken
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, role',
            [name, email, password_hash, role]
        );
        const user = result.rows[0];

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

