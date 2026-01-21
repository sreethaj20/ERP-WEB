import { query } from '../utils/pg.js';

// Ensure notifications table exists in Postgres
let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 16),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      link TEXT,
      audience TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Add read_by array to track read receipts per user (email lowercased)
  await query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_by TEXT[]`);
  ensured = true;
}

function mapRow(r) {
  if (!r) return null;
  return {
    id: String(r.id),
    title: r.title || '',
    message: r.message || '',
    type: r.type || 'info',
    link: r.link || '',
    audience: (r.audience || 'all').toLowerCase(),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    readBy: Array.isArray(r.read_by) ? r.read_by : [],
  };
}

export async function listAll() {
  await ensureTable();
  const res = await query(`SELECT id, title, message, type, link, audience, created_at, read_by FROM notifications ORDER BY created_at DESC`);
  return res.rows.map(mapRow);
}

export async function addNotification({ title = '', message = '', type = 'info', link = '', audience = 'all' }) {
  await ensureTable();
  const a = String(audience || 'all').toLowerCase();
  const res = await query(
    `INSERT INTO notifications (title, message, type, link, audience, read_by)
           VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, title, message, type, link, audience, created_at, read_by`,
    [title, message, type || 'info', link || '', a, []]
  );
  return mapRow(res.rows[0]);
}

export async function removeNotification(id) {
  await ensureTable();
  const res = await query(
    `DELETE FROM notifications WHERE id::text = $1
      RETURNING id, title, message, type, link, audience, created_at, read_by`,
    [id]
  );
  if (!res.rows[0]) { const e = new Error('Not found'); e.status = 404; throw e; }
  return mapRow(res.rows[0]);
}

export async function markRead(id, email) {
  await ensureTable();
  const ekey = String(email || '').toLowerCase();
  const res = await query(
    `UPDATE notifications
        SET read_by = CASE
                         WHEN NOT $2 = ANY (COALESCE(read_by, '{}'))
                           THEN COALESCE(read_by, '{}') || $2
                         ELSE read_by
                       END
      WHERE id::text = $1
  RETURNING id, title, message, type, link, audience, created_at, read_by`,
    [id, ekey]
  );
  if (!res.rows[0]) { const e = new Error('Not found'); e.status = 404; throw e; }
  return mapRow(res.rows[0]);
}
