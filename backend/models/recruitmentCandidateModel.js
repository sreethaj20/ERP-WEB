import { pool } from '../utils/pg.js';

function rowToApi(r = {}) {
  return {
    id: r.id,
    empId: r.emp_id,
    name: r.name,
    dateOfBirth: r.date_of_birth ? new Date(r.date_of_birth).toISOString().slice(0, 10) : null,
    contactNumber: r.contact_number,
    candidateType: r.candidate_type,
    createdByEmail: r.created_by_email,
    createdByName: r.created_by_name,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
  };
}

export async function createCandidate({ name, dateOfBirth, contactNumber, candidateType, createdByEmail, createdByName }) {
  const { rows } = await pool.query(
    `INSERT INTO recruitment_candidates
      (name, date_of_birth, contact_number, candidate_type, created_by_email, created_by_name)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, emp_id, name, date_of_birth, contact_number, candidate_type, created_by_email, created_by_name, created_at`,
    [
      String(name || '').trim(),
      dateOfBirth || null,
      contactNumber ? String(contactNumber).trim() : null,
      (candidateType || 'fresher').toString().trim().toLowerCase(),
      createdByEmail ? String(createdByEmail).trim().toLowerCase() : null,
      createdByName ? String(createdByName).trim() : null,
    ]
  );
  return rowToApi(rows[0] || {});
}

export async function listCandidates({ limit = 100, offset = 0 } = {}) {
  const lim = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const off = Math.max(Number(offset) || 0, 0);

  const { rows } = await pool.query(
    `SELECT id, emp_id, name, date_of_birth, contact_number, candidate_type, created_by_email, created_by_name, created_at
     FROM recruitment_candidates
     ORDER BY created_at DESC NULLS LAST, id DESC
     LIMIT $1 OFFSET $2`,
    [lim, off]
  );
  return rows.map(rowToApi);
}

export async function getCandidateById(id) {
  const { rows } = await pool.query(
    `SELECT id, emp_id, name, date_of_birth, contact_number, candidate_type, created_by_email, created_by_name, created_at
     FROM recruitment_candidates
     WHERE id = $1
     LIMIT 1`,
    [id]
  );
  return rows && rows[0] ? rowToApi(rows[0]) : null;
}

export async function ensureCandidateEmpId(candidateId) {
  const id = String(candidateId || '').trim();
  if (!id) return null;

  // If emp_id already exists, return it
  const existing = await pool.query(
    'SELECT id, emp_id, name, date_of_birth, contact_number, candidate_type, created_by_email, created_by_name, created_at FROM recruitment_candidates WHERE id = $1 LIMIT 1',
    [id]
  );
  const row = existing.rows && existing.rows[0] ? existing.rows[0] : null;
  if (!row) return null;
  if (row.emp_id) return rowToApi(row);

  // Generate new sequential ID and store
  const seq = await pool.query("SELECT nextval('recruitment_candidate_emp_id_seq') as v");
  const v = seq.rows && seq.rows[0] ? Number(seq.rows[0].v) : null;
  const empId = `EMP-${String(v || 0).padStart(6, '0')}`;

  const updated = await pool.query(
    'UPDATE recruitment_candidates SET emp_id = $2 WHERE id = $1 AND emp_id IS NULL RETURNING id, emp_id, name, date_of_birth, contact_number, candidate_type, created_by_email, created_by_name, created_at',
    [id, empId]
  );
  if (updated.rows && updated.rows[0]) return rowToApi(updated.rows[0]);

  // If another request set it concurrently, re-read
  const reread = await pool.query(
    'SELECT id, emp_id, name, date_of_birth, contact_number, candidate_type, created_by_email, created_by_name, created_at FROM recruitment_candidates WHERE id = $1 LIMIT 1',
    [id]
  );
  return reread.rows && reread.rows[0] ? rowToApi(reread.rows[0]) : null;
}
