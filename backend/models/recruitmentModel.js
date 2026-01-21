import { pool } from '../utils/pg.js';

// Helper: map DB row (snake_case) to API (camelCase)
function rowToApi(r = {}) {
  return {
    id: r.id,
    studentName: r.student_name,
    college: r.college,
    qualification: r.qualification,
    company: r.company,
    submittedByEmail: r.submitted_by_email,
    submittedByName: r.submitted_by_name,
    submittedAt: r.submitted_at ? new Date(r.submitted_at).toISOString() : null,
    signature: r.signature,
  };
}

export async function listAll() {
  // Read from Postgres table recruitment_subs
  const { rows } = await pool.query(
    `SELECT id, student_name, college, qualification, company, submitted_by_email, submitted_by_name, submitted_at, signature
     FROM recruitment_subs
     ORDER BY submitted_at DESC NULLS LAST, id DESC`
  );
  return rows.map(rowToApi);
}

export async function createSubmission({ studentName, college, qualification, company, submittedByEmail, submittedByName }) {
  const signature = `${(studentName||'').trim().toLowerCase()}|${(college||'').trim().toLowerCase()}|${(qualification||'').trim().toLowerCase()}|${(company||'').trim().toLowerCase()}`;

  // Try to find existing by signature to keep de-dup behavior even if DB has no constraint
  const existing = await pool.query(
    `SELECT id, student_name, college, qualification, company, submitted_by_email, submitted_by_name, submitted_at, signature
     FROM recruitment_subs
     WHERE signature = $1
     LIMIT 1`,
    [signature]
  );
  if (existing.rows && existing.rows.length) return rowToApi(existing.rows[0]);

  // Insert new record
  const now = new Date();
  const params = [
    studentName || '',
    college || '',
    qualification || '',
    company || '',
    String(submittedByEmail || '').toLowerCase(),
    submittedByName || '',
    signature,
    now,
  ];

  // If you have a unique index on signature, you can change to ON CONFLICT(signature) DO NOTHING RETURNING *
  const insertSql = `
    INSERT INTO recruitment_subs
      (student_name, college, qualification, company, submitted_by_email, submitted_by_name, signature, submitted_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, student_name, college, qualification, company, submitted_by_email, submitted_by_name, submitted_at, signature
  `;
  const { rows } = await pool.query(insertSql, params);
  return rowToApi(rows[0] || {});
}
