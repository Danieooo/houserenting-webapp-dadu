const prisma = require('../config/db');

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({ where: { userId: req.user.id } });
    if (!settings) {
      settings = await prisma.settings.create({ data: { userId: req.user.id } });
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { shopName, address, phone, logoUrl, paymentInfo, webhookUrl } = req.body;
    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {
        ...(shopName !== undefined && { shopName }),
        ...(address !== undefined && { address }),
        ...(phone !== undefined && { phone }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(paymentInfo !== undefined && { paymentInfo }),
        ...(webhookUrl !== undefined && { webhookUrl }),
      },
      create: { userId: req.user.id, shopName, address, phone, logoUrl, paymentInfo, webhookUrl },
    });
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};
