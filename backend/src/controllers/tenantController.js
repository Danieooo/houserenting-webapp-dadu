const prisma = require('../config/db');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file ảnh hoặc PDF'));
  },
});

exports.uploadMiddleware = upload.single('file');

exports.getTenants = async (req, res, next) => {
  try {
    const { active } = req.query;
    const tenants = await prisma.tenant.findMany({
      where: {
        room: { userId: req.user.id },
        ...(active !== undefined && { active: active === 'true' }),
      },
      include: { room: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: tenants });
  } catch (err) { next(err); }
};

exports.getTenant = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: Number(req.params.id), room: { userId: req.user.id } },
      include: {
        room: { select: { id: true, name: true } },
        files: true,
        invoices: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 },
      },
    });
    if (!tenant) return res.status(404).json({ success: false, message: 'Khách thuê không tồn tại', code: 'TENANT_NOT_FOUND' });
    res.json({ success: true, data: tenant });
  } catch (err) { next(err); }
};

exports.createTenant = async (req, res, next) => {
  try {
    const { name, phone, idCard, roomId, moveInDate, moveOutDate, deposit } = req.body;
    if (!name || !phone || !roomId || !moveInDate) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc', code: 'VALIDATION_ERROR' });
    }
    const room = await prisma.room.findFirst({ where: { id: Number(roomId), userId: req.user.id } });
    if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại', code: 'ROOM_NOT_FOUND' });
    if (room.status === 'OCCUPIED') {
      return res.status(400).json({ success: false, message: 'Phòng đã có người thuê', code: 'ROOM_OCCUPIED' });
    }
    const tenant = await prisma.tenant.create({
      data: {
        name,
        phone,
        idCard: idCard || null,
        roomId: Number(roomId),
        moveInDate: new Date(moveInDate),
        moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
        deposit: deposit ? Number(deposit) : 0,
      },
    });
    await prisma.room.update({ where: { id: Number(roomId) }, data: { status: 'OCCUPIED' } });
    res.status(201).json({ success: true, data: tenant });
  } catch (err) { next(err); }
};

exports.updateTenant = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: Number(req.params.id), room: { userId: req.user.id } },
    });
    if (!tenant) return res.status(404).json({ success: false, message: 'Khách thuê không tồn tại', code: 'TENANT_NOT_FOUND' });

    const { name, phone, idCard, moveInDate, moveOutDate, deposit } = req.body;
    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        idCard: idCard !== undefined ? idCard : undefined,
        ...(moveInDate && { moveInDate: new Date(moveInDate) }),
        moveOutDate: moveOutDate !== undefined ? (moveOutDate ? new Date(moveOutDate) : null) : undefined,
        ...(deposit !== undefined && { deposit: Number(deposit) }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.moveOutTenant = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: Number(req.params.id), room: { userId: req.user.id } },
    });
    if (!tenant) return res.status(404).json({ success: false, message: 'Khách thuê không tồn tại', code: 'TENANT_NOT_FOUND' });

    await prisma.tenant.update({ where: { id: tenant.id }, data: { active: false } });
    const activeTenants = await prisma.tenant.count({ where: { roomId: tenant.roomId, active: true } });
    if (activeTenants === 0) {
      await prisma.room.update({ where: { id: tenant.roomId }, data: { status: 'AVAILABLE' } });
    }
    res.json({ success: true, message: 'Khách đã được chuyển sang phần đã rời đi' });
  } catch (err) { next(err); }
};

exports.deleteTenant = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: Number(req.params.id), room: { userId: req.user.id } },
    });
    if (!tenant) return res.status(404).json({ success: false, message: 'Khách thuê không tồn tại', code: 'TENANT_NOT_FOUND' });

    await prisma.$transaction([
      prisma.tenantFile.deleteMany({ where: { tenantId: tenant.id } }),
      prisma.invoice.deleteMany({ where: { tenantId: tenant.id } }),
      prisma.tenant.delete({ where: { id: tenant.id } }),
    ]);

    const activeTenants = await prisma.tenant.count({ where: { roomId: tenant.roomId, active: true } });
    if (activeTenants === 0) {
      await prisma.room.update({ where: { id: tenant.roomId }, data: { status: 'AVAILABLE' } });
    }

    res.json({ success: true, message: 'Đã xóa khách thuê hoàn toàn' });
  } catch (err) { next(err); }
};

exports.uploadFile = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: Number(req.params.id), room: { userId: req.user.id } },
    });
    if (!tenant) return res.status(404).json({ success: false, message: 'Khách thuê không tồn tại', code: 'TENANT_NOT_FOUND' });
    if (!req.file) return res.status(400).json({ success: false, message: 'Không có file', code: 'VALIDATION_ERROR' });

    const { label } = req.body;
    const result = await uploadToCloudinary(req.file.buffer, 'houserenting/tenants');
    const file = await prisma.tenantFile.create({
      data: { tenantId: tenant.id, label: label || req.file.originalname, url: result.secure_url },
    });
    res.status(201).json({ success: true, data: file });
  } catch (err) { next(err); }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { id: Number(req.params.id), room: { userId: req.user.id } },
    });
    if (!tenant) return res.status(404).json({ success: false, message: 'Khách thuê không tồn tại', code: 'TENANT_NOT_FOUND' });

    const file = await prisma.tenantFile.findFirst({ where: { id: Number(req.params.fileId), tenantId: tenant.id } });
    if (!file) return res.status(404).json({ success: false, message: 'File không tồn tại', code: 'NOT_FOUND' });

    await prisma.tenantFile.delete({ where: { id: file.id } });
    res.json({ success: true, message: 'Đã xóa file' });
  } catch (err) { next(err); }
};
