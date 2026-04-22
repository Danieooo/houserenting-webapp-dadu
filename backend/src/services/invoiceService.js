/**
 * Tính totalAmount của một hóa đơn
 * Tiền phòng: pro-rata theo ngày
 * Điện/Nước: theo chỉ số thực tế (không pro-rata)
 */
const calculateTotal = ({
  baseRent,
  electricityPrev,
  electricityNow,
  electricityPrice,
  waterPrev,
  waterNow,
  waterPrice,
  garbageFee,
  otherFees = 0,
  periodStart,
  periodEnd,
}) => {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  // Số ngày trong kỳ tính tiền
  const daysInPeriod = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // Số ngày trong tháng của periodStart
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();

  // Tiền phòng pro-rata
  const proRataRent = Math.round(baseRent * daysInPeriod / daysInMonth);

  // Tiền điện, nước
  const electricCost = (electricityNow - electricityPrev) * electricityPrice;
  const waterCost = (waterNow - waterPrev) * waterPrice;

  return proRataRent + electricCost + waterCost + garbageFee + Number(otherFees);
};

module.exports = { calculateTotal };
