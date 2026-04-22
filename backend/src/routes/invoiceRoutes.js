const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const {
  getInvoices, getInvoice, createInvoice, bulkCreateInvoices,
  updateInvoice, deleteInvoice, markPaid,
} = require('../controllers/invoiceController');
const { getInvoicePdf } = require('../controllers/pdfController');

router.use(protect);
router.get('/', getInvoices);
router.post('/bulk-create', bulkCreateInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoice);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);
router.put('/:id/pay', markPaid);
router.get('/:id/pdf', getInvoicePdf);

module.exports = router;
