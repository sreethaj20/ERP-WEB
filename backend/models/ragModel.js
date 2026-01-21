import { pool } from '../utils/pg.js';

// Helper to map DB row to API shape
function rowToApi(r = {}) {
  return {
    id: r.id,
    email: r.email,
    status: r.status,
    comments: r.comments,
    manager: r.manager,
    month: r.month,
    submittedAt: r.submitted_at ? new Date(r.submitted_at).toISOString() : null,
  };
}

export async function listByMonth(month) {
  const m = String(month || '').slice(0, 7);
  const { rows } = await pool.query(
    `SELECT id, email, status, comments, manager, month, submitted_at
     FROM rag_reports
     WHERE month = $1
     ORDER BY submitted_at DESC NULLS LAST, id DESC`,
    [m]
  );
  return rows.map(rowToApi);
}

export async function createRag({ email, status, comments, manager, month }) {
  const m = (month && String(month).slice(0,7)) || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2,'0')}`;
  const params = [
    String(email || '').toLowerCase(),
    String(status || 'green').toLowerCase(),
    comments || '',
    String(manager || '').toLowerCase(),
    m,
    new Date(),
  ];
  const insertSql = `
    INSERT INTO rag_reports (email, status, comments, manager, month, submitted_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, status, comments, manager, month, submitted_at
  `;
  const { rows } = await pool.query(insertSql, params);
  return rowToApi(rows[0] || {});
}
