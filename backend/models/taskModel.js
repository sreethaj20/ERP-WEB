import { query } from '../utils/pg.js';

// Ensure tasks table exists and is up-to-date
let ensured = false;
async function ensureTable() {
  if (ensured) return;
  // Create table if it doesn't exist. We do not assume id type (may already be UUID in some setups)
  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY DEFAULT substr(md5(random()::text), 1, 16),
      title TEXT NOT NULL
    );
  `);
  // Ensure expected columns exist
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to TEXT`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Open'`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by TEXT`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`);
  // UI fields
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium'`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category TEXT`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_by TEXT`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to_name TEXT`);
  await query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ`);
  // Align status default with UI ('pending') if column exists with different default
  try { await query(`ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'pending'`); } catch { /* ignore */ }
  // Indexes
  await query(`CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks (LOWER(assigned_to))`);
  await query(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)`);
  ensured = true;
}

function mapRow(r) {
  if (!r) return null;
  return {
    id: String(r.id),
    title: r.title || 'Task',
    description: r.description || '',
    assignedTo: (r.assigned_to || '').toLowerCase(),
    dueDate: r.due_date ? new Date(r.due_date).toISOString() : null,
    status: (r.status || 'pending'),
    createdBy: (r.created_by || ''),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    // UI fields
    priority: r.priority || 'medium',
    category: r.category || null,
    assignedBy: r.assigned_by || r.created_by || null,
    assignedToName: r.assigned_to_name || null,
    lastUpdated: r.last_updated ? new Date(r.last_updated).toISOString() : null,
  };
}

export async function listAll() {
  await ensureTable();
  const res = await query(`SELECT id, title, description, assigned_to, due_date, status, created_by, created_at, updated_at, priority, category, assigned_by, assigned_to_name, last_updated FROM tasks ORDER BY created_at DESC`);
  return res.rows.map(mapRow);
}

export async function getById(id) {
  await ensureTable();
  const res = await query(
    `SELECT id, title, description, assigned_to, due_date, status, created_by, created_at, updated_at
       FROM tasks
      WHERE id::text = $1`,
    [id]
  );
  return mapRow(res.rows[0]);
}

export async function listForUser(email) {
  await ensureTable();
  const e = String(email || '').toLowerCase();
  const res = await query(
    `SELECT id, title, description, assigned_to, due_date, status, created_by, created_at, updated_at, priority, category, assigned_by, assigned_to_name, last_updated
       FROM tasks
      WHERE LOWER(assigned_to) = $1
      ORDER BY created_at DESC`,
    [e]
  );
  return res.rows.map(mapRow);
}

export async function createTask({ title, description, assignedTo, dueDate, createdBy }) {
  await ensureTable();
  const t = title || 'Task';
  const d = description || '';
  const a = String(assignedTo || '').toLowerCase();
  const dd = dueDate ? String(dueDate).slice(0,10) : null;
  const cb = createdBy || null;
  const res = await query(
    `INSERT INTO tasks (title, description, assigned_to, due_date, status, created_by)
           VALUES ($1, $2, $3, $4::date, 'pending', $5)
        RETURNING id, title, description, assigned_to, due_date, status, created_by, created_at, updated_at, priority, category, assigned_by, assigned_to_name, last_updated`,
    [t, d, a, dd, cb]
  );
  return mapRow(res.rows[0]);
}

export async function updateTask(id, patch) {
  await ensureTable();
  const fields = [];
  const values = [];
  let idx = 1;
  if (patch.title !== undefined) { fields.push(`title = $${idx++}`); values.push(patch.title); }
  if (patch.description !== undefined) { fields.push(`description = $${idx++}`); values.push(patch.description); }
  if (patch.assignedTo !== undefined) { fields.push(`assigned_to = $${idx++}`); values.push(String(patch.assignedTo || '').toLowerCase()); }
  if (patch.dueDate !== undefined) { fields.push(`due_date = $${idx++}::date`); values.push(patch.dueDate ? String(patch.dueDate).slice(0,10) : null); }
  if (patch.status !== undefined) { fields.push(`status = $${idx++}`); values.push(String(patch.status || '').toLowerCase()); }
  if (patch.priority !== undefined) { fields.push(`priority = $${idx++}`); values.push(patch.priority); }
  if (patch.category !== undefined) { fields.push(`category = $${idx++}`); values.push(patch.category); }
  if (patch.assignedBy !== undefined) { fields.push(`assigned_by = $${idx++}`); values.push(patch.assignedBy); }
  if (patch.assignedToName !== undefined) { fields.push(`assigned_to_name = $${idx++}`); values.push(patch.assignedToName); }
  if (patch.lastUpdated !== undefined) { fields.push(`last_updated = $${idx++}::timestamptz`); values.push(patch.lastUpdated ? new Date(patch.lastUpdated).toISOString() : null); }
  fields.push(`updated_at = NOW()`);
  values.push(id);
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id::text = $${idx} RETURNING id, title, description, assigned_to, due_date, status, created_by, created_at, updated_at, priority, category, assigned_by, assigned_to_name, last_updated`;
  const res = await query(sql, values);
  if (!res.rows[0]) { const e = new Error('Task not found'); e.status = 404; throw e; }
  return mapRow(res.rows[0]);
}

export async function deleteTask(id) {
  await ensureTable();
  const res = await query(`DELETE FROM tasks WHERE id::text = $1 RETURNING id, title, description, assigned_to, due_date, status, created_by, created_at, updated_at, priority, category, assigned_by, assigned_to_name, last_updated`, [id]);
  if (!res.rows[0]) { const e = new Error('Task not found'); e.status = 404; throw e; }
  return mapRow(res.rows[0]);
}
