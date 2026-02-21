const { pool } = require('./db');

async function checkUsers() {
    try {
        const res = await pool.query('SELECT id, name, email, role FROM users');
        console.table(res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

checkUsers();
