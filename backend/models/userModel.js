import bcrypt from 'bcryptjs';
import { query } from '../utils/pg.js';

// Helper: map DB row (snake_case) to app user (camelCase)
function mapRow(row, includePassword = false) {
  if (!row) return null;
  const u = {
    id: row.id,
    email: (row.email || '').toLowerCase(),
    role: (row.role || 'employee').toLowerCase(),
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    department: row.department || '',
    designation: row.designation || '',
    empId: row.emp_id || row.id,
    dateOfJoining: row.date_of_joining || null,
    // New profile fields
    bloodGroup: row.blood_group || '',
    dateOfBirth: row.date_of_birth || null,
    coreEducation: row.core_education || '',
    teamLeadEmail: row.team_lead_email || '',
    // Shift fields
    shift: row.shift || 'MORNING',
    attendance: [], // attendance is stored separately
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
  if (includePassword) u.passwordHash = row.password_hash || '';
  return u;
}

// Minimal public directory entry (safe to expose to authenticated users)
function mapDirectoryRow(row) {
  if (!row) return null;
  return {
    email: (row.email || '').toLowerCase(),
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    designation: row.designation || '',
  };
}

export async function getAllUsers() {
  const res = await query(
    `SELECT id, email, role, first_name, last_name, department, designation,
            emp_id, date_of_joining, team_lead_email,
            blood_group, date_of_birth, core_education,
            shift, created_at
     FROM users
     ORDER BY created_at ASC`
  );
  return res.rows.map((r) => mapRow(r));
}

// HR directory for dropdowns (returns only minimal fields)
export async function listHRDirectory() {
  const res = await query(
    `SELECT email, first_name, last_name, designation
     FROM users
     WHERE LOWER(role) = 'hr'
        OR LOWER(COALESCE(designation,'')) LIKE '%hr%'
        OR LOWER(COALESCE(designation,'')) LIKE '%recruiter%'
     ORDER BY created_at ASC`
  );
  return res.rows.map((r) => mapDirectoryRow(r)).filter(Boolean);
}

export async function findByEmail(email) {
  const e = String(email || '').toLowerCase();
  const res = await query(
    `SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1`,
    [e]
  );
  if (res.rowCount === 0) return null;
  return mapRow(res.rows[0], true); // include passwordHash for auth
}

export async function createUser(data) {
  // Ensure unique email
  const e = String(data.email || '').toLowerCase();
  const exists = await query(`SELECT 1 FROM users WHERE LOWER(email) = $1`, [e]);
  if (exists.rowCount > 0) {
    const err = new Error('Email already exists');
    err.status = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(String(data.password || 'changeme'), 10);
  const role = (data.role || 'employee').toLowerCase();
  const res = await query(
    `INSERT INTO users (
        email, password_hash, role, first_name, last_name, department, designation,
        emp_id, date_of_joining, team_lead_email, blood_group, date_of_birth, core_education,
        shift
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id, email, role, first_name, last_name, department, designation,
               emp_id, date_of_joining, team_lead_email, blood_group, date_of_birth, core_education,
               shift, created_at`,
    [
      e,
      passwordHash,
      role,
      data.firstName || '',
      data.lastName || '',
      data.department || '',
      data.designation || '',
      data.empId || null,
      data.dateOfJoining || null,
      data.teamLeadEmail || '',
      data.bloodGroup || '',
      data.dateOfBirth || null,
      data.coreEducation || '',
      data.shift || 'MORNING',
    ]
  );
  const user = mapRow(res.rows[0]);
  return { ...user, passwordHash: undefined };
}

export async function updateUser(email, patch) {
  const e = String(email || '').toLowerCase();
  // Fetch current
  const cur = await query(`SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1`, [e]);
  if (cur.rowCount === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const c = cur.rows[0];
  const next = {
    first_name: patch.firstName ?? c.first_name,
    last_name: patch.lastName ?? c.last_name,
    department: patch.department ?? c.department,
    designation: patch.designation ?? c.designation,
    emp_id: patch.empId ?? c.emp_id,
    date_of_joining: patch.dateOfJoining ?? c.date_of_joining,
    team_lead_email: patch.teamLeadEmail ?? c.team_lead_email,
    blood_group: patch.bloodGroup ?? c.blood_group,
    date_of_birth: patch.dateOfBirth ?? c.date_of_birth,
    core_education: patch.coreEducation ?? c.core_education,
    role: (patch.role ?? c.role),
    status: patch.status ?? c.status,
    shift: patch.shift ?? c.shift,
  };

  const res = await query(
    `UPDATE users
       SET first_name = $1,
           last_name = $2,
           department = $3,
           designation = $4,
           emp_id = $5,
           date_of_joining = $6,
           team_lead_email = $7,
           blood_group = $8,
           date_of_birth = $9,
           core_education = $10,
           role = $11,
           status = $12,
           shift = $13
     WHERE LOWER(email) = $14
     RETURNING id, email, role, first_name, last_name, department, designation,
               emp_id, date_of_joining, team_lead_email,
               blood_group, date_of_birth, core_education,
               shift, created_at`,
    [
      next.first_name,
      next.last_name,
      next.department,
      next.designation,
      next.emp_id,
      next.date_of_joining,
      next.team_lead_email,
      next.blood_group,
      next.date_of_birth,
      next.core_education,
      String(next.role || 'employee').toLowerCase(),
      next.status || 'Active',
      next.shift || 'MORNING',
      e,
    ]
  );
  return mapRow(res.rows[0]);
}

export async function listByRole(role) {
  const r = String(role || '').toLowerCase();
  const res = await query(
    `SELECT id, email, role, first_name, last_name, department, designation, emp_id, date_of_joining, team_lead_email, created_at
     FROM users
     WHERE LOWER(role) = $1
     ORDER BY created_at ASC`,
    [r]
  );
  return res.rows.map((r) => mapRow(r));
}
