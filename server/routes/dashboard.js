const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');

router.get('/stats', authenticateToken, async (req, res) => {
    try {
        // activeFleet = Vehicles with status = 'Available' or 'On Trip' (all non-retired and non-in-shop? Plan says available/total but let's count Available + On Trip)
        const activeFleetResult = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status IN ('Available', 'On Trip')");
        const activeFleet = parseInt(activeFleetResult.rows[0].count, 10);

        const totalFleetResult = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status != 'Retired'");
        const totalFleet = parseInt(totalFleetResult.rows[0].count, 10);

        const utilizationRate = Math.round((activeFleet / (totalFleet || 1)) * 100);

        const maintAlertsResult = await pool.query("SELECT COUNT(*) FROM maintenance_logs WHERE status = 'Open'");
        const maintenanceAlerts = parseInt(maintAlertsResult.rows[0].count, 10);

        const pendingCargoResult = await pool.query("SELECT SUM(cargo_weight_kg) as total_cargo FROM trips WHERE status = 'Draft'");
        const pendingCargo = parseInt(pendingCargoResult.rows[0].total_cargo || 0, 10);

        res.json({
            activeFleet,
            maintenanceAlerts,
            utilizationRate,
            pendingCargo
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
