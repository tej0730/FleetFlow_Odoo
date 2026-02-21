const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function runMigrations() {
    const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');

    // Sort files to ensure 01_schema runs before 02_seed
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    try {
        console.log('Starting execution of DB scripts...');
        for (const file of files) {
            console.log(`Executing ${file}...`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf-8');

            await pool.query(sql);
            console.log(`${file} executed successfully.`);
        }
        console.log('All DB scripts executed successfully!');
    } catch (err) {
        console.error('Error executing DB scripts:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigrations();
