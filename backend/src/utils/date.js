/**
 * Date and time helper functions
 */

export function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}

export function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isValidDate(d) ? d : null;
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isPast(date) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}
