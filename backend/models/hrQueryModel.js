import { pool } from '../utils/pg.js';

// Map DB row to API shape
function rowToApi(r = {}) {
  return {
    id: r.id,
    category: r.category,
    subject: r.subject,
    description: r.description,
    urgency: r.urgency,
    status: r.status,
    date: r.date ? new Date(r.date).toISOString().slice(0,10) : null,
    employeeEmail: r.employee_email,
    assignedHrEmail: r.assigned_hr_email,
    response: r.response,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
  };
}

export async function listMyQueries(employeeEmail) {
  const { rows } = await pool.query(
    `SELECT id, category, subject, description, urgency, status, date, employee_email, assigned_hr_email, response, created_at, updated_at
     FROM hr_queries
     WHERE LOWER(employee_email) = LOWER($1)
     ORDER BY created_at DESC, id DESC`,
    [employeeEmail]
  );
  return rows.map(rowToApi);
}

export async function listAssignedQueries(hrEmail) {
  const { rows } = await pool.query(
    `SELECT id, category, subject, description, urgency, status, date, employee_email, assigned_hr_email, response, created_at, updated_at
     FROM hr_queries
     WHERE LOWER(assigned_hr_email) = LOWER($1)
     ORDER BY created_at DESC, id DESC`,
    [hrEmail]
  );
  return rows.map(rowToApi);
}

export async function createQuery({ category, subject, description, urgency, employeeEmail, assignedHrEmail }) {
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const params = [category || 'other', subject || '', description || '', urgency || 'normal', String(employeeEmail||'').toLowerCase(), String(assignedHrEmail||'').toLowerCase(), ymd];
  const { rows } = await pool.query(
    `INSERT INTO hr_queries (category, subject, description, urgency, status, date, employee_email, assigned_hr_email, created_at, updated_at)
     VALUES ($1, $2, $3, $4, 'submitted', $7, $5, $6, NOW(), NOW())
     RETURNING id, category, subject, description, urgency, status, date, employee_email, assigned_hr_email, response, created_at, updated_at`,
    params
  );
  return rowToApi(rows[0] || {});
}

export async function respondToQuery({ id, hrEmail, response, status }) {
  const params = [String(hrEmail||'').toLowerCase(), response || '', status || 'in-progress', id];
  const { rows } = await pool.query(
    `UPDATE hr_queries
     SET response = $2, status = $3, updated_at = NOW()
     WHERE id = $4 AND LOWER(assigned_hr_email) = $1
     RETURNING id, category, subject, description, urgency, status, date, employee_email, assigned_hr_email, response, created_at, updated_at`,
    params
  );
  if (!rows.length) return null;
  return rowToApi(rows[0]);
}
