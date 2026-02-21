const bcrypt = require('bcrypt');
const { pool } = require('./db');

async function fixPassword() {
    const newHash = await bcrypt.hash('password123', 10);
    await pool.query('UPDATE users SET password_hash = $1', [newHash]);
    console.log("All users password updated to 'password123'");
    process.exit(0);
}

fixPassword();
