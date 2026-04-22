const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');

const formatCurrency = (n) => n.toLocaleString('en-US').replace(/,/g, '.') + ' d';
const formatDate = (d) => {
  const date = new Date(d);
  return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`;
};

const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

exports.getInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: Number(req.params.id), userId: req.user.id },
      include: {
        room: true,
        tenant: true,
        user: { include: { settings: true } },
      },
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Hoa don khong ton tai', code: 'NOT_FOUND' });

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    let font;
    const fontPath = path.join(__dirname, '../../assets/fonts/segoeui.ttf');
    if (fs.existsSync(fontPath)) {
      const fontBytes = fs.readFileSync(fontPath);
      font = await pdfDoc.embedFont(fontBytes);
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    const drawText = (page, text, options) => {
      page.drawText(removeAccents(text), options);
    };

    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const margin = 50;
    const settings = invoice.user.settings || {};

    // Header
    let y = height - margin;
    const shopName = settings.shopName || 'Nha tro';
    drawText(page, shopName, { x: margin, y, size: 18, font, color: rgb(0.1, 0.1, 0.5) });
    y -= 22;
    if (settings.address) { drawText(page, settings.address, { x: margin, y, size: 10, font }); y -= 16; }
    if (settings.phone) { drawText(page, `SDT: ${settings.phone}`, { x: margin, y, size: 10, font }); y -= 16; }

    // Title
    y -= 10;
    const title = `HOA DON TIEN NHA THANG ${invoice.month}/${invoice.year}`;
    const titleW = font.widthOfTextAtSize(title, 14);
    drawText(page, title, { x: (width - titleW) / 2, y, size: 14, font, color: rgb(0.1, 0.1, 0.5) });
    y -= 30;

    // Info
    drawText(page, `Phong: ${invoice.room.name}`, { x: margin, y, size: 11, font });
    drawText(page, `Khach thue: ${invoice.tenant.name}`, { x: width / 2, y, size: 11, font });
    y -= 18;
    drawText(page, `Ky tinh: ${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`, { x: margin, y, size: 10, font });
    drawText(page, `SDT: ${invoice.tenant.phone}`, { x: width / 2, y, size: 10, font });
    y -= 25;

    // Divider
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 20;

    const drawRow = (label, amount, bold = false) => {
      const size = bold ? 12 : 11;
      drawText(page, label, { x: margin, y, size, font });
      const amtStr = formatCurrency(amount);
      const amtW = font.widthOfTextAtSize(amtStr, size);
      drawText(page, amtStr, { x: width - margin - amtW, y, size, font });
      y -= 22;
    };

    // Tính tiền
    const start = new Date(invoice.periodStart);
    const end = new Date(invoice.periodEnd);
    const daysInPeriod = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    const proRataRent = Math.round(invoice.baseRent * daysInPeriod / daysInMonth);
    const elecUnits = invoice.electricityNow - invoice.electricityPrev;
    const waterUnits = invoice.waterNow - invoice.waterPrev;

    drawRow(`Tien phong (${daysInPeriod}/${daysInMonth} ngay)`, proRataRent);
    drawRow(`Dien: ${elecUnits} so x ${formatCurrency(invoice.electricityPrice)}`, elecUnits * invoice.electricityPrice);
    drawRow(`Nuoc: ${waterUnits} m3 x ${formatCurrency(invoice.waterPrice)}`, waterUnits * invoice.waterPrice);
    drawRow('Rac', invoice.garbageFee);
    if (invoice.otherFees > 0) drawRow(`Phi khac${invoice.otherNote ? ': ' + invoice.otherNote : ''}`, invoice.otherFees);

    y -= 5;
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 20;
    drawRow('TONG CONG', invoice.totalAmount, true);

    // Status
    y -= 5;
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 20;
    const status = invoice.paid ? 'DA THANH TOAN' : 'CHUA THANH TOAN';
    const statusColor = invoice.paid ? rgb(0.1, 0.5, 0.1) : rgb(0.8, 0.1, 0.1);
    drawText(page, `Trang thai: ${status}`, { x: margin, y, size: 11, font, color: statusColor });
    y -= 25;
    drawText(page, `Ngay lap: ${formatDate(invoice.createdAt)}`, { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=hoadon-${invoice.room.name}-${invoice.month}-${invoice.year}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) { next(err); }
};
