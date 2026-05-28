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
    '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
    '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
  ];
  return candidates.find((p) => fs.existsSync(p));
};

const generateQrPngBytes = async (text) => {
  const dataUrl = await QRCode.toDataURL(text, { type: 'image/png', margin: 1, width: 250 });
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
};

const bankBinMap = {
  'MB': '970422', 'MBBANK': '970422', 'MILITARY': '970422', 'MILITARYBANK': '970422',
  'VCB': '970436', 'VIETCOMBANK': '970436',
  'VIETIN': '970415', 'VIETINBANK': '970415', 'CTG': '970415',
  'BIDV': '970418', 'BID': '970418',
  'AGRI': '970405', 'AGRIBANK': '970405', 'VARB': '970405',
  'TECH': '970407', 'TECHCOMBANK': '970407', 'TCB': '970407',
  'ACB': '970416',
  'VP': '970432', 'VPBANK': '970432',
  'TP': '970423', 'TPBANK': '970423',
  'SACOMBANK': '970403', 'STB': '970403',
  'HDBANK': '970437', 'HDB': '970437',
  'VIB': '970441',
  'SHB': '970443',
  'EXIM': '970431', 'EXIMBANK': '970431',
  'MSB': '970426',
  'OCB': '970448',
  'SEABANK': '970440', 'SEAB': '970440',
  'LPBANK': '970449', 'LP': '970449',
  'ABBANK': '970425', 'AB': '970425',
  'SHINHAN': '970424',
  'WOORI': '970457',
  'VIETBANK': '970433',
  'VAB': '970427', 'VIETABANK': '970427',
  'BVBANK': '970454', 'BVB': '970454', 'VIETCAPITAL': '970454',
  'SGB': '970400', 'SAIGONBANK': '970400',
  'SCB': '970429',
  'PGBANK': '970430', 'PGB': '970430',
  'PVCOMBANK': '970412', 'PVC': '970412',
  'KLB': '970452', 'KIENLONG': '970452', 'KIENLONGBANK': '970452',
  'BAOVIET': '970438', 'BVBANK': '970438',
  'NAMABANK': '970428', 'NAB': '970428',
  'LIENVIETPOSTBANK': '970449',
};

const parsePaymentInfo = (text) => {
  if (!text) return null;
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

  if (normalized.startsWith('000201') && normalized.includes('A000000727')) {
    return { isRawVietQR: true, rawString: text.trim() };
  }

  let bankBin = null;
  const tokens = normalized.split(/[^A-Z0-9]/).filter(t => t.length > 0);
  for (const token of tokens) {
    if (bankBinMap[token]) {
      bankBin = bankBinMap[token];
      break;
    }
  }

  if (!bankBin) {
    for (const key of Object.keys(bankBinMap)) {
      if (normalized.includes(key)) {
        bankBin = bankBinMap[key];
        break;
      }
    }
  }

  const digitMatches = normalized.match(/\d{6,19}/g);
  let accountNumber = null;
  if (digitMatches && digitMatches.length > 0) {
    const candidates = digitMatches.filter(num => num !== bankBin);
    if (candidates.length > 0) {
      accountNumber = candidates[0];
    } else {
      accountNumber = digitMatches[0];
    }
  }

  if (bankBin && accountNumber) {
    return { isRawVietQR: false, bankBin, accountNumber };
  }
  return null;
};

const buildVietQRString = (bankBin, accountNumber, amount, description) => {
  const formatTag = (id, value) => {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  };

  let qrStr = formatTag('00', '01');
  qrStr += formatTag('01', amount ? '12' : '11');

  const aidTag = formatTag('00', 'A000000727');
  const bankTag = formatTag('00', bankBin);
  const accountTag = formatTag('01', accountNumber);
  const consumerInfoValue = bankTag + accountTag;
  const consumerInfoTag = formatTag('01', consumerInfoValue);
  const serviceCodeTag = formatTag('02', 'QRIBFTTA');
  
  const merchantAccountValue = aidTag + consumerInfoTag + serviceCodeTag;
  qrStr += formatTag('38', merchantAccountValue);

  qrStr += formatTag('53', '704');

  if (amount && amount > 0) {
    qrStr += formatTag('54', amount.toString());
  }

  qrStr += formatTag('58', 'VN');

  if (description) {
    const normalizedDesc = description
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .substring(0, 25);
    const purposeTag = formatTag('08', normalizedDesc);
    qrStr += formatTag('62', purposeTag);
  }

  qrStr += '6304';

  let crc = 0xFFFF;
  const polynomial = 0x1021;
  for (let i = 0; i < qrStr.length; i++) {
    crc ^= (qrStr.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  return qrStr + crcHex;
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
      let finalQrPayload = qrPayload;
      try {
        const parsed = parsePaymentInfo(qrPayload);
        if (parsed) {
          if (parsed.isRawVietQR) {
            finalQrPayload = parsed.rawString;
          } else {
            const memo = `PHONG ${invoice.room.name.toUpperCase()} TT TIEN NHA T${invoice.month}`;
            finalQrPayload = buildVietQRString(parsed.bankBin, parsed.accountNumber, invoice.totalAmount, memo);
          }
        }
      } catch (err) {
        console.error('Error generating VietQR payload:', err);
      }

      const qrBytes = await generateQrPngBytes(finalQrPayload);
      const qrImage = await pdfDoc.embedPng(qrBytes);
      const qrSize = 130;
      
      // Căn giữa dòng chữ hướng dẫn quét mã
      const title1 = 'Quét mã QR để thanh toán';
      const title1W = font.widthOfTextAtSize(title1, 10);
      drawText(page, title1, { x: (width - title1W) / 2, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
      
      // Căn giữa hình ảnh mã QR
      const qrX = (width - qrSize) / 2;
      const qrY = y - qrSize - 12;
      page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

      // Căn giữa dòng chữ hướng dẫn chuyển khoản
      const title2 = 'Hoặc chuyển khoản theo thông tin bên dưới:';
      const title2W = font.widthOfTextAtSize(title2, 9);
      drawText(page, title2, { x: (width - title2W) / 2, y: qrY - 18, size: 9, font, color: rgb(0.1, 0.1, 0.1) });

      // Căn giữa từng dòng thông tin tài khoản chuyển khoản chi tiết
      const wrapped = qrPayload.split(/\r?\n/);
      let textY = qrY - 32;
      wrapped.forEach((line) => {
        const lineW = font.widthOfTextAtSize(line, 9);
        drawText(page, line, { x: (width - lineW) / 2, y: textY, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
        textY -= 12;
      });
    } else {
      const fallbackText = 'Quý khách vui lòng chuyển khoản theo thông tin tài khoản đã cung cấp.';
      const fallbackW = font.widthOfTextAtSize(fallbackText, 10);
      drawText(page, fallbackText, { x: (width - fallbackW) / 2, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=hoadon-${invoice.room.name}-${invoice.month}-${invoice.year}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) { next(err); }
};
