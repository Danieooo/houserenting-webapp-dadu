const prisma = require('../config/db');

exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { userId: req.user.id },
      include: {
        tenants: { where: { active: true }, select: { id: true, name: true, phone: true } },
        invoices: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 1, select: { electricityNow: true, waterNow: true } },
        _count: { select: { invoices: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: rooms });
  } catch (err) { next(err); }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await prisma.room.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
      include: {
        tenants: { where: { active: true } },
        invoices: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 },
      },
    });
    if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại', code: 'ROOM_NOT_FOUND' });
    res.json({ success: true, data: room });
  } catch (err) { next(err); }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { name, floor, area, baseRent, electricPrice, waterPrice, garbageFee } = req.body;
    if (!name || !baseRent) {
      return res.status(400).json({ success: false, message: 'Thiếu tên phòng hoặc giá thuê', code: 'VALIDATION_ERROR' });
    }
    const room = await prisma.room.create({
      data: {
        name,
        floor: floor ? Number(floor) : null,
        area: area ? Number(area) : null,
        baseRent: Number(baseRent),
        electricPrice: electricPrice ? Number(electricPrice) : 3500,
        waterPrice: waterPrice ? Number(waterPrice) : 15000,
        garbageFee: garbageFee ? Number(garbageFee) : 20000,
        userId: req.user.id,
      },
    });
    res.status(201).json({ success: true, data: room });
  } catch (err) { next(err); }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const room = await prisma.room.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại', code: 'ROOM_NOT_FOUND' });

    const { name, floor, area, baseRent, electricPrice, waterPrice, garbageFee, status } = req.body;
    const updated = await prisma.room.update({
      where: { id: room.id },
      data: {
        ...(name && { name }),
        floor: floor !== undefined ? (floor ? Number(floor) : null) : undefined,
        area: area !== undefined ? (area ? Number(area) : null) : undefined,
        ...(baseRent && { baseRent: Number(baseRent) }),
        ...(electricPrice && { electricPrice: Number(electricPrice) }),
        ...(waterPrice && { waterPrice: Number(waterPrice) }),
        ...(garbageFee && { garbageFee: Number(garbageFee) }),
        ...(status && { status }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await prisma.room.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại', code: 'ROOM_NOT_FOUND' });
    if (room.status === 'OCCUPIED') {
      return res.status(400).json({ success: false, message: 'Không thể xóa phòng đang có người thuê', code: 'ROOM_OCCUPIED' });
    }
    await prisma.room.delete({ where: { id: room.id } });
    res.json({ success: true, message: 'Đã xóa phòng' });
  } catch (err) { next(err); }
};
