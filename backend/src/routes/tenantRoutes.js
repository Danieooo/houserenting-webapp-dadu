const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const {
  getTenants, getTenant, createTenant, updateTenant, deleteTenant, moveOutTenant,
  uploadFile, deleteFile, uploadMiddleware,
} = require('../controllers/tenantController');

router.use(protect);
router.get('/', getTenants);
router.post('/', createTenant);
router.get('/:id', getTenant);
router.put('/:id', updateTenant);
router.put('/:id/move-out', moveOutTenant);
router.delete('/:id', deleteTenant);
router.post('/:id/files', uploadMiddleware, uploadFile);
router.delete('/:id/files/:fileId', deleteFile);

module.exports = router;
