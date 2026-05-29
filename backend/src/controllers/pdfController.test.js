const assert = require('assert');
const { parsePaymentInfo, buildVietQRString } = require('./pdfController');

console.log('=== RUNNING VIETQR UNIT TESTS ===');

// --- Helper to verify specific tag is present inside the QR string ---
function getTagValue(qrStr, tagId) {
  let index = 0;
  while (index < qrStr.length) {
    if (index + 4 > qrStr.length) break;
    const id = qrStr.substring(index, index + 2);
    const len = parseInt(qrStr.substring(index + 2, index + 4), 10);
    const val = qrStr.substring(index + 4, index + 4 + len);
    if (id === tagId) {
      return val;
    }
    index += 4 + len;
  }
  return null;
}

// ==========================================
// 1. Test parsePaymentInfo
// ==========================================
console.log('Running tests for parsePaymentInfo...');

// Standard Raw VietQR String
const rawQR = '00020101021138580010A00000072701240006970436011012345678900208QRIBFTTA5204000053037045802VN6304ABCD';
const parseRaw = parsePaymentInfo(rawQR);
assert.ok(parseRaw, 'Should parse raw VietQR string');
assert.strictEqual(parseRaw.isRawVietQR, true);
assert.strictEqual(parseRaw.rawString, rawQR);

// Free text: Vietcombank
const parseFree1 = parsePaymentInfo('Vietcombank 1234567890 - Nguyen Van A');
assert.ok(parseFree1, 'Should parse Vietcombank text');
assert.strictEqual(parseFree1.isRawVietQR, false);
assert.strictEqual(parseFree1.bankBin, '970436');
assert.strictEqual(parseFree1.accountNumber, '1234567890');

// Free text: Techcombank lowercase, no dashes, extra spaces
const parseFree2 = parsePaymentInfo('   tcb    987654321098    chu tai khoan  ');
assert.ok(parseFree2, 'Should parse Techcombank lowercase');
assert.strictEqual(parseFree2.bankBin, '970407');
assert.strictEqual(parseFree2.accountNumber, '987654321098');

// Free text: MB Bank with some special characters
const parseFree3 = parsePaymentInfo('MB Bank#1122334455##');
assert.ok(parseFree3, 'Should parse MB Bank text');
assert.strictEqual(parseFree3.bankBin, '970422');
assert.strictEqual(parseFree3.accountNumber, '1122334455');

// Free text: Techcombank space-separated account number (User's actual details)
const parseFreeTechcom = parsePaymentInfo('Techcombank 1903 2559 1790 19 - VU HAI DANG');
assert.ok(parseFreeTechcom, 'Should parse space-separated Techcombank text');
assert.strictEqual(parseFreeTechcom.isRawVietQR, false);
assert.strictEqual(parseFreeTechcom.bankBin, '970407');
assert.strictEqual(parseFreeTechcom.accountNumber, '19032559179019');

// Invalid payment info
assert.strictEqual(parsePaymentInfo(null), null, 'Null should return null');
assert.strictEqual(parsePaymentInfo(''), null, 'Empty string should return null');
assert.strictEqual(parsePaymentInfo('Random text without bank and account'), null, 'No digits or bank should return null');

console.log('✓ parsePaymentInfo tests passed.');

// ==========================================
// 2. Test buildVietQRString
// ==========================================
console.log('Running tests for buildVietQRString...');

// Check dynamic Tag 01: Amount present -> Point of Initiation '12' (Dynamic)
const qrWithAmount = buildVietQRString('970436', '123456789', 3020000, 'Phong 301 TT');
assert.ok(qrWithAmount.startsWith('000201'), 'QR must start with 000201');
assert.strictEqual(getTagValue(qrWithAmount, '01'), '12', 'Point of Initiation must be 12 (Dynamic) when amount is present');

// Check dynamic Tag 01: No amount -> Point of Initiation '11' (Static)
const qrNoAmount = buildVietQRString('970436', '123456789', null, 'Phong 301 TT');
assert.strictEqual(getTagValue(qrNoAmount, '01'), '11', 'Point of Initiation must be 11 (Static) when no amount is present');

// Check Mandatory Tag 52: Merchant Category Code (0000)
assert.strictEqual(getTagValue(qrWithAmount, '52'), '0000', 'Merchant Category Code (Tag 52) must be 0000');

// Check Currency Tag 53: VND (704)
assert.strictEqual(getTagValue(qrWithAmount, '53'), '704', 'Currency Code (Tag 53) must be 704');

// Check Amount Tag 54 rounding
const qrFloatAmount = buildVietQRString('970436', '123456789', 15000.75, 'test');
assert.strictEqual(getTagValue(qrFloatAmount, '54'), '15001', 'Amount must be rounded to integer');

// Check Country Code Tag 58: VN
assert.strictEqual(getTagValue(qrWithAmount, '58'), 'VN', 'Country Code (Tag 58) must be VN');

// Check Merchant Name Tag 59: standard ASCII normalization
const qrMerchantName = buildVietQRString('970436', '123456789', 100, 'test', 'Nhà trọ Hoa Hồng! #99');
assert.strictEqual(getTagValue(qrMerchantName, '59'), 'NHA TRO HOA HONG 99', 'Merchant Name must be normalized to uppercase ASCII');

// Check Merchant City Tag 60: defaults to HA NOI
assert.strictEqual(getTagValue(qrWithAmount, '60'), 'HA NOI', 'Merchant City must default to HA NOI');

// Check Description Tag 62 sub-tag 08
const qrDescription = buildVietQRString('970436', '123456789', 5000, 'Phòng 301 - điện nước T5');
const tag62Val = getTagValue(qrDescription, '62');
assert.ok(tag62Val, 'Tag 62 must be present');
// Inside Tag 62, there must be sub-tag 08
assert.ok(tag62Val.startsWith('08'), 'Tag 62 value must start with sub-tag 08');
const memoVal = getTagValue(tag62Val, '08');
assert.strictEqual(memoVal, 'PHONG 301 DIEN NUOC T5', 'Memo description must be normalized ASCII uppercase');

// Check CRC-16 Checksum Tag 63 length and validity
assert.strictEqual(qrWithAmount.substring(qrWithAmount.length - 8, qrWithAmount.length - 4), '6304', 'CRC tag must be 6304');
const crcPart = qrWithAmount.substring(qrWithAmount.length - 4);
assert.ok(/^[0-9A-F]{4}$/.test(crcPart), 'CRC must be a 4-digit hexadecimal string');

console.log('✓ buildVietQRString tests passed.');
console.log('=== ALL VIETQR UNIT TESTS PASSED SUCCESSFULLY ===');
