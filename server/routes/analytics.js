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

        const fuelResult = await pool.query("SELECT SUM(cost) as total_fuel_cost, SUM(liters) as total_liters FROM fuel_logs");
        const totalFuelCost = parseFloat(fuelResult.rows[0].total_fuel_cost || 0);
        const totalLiters = parseFloat(fuelResult.rows[0].total_liters || 0);

        const totalOperationalCost = totalMaintCost + totalFuelCost;

        const odoResult = await pool.query("SELECT SUM(odometer) as total_odo FROM vehicles");
        const totalOdo = parseFloat(odoResult.rows[0].total_odo || 0);

        const fuelEfficiencyKmPerL = totalLiters > 0 ? (totalOdo / totalLiters).toFixed(2) : 0;

        res.json({
            utilizationRate,
            totalVehicles: total,
            totalAcquisitionCost: totalAcqCost,
            totalMaintenanceCost: totalMaintCost,
            totalFuelCost,
            totalOperationalCost,
            fuelEfficiencyKmPerL,
            fleetCostPerVehicle: total > 0 ? ((totalAcqCost + totalOperationalCost) / total).toFixed(2) : 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/monthly', authenticateToken, async (req, res) => {
    try {
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

        const fuelMonthly = await pool.query(`
            SELECT TO_CHAR(date, 'YYYY-MM') as month,
                   SUM(cost) as total_fuel
            FROM fuel_logs
            GROUP BY month
            ORDER BY month DESC
        `);

        const monthsMap = {};

        tripMonthly.rows.forEach(row => {
            monthsMap[row.month] = { revenue: parseFloat(row.estimated_revenue) || 0, maintenance: 0, fuel: 0 };
        });

        maintMonthly.rows.forEach(row => {
            if (!monthsMap[row.month]) {
                monthsMap[row.month] = { revenue: 0, maintenance: 0, fuel: 0 };
            }
            monthsMap[row.month].maintenance = parseFloat(row.total_maintenance) || 0;
        });

        fuelMonthly.rows.forEach(row => {
            if (!monthsMap[row.month]) {
                monthsMap[row.month] = { revenue: 0, maintenance: 0, fuel: 0 };
            }
            monthsMap[row.month].fuel = parseFloat(row.total_fuel) || 0;
        });

        const report = Object.keys(monthsMap).sort().reverse().map(month => ({
            month,
            revenue: monthsMap[month].revenue,
            maintenance_cost: monthsMap[month].maintenance,
            estimated_fuel_cost: monthsMap[month].fuel,
            net_profit: monthsMap[month].revenue - monthsMap[month].maintenance - monthsMap[month].fuel
        }));

        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
