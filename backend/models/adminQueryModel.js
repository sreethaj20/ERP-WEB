import { pool } from '../utils/pg.js';

function rowToApi(r = {}) {
  return {
    id: r.id,
    category: r.category,
    subject: r.subject,
    description: r.description,
    priority: r.priority,
    status: r.status,
    date: r.date ? r.date : null,
    employeeEmail: r.employee_email,
    assignedAdminEmail: r.assigned_admin_email,
    response: r.response,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
  };
}

export async function listMyQueries(employeeEmail) {
  const { rows } = await pool.query(
    `SELECT id, category, subject, description, priority, status, date, employee_email, assigned_admin_email, response, created_at, updated_at
     FROM admin_queries
     WHERE LOWER(employee_email) = LOWER($1)
     ORDER BY created_at DESC, id DESC`,
    [employeeEmail]
  );
  return rows.map(rowToApi);
}

export async function listAllForAdmin() {
  const { rows } = await pool.query(
    `SELECT id, category, subject, description, priority, status, date, employee_email, assigned_admin_email, response, created_at, updated_at
     FROM admin_queries
     ORDER BY created_at DESC, id DESC`
  );
  return rows.map(rowToApi);
}

export async function createQuery({ category, subject, description, priority, employeeEmail, assignedAdminEmail }) {
  const today = new Date();
  const ymd = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const params = [category || 'other', subject || '', description || '', priority || 'normal', 'submitted', ymd, String(employeeEmail||'').toLowerCase(), assignedAdminEmail ? String(assignedAdminEmail).toLowerCase() : null];
  const { rows } = await pool.query(
    `INSERT INTO admin_queries (category, subject, description, priority, status, date, employee_email, assigned_admin_email, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     RETURNING id, category, subject, description, priority, status, date, employee_email, assigned_admin_email, response, created_at, updated_at`,
    params
  );
  return rowToApi(rows[0] || {});
}

export async function respondToQuery({ id, adminEmail, response, status }) {
  const params = [response || '', status || 'in-progress', String(adminEmail||'').toLowerCase(), id];
  const { rows } = await pool.query(
    `UPDATE admin_queries
     SET response = $1, status = $2, assigned_admin_email = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id, category, subject, description, priority, status, date, employee_email, assigned_admin_email, response, created_at, updated_at`,
    params
  );
  return rows[0] ? rowToApi(rows[0]) : null;
}
