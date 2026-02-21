const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');

router.get('/summary', authenticateToken, async (req, res) => {
    try {
        const activeResult = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status IN ('Available', 'On Trip')");
        const totalResult = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status != 'Retired'");

        const active = parseInt(activeResult.rows[0].count, 10);
        const total = parseInt(totalResult.rows[0].count, 10);
        const utilizationRate = Math.round((active / (total || 1)) * 100);

        const costResult = await pool.query("SELECT SUM(acquisition_cost) as total_acq FROM vehicles");
        const totalAcqCost = parseFloat(costResult.rows[0].total_acq || 0);

        const maintResult = await pool.query("SELECT SUM(cost) as total_maint FROM maintenance_logs");
        const totalMaintCost = parseFloat(maintResult.rows[0].total_maint || 0);

        // Simple placeholder ROI formula, or just returning raw numbers
        res.json({
            utilizationRate,
            totalVehicles: total,
            totalAcquisitionCost: totalAcqCost,
            totalMaintenanceCost: totalMaintCost,
            fleetCostPerVehicle: total > 0 ? ((totalAcqCost + totalMaintCost) / total).toFixed(2) : 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/monthly', authenticateToken, async (req, res) => {
    try {
        // Mock revenue logic (e.g. 500 per completed trip)
        const tripMonthly = await pool.query(`
            SELECT TO_CHAR(created_at, 'YYYY-MM') as month,
                   COUNT(*) * 500.00 as estimated_revenue
            FROM trips 
            WHERE status = 'Completed'
            GROUP BY month
            ORDER BY month DESC
        `);

        const maintMonthly = await pool.query(`
            SELECT TO_CHAR(date, 'YYYY-MM') as month,
                   SUM(cost) as total_maintenance
            FROM maintenance_logs
            GROUP BY month
            ORDER BY month DESC
        `);

        // Merge in JS to avoid complex cross DB logic for this specific sprint scope
        const monthsMap = {};

        tripMonthly.rows.forEach(row => {
            monthsMap[row.month] = { revenue: parseFloat(row.estimated_revenue) || 0, maintenance: 0 };
        });

        maintMonthly.rows.forEach(row => {
            if (!monthsMap[row.month]) {
                monthsMap[row.month] = { revenue: 0, maintenance: 0 };
            }
            monthsMap[row.month].maintenance = parseFloat(row.total_maintenance) || 0;
        });

        const report = Object.keys(monthsMap).sort().reverse().map(month => ({
            month,
            revenue: monthsMap[month].revenue,
            maintenance_cost: monthsMap[month].maintenance,
            estimated_fuel_cost: monthsMap[month].revenue * 0.15, // Mock fuel as 15% of rev for hackathon spec
            net_profit: monthsMap[month].revenue - monthsMap[month].maintenance - (monthsMap[month].revenue * 0.15)
        }));

        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
