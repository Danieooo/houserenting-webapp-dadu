const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const { getRooms, getRoom, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');

router.use(protect);
router.get('/', getRooms);
router.post('/', createRoom);
router.get('/:id', getRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

module.exports = router;
