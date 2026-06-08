function normalizeOptionalContact(value, fieldName) {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new TypeError(`${fieldName} must be a string`);
  }

  return value.trim();
}

function buildTenantContactPayload({ phone, zaloContact }) {
  return {
    phone: normalizeOptionalContact(phone, 'phone'),
    zaloContact: normalizeOptionalContact(zaloContact, 'zaloContact'),
  };
}

module.exports = {
  normalizeOptionalContact,
  buildTenantContactPayload,
};
