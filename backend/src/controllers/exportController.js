const prisma = require('../config/db');

exports.exportInvoicesCsv = async (req, res, next) => {
  try {
    const { year } = req.query;
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: req.user.id,
        ...(year && { year: Number(year) }),
      },
      include: {
        room: { select: { name: true } },
        tenant: { select: { name: true, phone: true } },
      },
      orderBy: [{ year: 'asc' }, { month: 'asc' }, { room: { name: 'asc' } }],
    });

    const headers = [
      'Tháng', 'Năm', 'Phòng', 'Khách thuê', 'SĐT',
      'Tiền phòng', 'Điện (kWh)', 'Nước (m³)',
      'Rác', 'Phí khác', 'Tổng', 'Đã thu', 'Số tiền thu',
    ].join(',');

    const rows = invoices.map(i => [
      i.month, i.year,
      `"${i.room.name}"`,
      `"${i.tenant.name}"`,
      i.tenant.phone,
      i.baseRent,
      i.electricityNow - i.electricityPrev,
      i.waterNow - i.waterPrev,
      i.garbageFee,
      i.otherFees,
      i.totalAmount,
      i.paid ? 'Có' : 'Không',
      i.paidAmount || '',
    ].join(',')).join('\n');

    const bom = '\uFEFF'; // UTF-8 BOM for Excel Vietnamese support
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=hoadon-${year || 'all'}.csv`);
    res.send(bom + headers + '\n' + rows);
  } catch (err) { next(err); }
};
