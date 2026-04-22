const prisma = require('../config/db');

exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [totalRooms, occupied, invoicesThisMonth] = await Promise.all([
      prisma.room.count({ where: { userId } }),
      prisma.room.count({ where: { userId, status: 'OCCUPIED' } }),
      prisma.invoice.findMany({ where: { userId, month, year } }),
    ]);

    const revenue = invoicesThisMonth.filter(i => i.paid).reduce((s, i) => s + (i.paidAmount || i.totalAmount), 0);

    res.json({
      success: true,
      data: {
        revenue,
        totalRooms,
        occupied,
        available: totalRooms - occupied,
        month,
        year,
      },
    });
  } catch (err) { next(err); }
};

exports.getUnpaid = async (req, res, next) => {
  try {
    const now = new Date();
    const unpaid = await prisma.invoice.findMany({
      where: {
        userId: req.user.id,
        paid: false,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      include: {
        room: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { totalAmount: 'desc' },
    });
    res.json({ success: true, data: unpaid });
  } catch (err) { next(err); }
};

exports.getExpiring = async (req, res, next) => {
  try {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const tenants = await prisma.tenant.findMany({
      where: {
        room: { userId: req.user.id },
        active: true,
        moveOutDate: { gte: now, lte: in30Days },
      },
      include: { room: { select: { id: true, name: true } } },
      orderBy: { moveOutDate: 'asc' },
    });
    res.json({ success: true, data: tenants });
  } catch (err) { next(err); }
};

exports.getRevenueChart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const invoices = await prisma.invoice.findMany({ where: { userId, month, year, paid: true } });
      const revenue = invoices.reduce((s, inv) => s + (inv.paidAmount || inv.totalAmount), 0);
      data.push({ month: `${month}/${year}`, revenue });
    }

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getOccupancyChart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const data = [];
    const totalRooms = await prisma.room.count({ where: { userId } });

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      // Count distinct rooms that had an invoice this month
      const occupiedRooms = await prisma.invoice.findMany({
        where: { userId, month, year },
        distinct: ['roomId'],
      });
      const rate = totalRooms > 0 ? Math.round((occupiedRooms.length / totalRooms) * 100) : 0;
      data.push({ month: `${month}/${year}`, rate, occupied: occupiedRooms.length, total: totalRooms });
    }

    res.json({ success: true, data });
  } catch (err) { next(err); }
};
