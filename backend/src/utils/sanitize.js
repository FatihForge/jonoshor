/**
 * Sanitization utility for NoSQL injection prevention, XSS prevention, and DTO projection
 */

/**
 * Remove MongoDB operators ($gt, $where, etc.) from user input objects
 */
export function sanitizeMongoQuery(input) {
  if (!input || typeof input !== 'object') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeMongoQuery);
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(input)) {
    if (key.startsWith('$')) {
      continue; // Drop operators from untrusted input
    }
    cleaned[key] = sanitizeMongoQuery(value);
  }
  return cleaned;
}

/**
 * Escape HTML characters to prevent XSS
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Pick specified whitelist keys from an object (DTO projection)
 */
export function pick(obj, keys) {
  if (!obj) return {};
  const result = {};
  for (const key of keys) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specified blacklist keys from an object
 */
export function omit(obj, keys) {
  if (!obj) return {};
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}
