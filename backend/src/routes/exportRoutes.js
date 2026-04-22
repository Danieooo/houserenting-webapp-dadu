const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const { exportInvoicesCsv } = require('../controllers/exportController');

router.use(protect);
router.get('/invoices', exportInvoicesCsv);

module.exports = router;
