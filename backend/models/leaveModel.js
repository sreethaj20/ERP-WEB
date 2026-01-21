import { query } from '../utils/pg.js';

// Ensure the leaves table exists with needed columns
let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await query(`
    -- Create table if not exists (id type agnostic; use serial here only if new)
    CREATE TABLE IF NOT EXISTS leaves (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      from_date DATE NOT NULL,
      to_date DATE NOT NULL,
      type TEXT NOT NULL,
      reason TEXT,
      duration NUMERIC(4,2) DEFAULT 1.0,
      part_of_day TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    -- Bring existing table up to date
    ALTER TABLE leaves ADD COLUMN IF NOT EXISTS approver_email TEXT;
    ALTER TABLE leaves ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE leaves ADD COLUMN IF NOT EXISTS duration NUMERIC(4,2) DEFAULT 1.0;
    ALTER TABLE leaves ADD COLUMN IF NOT EXISTS part_of_day TEXT;
    -- Helpful indexes
    CREATE INDEX IF NOT EXISTS idx_leaves_email ON leaves (LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves (status);
    CREATE INDEX IF NOT EXISTS idx_leaves_from_date ON leaves (from_date);
  `);
  ensured = true;
}

// Check if the employee has an approved half-day leave for today
export async function isHalfDayApprovedToday(email) {
  await ensureTable();
  const e = String(email || '').toLowerCase();
  const res = await query(
    `SELECT 1
       FROM leaves
      WHERE LOWER(email) = $1
        AND LOWER(status) = 'approved'
        AND from_date = CURRENT_DATE
        AND to_date = CURRENT_DATE
        AND (
              LOWER(type) = 'half-day'
           OR  LOWER(type) = 'half day'
           OR  duration = 0.5
           OR  LOWER(COALESCE(part_of_day,'')) IN ('first-half','second-half','first half','second half')
        )
      LIMIT 1`,
    [e]
  );
  return res.rowCount > 0;
}

export async function getById(id) {
  await ensureTable();
  const res = await query(
    `SELECT id, email, from_date, to_date, type, reason, status, approver_email, created_at, updated_at
       FROM leaves WHERE id = $1`,
    [id]
  );
  if (!res.rows[0]) return null;
  return mapRow(res.rows[0]);
}

function toISODateString(d) {
  try {
    if (typeof d === 'string' && d.length >= 10) return d.slice(0,10) + 'T00:00:00.000Z';
    const dt = d instanceof Date ? d : new Date(d);
    return new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())).toISOString();
  } catch { return String(d || '').slice(0,10) + 'T00:00:00.000Z'; }
}

function mapRow(r) {
  if (!r) return null;
  const status = r.status || 'Pending';
  const capStatus = status.charAt(0).toUpperCase() + status.slice(1);
  const ymd = (x) => (x instanceof Date)
    ? `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`
    : String(x || '').slice(0,10);
  return {
    id: String(r.id),
    email: (r.email || '').toLowerCase(),
    from: toISODateString(r.from_date || r.from),
    to: toISODateString(r.to_date || r.to),
    type: r.type || 'Casual',
    reason: r.reason || '',
    duration: (r.duration != null ? Number(r.duration) : undefined),
    partOfDay: r.part_of_day || undefined,
    status: capStatus,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    approverEmail: r.approver_email || '',
  };
}

export async function listAll() {
  await ensureTable();
  const res = await query(`
    SELECT id, email, from_date, to_date, type, reason, duration, part_of_day, status, approver_email, created_at, updated_at
      FROM leaves
     ORDER BY from_date DESC, created_at DESC
  `);
  return res.rows.map(mapRow);
}

export async function listByEmail(email) {
  await ensureTable();
  const e = String(email || '').toLowerCase();
  const res = await query(
    `SELECT id, email, from_date, to_date, type, reason, duration, part_of_day, status, approver_email, created_at, updated_at
       FROM leaves
      WHERE LOWER(email) = $1
      ORDER BY from_date DESC, created_at DESC`,
    [e]
  );
  return res.rows.map(mapRow);
}

export async function createLeave({ email, from, to, type, reason, duration, partOfDay }) {
  await ensureTable();
  const e = String(email || '').toLowerCase();
  const f = String(from || '').slice(0,10);
  const t = String(to || '').slice(0,10);
  const ty = type || 'Casual';
  const rs = reason || '';
  // If duration provided use it; else compute inclusive days
  const days = (duration != null && !isNaN(Number(duration)))
    ? Math.max(0.5, Number(duration))
    : Math.max(1, Math.ceil((new Date(t) - new Date(f)) / (1000*60*60*24)) + 1);
  const pod = partOfDay || null;

  const res = await query(
    `INSERT INTO leaves (email, from_date, to_date, type, reason, duration, part_of_day, status)
           VALUES ($1, $2::date, $3::date, $4, $5, $6, $7, 'Pending')
        RETURNING id, email, from_date, to_date, type, reason, duration, part_of_day, status, approver_email, created_at, updated_at`,
    [e, f, t, ty, rs, days, pod]
  );
  return mapRow(res.rows[0]);
}

export async function updateLeave(id, patch) {
  await ensureTable();
  const fields = [];
  const values = [];
  let idx = 1;
  if (patch.status) { fields.push(`status = $${idx++}`); values.push(patch.status); }
  if (patch.approverEmail) { fields.push(`approver_email = $${idx++}`); values.push(patch.approverEmail); }
  if (patch.from) { fields.push(`from_date = $${idx++}::date`); values.push(String(patch.from).slice(0,10)); }
  if (patch.to) { fields.push(`to_date = $${idx++}::date`); values.push(String(patch.to).slice(0,10)); }
  if (patch.type) { fields.push(`type = $${idx++}`); values.push(patch.type); }
  if (patch.reason !== undefined) { fields.push(`reason = $${idx++}`); values.push(patch.reason); }
  if (patch.duration != null) { fields.push(`duration = $${idx++}`); values.push(Number(patch.duration)); }
  if (patch.partOfDay !== undefined) { fields.push(`part_of_day = $${idx++}`); values.push(patch.partOfDay || null); }
  fields.push(`updated_at = NOW()`);
  values.push(id);
  const sql = `UPDATE leaves SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, email, from_date, to_date, type, reason, duration, part_of_day, status, approver_email, created_at, updated_at`;
  const res = await query(sql, values);
  if (!res.rows[0]) { const err = new Error('Leave not found'); err.status = 404; throw err; }
  return mapRow(res.rows[0]);
}

export async function deleteLeave(id) {
  await ensureTable();
  const res = await query(`DELETE FROM leaves WHERE id = $1 RETURNING id, email, from_date, to_date, type, reason, duration, part_of_day, status, approver_email, created_at, updated_at`, [id]);
  if (!res.rows[0]) { const err = new Error('Leave not found'); err.status = 404; throw err; }
  return mapRow(res.rows[0]);
}
