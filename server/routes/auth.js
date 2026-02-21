const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const Joi = require('joi');
const validateRequest = require('../middleware/validate');

const loginSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
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

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('manager', 'dispatcher', 'safety', 'analyst').default('dispatcher')
});

router.post('/register', validateRequest(registerSchema), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, passwordHash, role]
        );

        const user = newUser.rows[0];
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// In-memory store for reset PINs: { email: { pin, expiresAt, userId } }
const resetTokens = new Map();

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required()
});

router.post('/forgot-password', validateRequest(forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            // Silently succeed to prevent email enumeration
            return res.json({ message: 'If an account exists, a reset PIN was sent to that email.' });
        }

        const user = userResult.rows[0];
        // Generate 6 digit PIN string
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

        resetTokens.set(email, { pin, expiresAt, userId: user.id });

        // Simulate sending email
        console.log(`\n=== EMAIL SIMULATOR ===\nTo: ${email}\nSubject: Password Reset PIN\nBody: Your 6-digit PIN is: ${pin}\n=======================\n`);

        res.json({ message: 'If an account exists, a reset PIN was sent to that email.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    token: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required()
});

router.post('/reset-password', validateRequest(resetPasswordSchema), async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;

        const resetData = resetTokens.get(email);

        if (!resetData) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        if (Date.now() > resetData.expiresAt) {
            resetTokens.delete(email);
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        if (resetData.pin !== token) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Successfully validated PIN
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, resetData.userId]);

        // Clear the token so it cannot be reused
        resetTokens.delete(email);

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
