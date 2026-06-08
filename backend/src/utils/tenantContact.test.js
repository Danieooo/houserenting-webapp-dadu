const assert = require('assert');
const {
  normalizeOptionalContact,
  buildTenantContactPayload,
} = require('./tenantContact');

assert.strictEqual(normalizeOptionalContact(undefined), '');
assert.strictEqual(normalizeOptionalContact(null), '');
assert.strictEqual(normalizeOptionalContact('  0987654321  '), '0987654321');
assert.strictEqual(normalizeOptionalContact('  zalo me/tenant-a  '), 'zalo me/tenant-a');

assert.deepStrictEqual(
  buildTenantContactPayload({
    phone: '  ',
    zaloContact: ' zalo-user-01 ',
  }),
  {
    phone: '',
    zaloContact: 'zalo-user-01',
  }
);

assert.throws(
  () => buildTenantContactPayload({ phone: true }),
  (error) => error instanceof TypeError && error.message === 'phone must be a string',
);

assert.throws(
  () => buildTenantContactPayload({ zaloContact: { id: 'zalo-user-01' } }),
  (error) => error instanceof TypeError && error.message === 'zaloContact must be a string',
);

console.log('tenantContact utils: all assertions passed');
