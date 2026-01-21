// backend/utils/shiftConfig.js
import { pool } from '../utils/pg.js';

/**
 * Simple cache of shifts loaded from DB.
 * Each entry shape:
 *  {
 *    shiftType: 'MORNING',
 *    displayName: 'Morning',
 *    startTime: '09:00',
 *    endTime: '18:00',
 *    bufferMinutes: 10
 *  }
 */
let SHIFTS_CACHE = {};

/**
 * Load all active shifts from DB into SHIFTS_CACHE
 */
export async function loadShiftConfigFromDB() {
  try {
    const q = `
      SELECT shift_key, display_name, start_time, end_time, COALESCE(buffer_minutes,0) AS buffer_minutes
      FROM shifts
      WHERE active = true
    `;
    const { rows } = await pool.query(q);
    const map = {};
    for (const r of rows) {
      if (!r.shift_key) continue;
      map[String(r.shift_key).toUpperCase()] = {
        shiftType: String(r.shift_key).toUpperCase(),
        displayName: r.display_name || r.shift_key,
        startTime: r.start_time,
        endTime: r.end_time,
        bufferMinutes: Number(r.buffer_minutes) || 0
      };
    }
    SHIFTS_CACHE = map;
    console.log('Shift config loaded:', Object.keys(SHIFTS_CACHE));
    return SHIFTS_CACHE;
  } catch (err) {
    console.error('Failed to load shifts from DB:', err?.message || err);
    return SHIFTS_CACHE;
  }
}

/**
 * Get shift by key from cache. Returns null if not found.
 * If you want always fresh value, call loadShiftConfigFromDB() before login (or on admin update).
 */
export function getShiftByKey(key) {
  if (!key) return null;
  return SHIFTS_CACHE[String(key).toUpperCase()] || null;
}

/**
 * Force refresh
 */
export async function refreshShiftConfig() {
  return loadShiftConfigFromDB();
}

export default {
  loadShiftConfigFromDB,
  getShiftByKey,
  refreshShiftConfig
};
