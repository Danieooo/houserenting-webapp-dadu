const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const { getSummary, getUnpaid, getExpiring, getRevenueChart, getOccupancyChart } = require('../controllers/dashboardController');

router.use(protect);
router.get('/summary', getSummary);
router.get('/unpaid', getUnpaid);
router.get('/expiring', getExpiring);
router.get('/revenue-chart', getRevenueChart);
router.get('/occupancy-chart', getOccupancyChart);

module.exports = router;
