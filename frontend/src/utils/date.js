// src/utils/date.js

// Format a date-like input to dd-mm-yyyy for VIEW only.
// Accepts strings like YYYY-MM-DD, ISO strings, Date objects, or dd/mm/yyyy, dd-mm-yyyy.
export function formatDMY(input) {
  if (!input) return '-';
  try {
    // If string dd-mm-yyyy or dd/mm/yyyy, normalize to dd-mm-yyyy
    const s = String(input).trim();
    let d, m, y;
    let m1 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m1) {
      return `${m1[1]}-${m1[2]}-${m1[3]}`;
    }
    let m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m2) {
      return `${m2[1]}-${m2[2]}-${m2[3]}`;
    }
    // If YYYY-MM-DD
    let m3 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m3) {
      return `${m3[3]}-${m3[2]}-${m3[1]}`;
    }
    // Fallback: try Date parsing
    const dt = (input instanceof Date) ? input : new Date(s);
    if (isNaN(dt.getTime())) return '-';
    y = dt.getFullYear();
    m = String(dt.getMonth() + 1).padStart(2, '0');
    d = String(dt.getDate()).padStart(2, '0');
    return `${d}-${m}-${y}`;
  } catch {
    return '-';
  }
}
