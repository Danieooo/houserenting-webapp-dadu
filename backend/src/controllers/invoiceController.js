const prisma = require('../config/db');
const { calculateTotal } = require('../services/invoiceService');

exports.getInvoices = async (req, res, next) => {
  try {
    const { month, year, roomId, paid } = req.query;
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: req.user.id,
        ...(month && { month: Number(month) }),
        ...(year && { year: Number(year) }),
        ...(roomId && { roomId: Number(roomId) }),
        ...(paid !== undefined && { paid: paid === 'true' }),
      },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ success: true, data: invoices });
  } catch (err) { next(err); }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
      include: {
        room: true,
        tenant: { include: { files: true } },
        user: { select: { id: true, name: true, settings: true } },
      },
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Hóa đơn không tồn tại', code: 'NOT_FOUND' });
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const {
      roomId, tenantId, month, year,
      electricityPrev, electricityNow,
      waterPrev, waterNow,
      otherFees = 0, otherNote,
      periodStart, periodEnd, note,
    } = req.body;

    const room = await prisma.room.findFirst({ where: { id: Number(roomId), userId: req.user.id } });
    if (!room) return res.status(404).json({ success: false, message: 'Phòng không tồn tại', code: 'ROOM_NOT_FOUND' });

    const tenant = await prisma.tenant.findFirst({ where: { id: Number(tenantId), roomId: room.id } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Khách thuê không tồn tại', code: 'TENANT_NOT_FOUND' });

    const start = periodStart ? new Date(periodStart) : new Date(year, month - 1, 1);
    const end = periodEnd ? new Date(periodEnd) : new Date(year, month, 0);

    const totalAmount = calculateTotal({
      baseRent: room.baseRent,
      electricityPrev: Number(electricityPrev),
      electricityNow: Number(electricityNow),
      electricityPrice: room.electricPrice,
      waterPrev: Number(waterPrev),
      waterNow: Number(waterNow),
      waterPrice: room.waterPrice,
      garbageFee: room.garbageFee,
      otherFees: Number(otherFees),
      periodStart: start,
      periodEnd: end,
    });

    const invoice = await prisma.invoice.create({
      data: {
        roomId: room.id,
        tenantId: tenant.id,
        userId: req.user.id,
        month: Number(month),
        year: Number(year),
        baseRent: room.baseRent,
        electricityPrev: Number(electricityPrev),
        electricityNow: Number(electricityNow),
        electricityPrice: room.electricPrice,
        waterPrev: Number(waterPrev),
        waterNow: Number(waterNow),
        waterPrice: room.waterPrice,
        garbageFee: room.garbageFee,
        otherFees: Number(otherFees),
        otherNote: otherNote || null,
        periodStart: start,
        periodEnd: end,
        totalAmount,
        note: note || null,
      },
    });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Hóa đơn tháng này đã tồn tại', code: 'INVOICE_DUPLICATE' });
    }
    next(err);
  }
};

exports.bulkCreateInvoices = async (req, res, next) => {
  try {
    const { month, year, readings = {} } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Thiếu tháng/năm', code: 'VALIDATION_ERROR' });
    }

    // Lấy tất cả phòng đang có người (OCCUPIED) của user
    const rooms = await prisma.room.findMany({
      where: { userId: req.user.id, status: 'OCCUPIED' },
      include: { tenants: { where: { active: true } } },
    });

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);
    const created = [];
    const skipped = [];

    for (const room of rooms) {
      const tenant = room.tenants[0];
      if (!tenant) continue;

      // Tự động điền electricityPrev từ hóa đơn tháng trước
      const lastInvoice = await prisma.invoice.findFirst({
        where: { roomId: room.id },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
      const electricityPrev = lastInvoice?.electricityNow ?? 0;
      const waterPrev = lastInvoice?.waterNow ?? 0;

      // Kiểm tra đã tồn tại chưa
      const existing = await prisma.invoice.findFirst({
        where: { roomId: room.id, tenantId: tenant.id, month: Number(month), year: Number(year) },
      });
      if (existing) { skipped.push(room.name); continue; }

      const roomReadings = readings[room.id] || {};
      const eNowStr = roomReadings.electricityNow;
      const wNowStr = roomReadings.waterNow;
      const electricityNow = (eNowStr !== undefined && eNowStr !== '') ? Number(eNowStr) : electricityPrev;
      const waterNow = (wNowStr !== undefined && wNowStr !== '') ? Number(wNowStr) : waterPrev;

      const totalAmount = calculateTotal({
        baseRent: room.baseRent,
        electricityPrev,
        electricityNow,
        electricityPrice: room.electricPrice,
        waterPrev,
        waterNow,
        waterPrice: room.waterPrice,
        garbageFee: room.garbageFee,
        otherFees: 0,
        periodStart,
        periodEnd,
      });

      const invoice = await prisma.invoice.create({
        data: {
          roomId: room.id,
          tenantId: tenant.id,
          userId: req.user.id,
          month: Number(month),
          year: Number(year),
          baseRent: room.baseRent,
          electricityPrev,
          electricityNow,
          electricityPrice: room.electricPrice,
          waterPrev,
          waterNow,
          waterPrice: room.waterPrice,
          garbageFee: room.garbageFee,
          otherFees: 0,
          periodStart,
          periodEnd,
          totalAmount,
        },
      });
      created.push(invoice);
    }

    res.status(201).json({
      success: true,
      message: `Đã tạo ${created.length} hóa đơn. Bỏ qua: ${skipped.join(', ') || 'không có'}`,
      data: { created: created.length, skipped: skipped.length, skippedRooms: skipped },
    });
  } catch (err) { next(err); }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!invoice) return res.status(404).json({ success: false, message: 'Hóa đơn không tồn tại', code: 'NOT_FOUND' });

    const {
      electricityPrev, electricityNow, waterPrev, waterNow,
      otherFees, otherNote, note, periodStart, periodEnd,
    } = req.body;

    const updatedData = {
      ...(electricityPrev !== undefined && { electricityPrev: Number(electricityPrev) }),
      ...(electricityNow !== undefined && { electricityNow: Number(electricityNow) }),
      ...(waterPrev !== undefined && { waterPrev: Number(waterPrev) }),
      ...(waterNow !== undefined && { waterNow: Number(waterNow) }),
      ...(otherFees !== undefined && { otherFees: Number(otherFees) }),
      ...(otherNote !== undefined && { otherNote }),
      ...(note !== undefined && { note }),
      ...(periodStart && { periodStart: new Date(periodStart) }),
      ...(periodEnd && { periodEnd: new Date(periodEnd) }),
    };

    // Tính lại totalAmount
    const merged = { ...invoice, ...updatedData };
    const totalAmount = calculateTotal({
      baseRent: merged.baseRent,
      electricityPrev: merged.electricityPrev,
      electricityNow: merged.electricityNow,
      electricityPrice: merged.electricityPrice,
      waterPrev: merged.waterPrev,
      waterNow: merged.waterNow,
      waterPrice: merged.waterPrice,
      garbageFee: merged.garbageFee,
      otherFees: merged.otherFees,
      periodStart: merged.periodStart,
      periodEnd: merged.periodEnd,
    });

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { ...updatedData, totalAmount },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!invoice) return res.status(404).json({ success: false, message: 'Hóa đơn không tồn tại', code: 'NOT_FOUND' });
    await prisma.invoice.delete({ where: { id: invoice.id } });
    res.json({ success: true, message: 'Đã xóa hóa đơn' });
  } catch (err) { next(err); }
};

exports.markPaid = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!invoice) return res.status(404).json({ success: false, message: 'Hóa đơn không tồn tại', code: 'NOT_FOUND' });
    const { paidAmount } = req.body;
    const amount = paidAmount ? Number(paidAmount) : invoice.totalAmount;
    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { paid: amount >= invoice.totalAmount, paidDate: new Date(), paidAmount: amount },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};
