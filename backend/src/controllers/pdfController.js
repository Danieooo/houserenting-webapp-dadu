const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');

const formatCurrency = (n) => n.toLocaleString('en-US').replace(/,/g, '.') + ' đ';
const formatDate = (d) => {
  const date = new Date(d);
  return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`;
};

const findFontPath = () => {
  const candidates = [
    path.join(__dirname, '../../assets/fonts/segoeui.ttf'),
    path.join(__dirname, '../../assets/fonts/NotoSans-Regular.ttf'),
    'C:\\Windows\\Fonts\\segoeui.ttf',
    'C:\\Windows\\Fonts\\arial.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ];
  return candidates.find((p) => fs.existsSync(p));
};

const generateQrPngBytes = async (text) => {
  const dataUrl = await QRCode.toDataURL(text, { type: 'image/png', margin: 1, width: 250 });
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
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
    const fontPath = findFontPath();
    if (fontPath) {
      const fontBytes = fs.readFileSync(fontPath);
      font = await pdfDoc.embedFont(fontBytes);
    } else {
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    const drawText = (page, text, options) => {
      page.drawText(text || '', options);
    };

    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const margin = 50;
    const settings = invoice.user.settings || {};

    // Header
    let y = height - margin;
    const shopName = settings.shopName || 'Nhà trọ';
    drawText(page, shopName, { x: margin, y, size: 18, font, color: rgb(0.1, 0.1, 0.5) });
    y -= 22;
    if (settings.address) { drawText(page, settings.address, { x: margin, y, size: 10, font }); y -= 16; }
    if (settings.phone) { drawText(page, `SDT: ${settings.phone}`, { x: margin, y, size: 10, font }); y -= 16; }

    // Title
    y -= 10;
    const title = `HÓA ĐƠN TIỀN NHÀ THÁNG ${invoice.month}/${invoice.year}`;
    const titleW = font.widthOfTextAtSize(title, 14);
    drawText(page, title, { x: (width - titleW) / 2, y, size: 14, font, color: rgb(0.1, 0.1, 0.5) });
    y -= 30;

    // Info
    drawText(page, `Phòng: ${invoice.room.name}`, { x: margin, y, size: 11, font });
    drawText(page, `Khách thuê: ${invoice.tenant.name}`, { x: width / 2, y, size: 11, font });
    y -= 18;
    drawText(page, `Kỳ tính: ${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`, { x: margin, y, size: 10, font });
    drawText(page, `SĐT: ${invoice.tenant.phone}`, { x: width / 2, y, size: 10, font });
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

    drawRow(`Tiền phòng (${daysInPeriod}/${daysInMonth} ngày)`, proRataRent);
    drawRow(`Điện: ${elecUnits} số x ${formatCurrency(invoice.electricityPrice)}`, elecUnits * invoice.electricityPrice);
    drawRow(`Nước: ${waterUnits} m3 x ${formatCurrency(invoice.waterPrice)}`, waterUnits * invoice.waterPrice);
    drawRow('Rác', invoice.garbageFee);
    if (invoice.otherFees > 0) drawRow(`Phí khác${invoice.otherNote ? ': ' + invoice.otherNote : ''}`, invoice.otherFees);

    y -= 5;
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 20;
    drawRow('TỔNG CỘNG', invoice.totalAmount, true);

    // Status
    y -= 5;
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
    y -= 20;
    const status = invoice.paid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN';
    const statusColor = invoice.paid ? rgb(0.1, 0.5, 0.1) : rgb(0.8, 0.1, 0.1);
    drawText(page, `Trạng thái: ${status}`, { x: margin, y, size: 11, font, color: statusColor });
    y -= 25;
    drawText(page, `Ngày lập: ${formatDate(invoice.createdAt)}`, { x: margin, y, size: 10, font, color: rgb(0.5, 0.5, 0.5) });
    y -= 35;

    const qrPayload = settings.paymentInfo?.trim();
    if (qrPayload) {
      const qrBytes = await generateQrPngBytes(qrPayload);
      const qrImage = await pdfDoc.embedPng(qrBytes);
      const qrSize = 130;
      const qrX = width - margin - qrSize;
      const qrY = y - qrSize;
      page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

      drawText(page, 'Quét mã QR để thanh toán', { x: margin, y: qrY + qrSize - 2, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
      drawText(page, 'Hoặc chuyển khoản theo thông tin bên dưới:', { x: margin, y: qrY - 14, size: 9, font, color: rgb(0.1, 0.1, 0.1) });
      const wrapped = qrPayload.split(/\r?\n/);
      let textY = qrY - 30;
      wrapped.forEach((line) => {
        drawText(page, line, { x: margin, y: textY, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        textY -= 12;
      });
    } else {
      drawText(page, 'Quý khách vui lòng chuyển khoản theo thông tin tài khoản đã cung cấp.', { x: margin, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=hoadon-${invoice.room.name}-${invoice.month}-${invoice.year}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) { next(err); }
};
