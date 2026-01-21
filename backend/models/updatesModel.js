import { query } from '../utils/pg.js';

let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 16),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      date DATE NOT NULL,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_updates_date ON updates (date)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_updates_created_at ON updates (created_at)`);
  ensured = true;
}

function mapRow(r) {
  if (!r) return null;
  return {
    id: String(r.id),
    title: r.title || '',
    message: r.message || '',
    date: r.date ? String(r.date).slice(0, 10) : '',
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
    createdBy: r.created_by || '',
  };
}

export async function purgeOlderThan(days = 7) {
  await ensureTable();
  const d = Number(days);
  const safeDays = Number.isFinite(d) && d > 0 ? Math.floor(d) : 7;
  await query(`DELETE FROM updates WHERE created_at < (NOW() - ($1 * INTERVAL '1 day'))`, [safeDays]);
}

export async function listAll() {
  await ensureTable();
  const res = await query(
    `SELECT id, title, message, date, created_by, created_at
       FROM updates
      ORDER BY date DESC, created_at DESC`
  );
  return res.rows.map(mapRow);
}

export async function createUpdate({ title, message, date, createdBy }) {
  await ensureTable();
  const t = String(title || '').trim();
  const m = String(message || '').trim();
  const d = String(date || '').slice(0, 10);
  if (!t || !m || !d) {
    const e = new Error('title, message, date required');
    e.status = 400;
    throw e;
  }

  const cb = createdBy ? String(createdBy).toLowerCase() : null;
  const res = await query(
    `INSERT INTO updates (title, message, date, created_by)
           VALUES ($1, $2, $3::date, $4)
        RETURNING id, title, message, date, created_by, created_at`,
    [t, m, d, cb]
  );
  return mapRow(res.rows[0]);
}

export async function deleteUpdate(id) {
  await ensureTable();
  const res = await query(
    `DELETE FROM updates
      WHERE id::text = $1
  RETURNING id, title, message, date, created_by, created_at`,
    [id]
  );
  if (!res.rows[0]) {
    const e = new Error('Update not found');
    e.status = 404;
    throw e;
  }
  return mapRow(res.rows[0]);
}
