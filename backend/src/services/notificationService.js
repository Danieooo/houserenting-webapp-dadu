const prisma = require('../config/db');

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

exports.sendInvoiceWebhook = async (invoiceId, appUrl = 'http://localhost:5173') => {
  try {
    // Fetch invoice with room, tenant, and settings
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        room: true,
        tenant: true,
      },
    });

    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    const settings = await prisma.settings.findUnique({
      where: { userId: invoice.userId },
    });

    const webhookUrl = settings?.webhookUrl;
    if (!webhookUrl || webhookUrl.trim() === '') {
      console.log(`[Notification Service] No webhook URL configured for user ${invoice.userId}. Skipping.`);
      return { success: false, message: 'No webhook URL configured' };
    }

    const elecUsed = invoice.electricityNow - invoice.electricityPrev;
    const waterUsed = invoice.waterNow - invoice.waterPrev;
    const shopName = settings?.shopName || 'Nhà trọ';

    // Format the message
    const message = `🔔 **THÔNG BÁO TIỀN PHÒNG - ${invoice.room.name.toUpperCase()}** 🔔

Kính gửi anh/chị **${invoice.tenant.name}**,
Nhà trọ **${shopName}** xin thông báo tiền phòng tháng ${invoice.month}/${invoice.year} như sau:

- **Tiền phòng cơ bản:** ${formatCurrency(invoice.baseRent)}
- **Tiền điện:** ${elecUsed} kWh (${invoice.electricityPrev} → ${invoice.electricityNow}) × ${formatCurrency(invoice.electricityPrice)} = ${formatCurrency(elecUsed * invoice.electricityPrice)}
- **Tiền nước:** ${waterUsed} m³ (${invoice.waterPrev} → ${invoice.waterNow}) × ${formatCurrency(invoice.waterPrice)} = ${formatCurrency(waterUsed * invoice.waterPrice)}
- **Phí vệ sinh/rác:** ${formatCurrency(invoice.garbageFee)}
${invoice.otherFees > 0 ? `- **Phí khác (${invoice.otherNote || 'Không có'}):** ${formatCurrency(invoice.otherFees)}\n` : ''}
----------------------------------
💰 **TỔNG CỘNG:** **${formatCurrency(invoice.totalAmount)}**

*Quý khách vui lòng thanh toán bằng cách quét mã QR trên hóa đơn hoặc chuyển khoản theo thông tin:*
🏦 ${settings?.paymentInfo || 'Thông tin ngân hàng cấu hình trong Cài đặt'}

👉 **Xem hóa đơn chi tiết tại:** ${appUrl}/invoices/${invoice.id}`;

    console.log(`[Notification Service] Sending webhook to ${webhookUrl}...`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'invoice.notify',
        content: message, // For Discord
        text: message,    // For standard SMS/Telegram webhooks
        data: {
          invoiceId: invoice.id,
          roomName: invoice.room.name,
          tenantName: invoice.tenant.name,
          tenantPhone: invoice.tenant.phone,
          month: invoice.month,
          year: invoice.year,
          totalAmount: invoice.totalAmount,
          appUrl: `${appUrl}/invoices/${invoice.id}`,
          invoice,
          settings: {
            shopName: settings?.shopName,
            address: settings?.address,
            phone: settings?.phone,
            paymentInfo: settings?.paymentInfo,
          }
        }
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Webhook responded with status ${response.status}: ${responseText}`);
    }

    console.log('[Notification Service] ✅ Webhook delivered successfully!');
    return { success: true, message: 'Webhook sent successfully' };
  } catch (error) {
    console.error('[Notification Service] ❌ Error sending webhook:', error.message);
    throw error;
  }
};
