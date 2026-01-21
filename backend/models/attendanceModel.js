import { query } from '../utils/pg.js';

// Ensure the attendance table exists
let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      date DATE NOT NULL,
      status TEXT NOT NULL,
      hours TIME NOT NULL DEFAULT '08:00:00',
      login_time TIME NULL,
      logout_time TIME NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_attendance_email_date UNIQUE (email, date)
    );
  `);
  // If column exists as NUMERIC/INTEGER, convert to TIME once; ignore if already TIME
  try {
    await query(`ALTER TABLE attendance ALTER COLUMN hours TYPE TIME USING (hours * interval '1 hour')::time`);
  } catch {}
  // Ensure default is '08:00:00' and NOT NULL
  try { await query(`ALTER TABLE attendance ALTER COLUMN hours SET DEFAULT '08:00:00'::time`); } catch {}
  try { await query(`UPDATE attendance SET hours = '08:00:00'::time WHERE hours IS NULL`); } catch {}
  try { await query(`ALTER TABLE attendance ALTER COLUMN hours SET NOT NULL`); } catch {}
  // Ensure login/logout columns exist for older DBs
  try { await query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS login_time TIME NULL`); } catch {}
  try { await query(`ALTER TABLE attendance ADD COLUMN IF NOT EXISTS logout_time TIME NULL`); } catch {}
  await query(`CREATE INDEX IF NOT EXISTS idx_attendance_email ON attendance (LOWER(email))`);
  await query(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance (date)`);
  ensured = true;
}

function mapRow(r) {
  if (!r) return null;
  return {
    id: String(r.id),
    email: (r.email || '').toLowerCase(),
    // Keep date as local-friendly YYYY-MM-DD string to avoid timezone shifts on the client
    date: (r.date instanceof Date)
      ? `${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,'0')}-${String(r.date.getDate()).padStart(2,'0')}`
      : String(r.date || '').slice(0,10),
    status: r.status || 'Present',
    // Return HH:MM string for UI
    hours: r.hours ? String(r.hours).slice(0,5) : '00:00',
    loginTime: r.login_time ? String(r.login_time).slice(0,5) : null,
    logoutTime: r.logout_time ? String(r.logout_time).slice(0,5) : null,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function listAll() {
  await ensureTable();
  const res = await query(`SELECT id, email, date, status, hours, login_time, logout_time, updated_at FROM attendance ORDER BY date DESC, email ASC`);
  return res.rows.map(mapRow);
}

export async function listByEmail(email) {
  await ensureTable();
  const e = String(email || '').toLowerCase();
  const res = await query(
    `SELECT id, email, date, status, hours, login_time, logout_time, updated_at
       FROM attendance
      WHERE LOWER(email) = $1
      ORDER BY date DESC`,
    [e]
  );
  return res.rows.map(mapRow);
}

export async function listByDate(dateYMD) {
  await ensureTable();
  const d = String(dateYMD || '').slice(0,10);
  const res = await query(
    `SELECT id, email, date, status, hours, login_time, logout_time, updated_at
       FROM attendance
      WHERE date = $1::date
      ORDER BY LOWER(email) ASC`,
    [d]
  );
  return res.rows.map(mapRow);
}

export async function upsertAttendance({ email, date, status, hours }) {
  await ensureTable();
  const e = String(email || '').toLowerCase();
  const d = String(date || '').slice(0,10);
  const s = status || 'Present';
  // Accept hours as 'HH:MM' or 'HH:MM:SS' string; fallback to 00:00
  const timeStr = typeof hours === 'string' && hours.includes(':')
    ? (hours.length === 5 ? `${hours}:00` : hours)
    : '00:00:00';

  const res = await query(
    `INSERT INTO attendance (email, date, status, hours)
           VALUES ($1, $2::date, $3, $4::time)
      ON CONFLICT (email, date)
        DO UPDATE SET status = EXCLUDED.status,
                      hours = EXCLUDED.hours,
                      updated_at = NOW()
      RETURNING id, email, date, status, hours, login_time, logout_time, updated_at`,
    [e, d, s, timeStr]
  );
  return mapRow(res.rows[0]);
}

function toTimeStringOrNull(input) {
  if (!input) return null;
  if (typeof input === 'string' && input.includes(':')) {
    return input.length === 5 ? `${input}:00` : input;
  }
  return null;
}

export async function setLoginTime({ email, date, loginTime }) {
  await ensureTable();
  const e = String(email || '').toLowerCase();
  const d = String(date || '').slice(0, 10);
  const t = toTimeStringOrNull(loginTime);
  if (!e || !d || !t) return null;
  const res = await query(
    `INSERT INTO attendance (email, date, status, hours, login_time)
           VALUES ($1, $2::date, 'Present', '00:00:00'::time, $3::time)
      ON CONFLICT (email, date)
        DO UPDATE SET login_time = COALESCE(attendance.login_time, EXCLUDED.login_time),
                      updated_at = NOW()
      RETURNING id, email, date, status, hours, login_time, logout_time, updated_at`,
    [e, d, t]
  );
  return mapRow(res.rows[0]);
}

export async function setLogoutTime({ email, date, logoutTime }) {
  await ensureTable();
  const e = String(email || '').toLowerCase();
  const d = String(date || '').slice(0, 10);
  const t = toTimeStringOrNull(logoutTime);
  if (!e || !d || !t) return null;
  const res = await query(
    `INSERT INTO attendance (email, date, status, hours, logout_time)
           VALUES ($1, $2::date, 'Present', '00:00:00'::time, $3::time)
      ON CONFLICT (email, date)
        DO UPDATE SET logout_time = EXCLUDED.logout_time,
                      updated_at = NOW()
      RETURNING id, email, date, status, hours, login_time, logout_time, updated_at`,
    [e, d, t]
  );
  return mapRow(res.rows[0]);
}
