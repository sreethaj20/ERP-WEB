import { pool } from '../utils/pg.js';

// Map DB row (login_extension_requests joined with users) -> API shape used by frontend
// DB columns: id, email, shift, requested_at, status, approver, approved_at, note, payload(jsonb), emp_id
const rowToApi = (r = {}) => {
  const payload = r.payload || {};
  const minutes = payload.requestedMinutes ?? payload.minutes ?? payload.requested_minutes ?? null;
  const reason = r.note || payload.reason || '';
  return {
    id: r.id,
    employeeId: r.emp_id || r.empid || null,
    employeeEmail: r.email,
    assignedLeadEmail: r.approver,
    shiftType: r.shift,
    requestedMinutes: minutes != null ? Number(minutes) : null,
    reason,
    status: r.status,
    createdAt: r.requested_at,
    updatedAt: r.approved_at || r.requested_at,
  };
};

export async function createShiftRequest({ employeeEmail, assignedLeadEmail, shiftType, requestedMinutes = 30, reason = '' }) {
  const email = String(employeeEmail || '').toLowerCase();
  const approver = String(assignedLeadEmail || '').toLowerCase();
  const shift = String(shiftType || '').toUpperCase();
  const mins = Number(requestedMinutes) || 30;
  const note = reason || '';
  const payload = { requestedMinutes: mins, reason: note };
  // Insert and then fetch with user join to include emp_id
  const ins = await pool.query(
    `INSERT INTO login_extension_requests (id, email, shift, requested_at, status, approver, approved_at, note, payload)
     VALUES (uuid_generate_v4(), $1, $2, NOW(), 'Pending', $3, NULL, $4, $5)
     RETURNING id`,
    [email, shift, approver, note, payload]
  );
  const newId = ins.rows?.[0]?.id;
  const sel = await pool.query(
    `SELECT ler.id, ler.email, ler.shift, ler.requested_at, ler.status, ler.approver, ler.approved_at, ler.note, ler.payload,
            u.emp_id
       FROM login_extension_requests ler
       LEFT JOIN users u ON LOWER(u.email) = LOWER(ler.email)
      WHERE ler.id = $1`,
    [newId]
  );
  return rowToApi(sel.rows[0] || {});
}

// Check if the employee has an approved extension for today
export async function isApprovedExtensionToday(employeeEmail) {
  const email = String(employeeEmail || '').toLowerCase();
  // Only consider the latest request for today to decide approval
  const { rows } = await pool.query(
    `SELECT status
       FROM login_extension_requests
      WHERE LOWER(email) = $1
        AND DATE(requested_at) = CURRENT_DATE
      ORDER BY requested_at DESC
      LIMIT 1`,
    [email]
  );
  if (!rows || rows.length === 0) return false;
  return String(rows[0].status || '').toLowerCase() === 'approved';
}

export async function listMyShiftRequests(employeeEmail) {
  const { rows } = await pool.query(
    `SELECT ler.id, ler.email, ler.shift, ler.requested_at, ler.status, ler.approver, ler.approved_at, ler.note, ler.payload,
            u.emp_id
       FROM login_extension_requests ler
       LEFT JOIN users u ON LOWER(u.email) = LOWER(ler.email)
      WHERE LOWER(ler.email) = LOWER($1)
      ORDER BY ler.requested_at DESC`,
    [String(employeeEmail||'').toLowerCase()]
  );
  return rows.map(rowToApi);
}

export async function listAssignedShiftRequests(leadEmail, { status } = {}) {
  const params = [String(leadEmail||'').toLowerCase()];
  let sql = `SELECT ler.id, ler.email, ler.shift, ler.requested_at, ler.status, ler.approver, ler.approved_at, ler.note, ler.payload,
                    u.emp_id
               FROM login_extension_requests ler
               LEFT JOIN users u ON LOWER(u.email) = LOWER(ler.email)
              WHERE LOWER(ler.approver) = LOWER($1)`;
  if (status) {
    sql += ` AND LOWER(ler.status) = LOWER($2)`;
    params.push(status);
  }
  sql += ` ORDER BY ler.requested_at DESC`;
  const { rows } = await pool.query(sql, params);
  return rows.map(rowToApi);
}

export async function updateShiftRequestStatus(id, leadEmail, status) {
  const lead = String(leadEmail||'').toLowerCase();
  const st = String(status||'');
  const upd = await pool.query(
    `UPDATE login_extension_requests
       SET status = CASE WHEN LOWER($3) IN ('approved','rejected','pending') THEN INITCAP($3) ELSE status END,
           approved_at = CASE WHEN LOWER($3) = 'approved' THEN NOW() ELSE approved_at END
     WHERE id = $2 AND LOWER(approver) = $1
     RETURNING id`,
    [lead, id, st]
  );
  if (upd.rowCount === 0) return null;
  const sel = await pool.query(
    `SELECT ler.id, ler.email, ler.shift, ler.requested_at, ler.status, ler.approver, ler.approved_at, ler.note, ler.payload,
            u.emp_id
       FROM login_extension_requests ler
       LEFT JOIN users u ON LOWER(u.email) = LOWER(ler.email)
      WHERE ler.id = $1`,
    [id]
  );
  return sel.rows[0] ? rowToApi(sel.rows[0]) : null;
}
