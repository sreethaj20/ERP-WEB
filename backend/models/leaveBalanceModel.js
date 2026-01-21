import { query } from '../utils/pg.js';

let ensured = false;
async function ensureTable() {
  if (ensured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS leave_balances (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      year INTEGER NOT NULL,
      annual_allowance NUMERIC(5,2) NOT NULL DEFAULT 18,
      used_annual NUMERIC(5,2) NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    -- Case-insensitive unique constraint via expression index
    CREATE UNIQUE INDEX IF NOT EXISTS uq_leave_balance_email_year_ci ON leave_balances (LOWER(email), year);
  `);
  ensured = true;
}

function normEmail(e) { return String(e || '').toLowerCase(); }

export async function getOrCreateBalance(email, year) {
  await ensureTable();
  const e = normEmail(email);
  const y = Number(year) || new Date().getFullYear();
  const sel = await query(`SELECT email, year, annual_allowance, used_annual FROM leave_balances WHERE LOWER(email) = $1 AND year = $2`, [e, y]);
  if (sel.rows[0]) return sel.rows[0];
  const ins = await query(`INSERT INTO leave_balances (email, year) VALUES ($1, $2) RETURNING email, year, annual_allowance, used_annual`, [e, y]);
  return ins.rows[0];
}

export async function addAnnualUsage(email, year, daysToUse) {
  await ensureTable();
  const e = normEmail(email);
  const y = Number(year) || new Date().getFullYear();
  const d = Math.max(0, Number(daysToUse) || 0);
  // Ensure row exists
  await getOrCreateBalance(e, y);
  const upd = await query(
    `UPDATE leave_balances
       SET used_annual = LEAST(annual_allowance, used_annual + $3),
           updated_at = NOW()
     WHERE LOWER(email) = $1 AND year = $2
     RETURNING email, year, annual_allowance, used_annual`,
    [e, y, d]
  );
  return upd.rows[0];
}

export async function getAnnualRemaining(email, year) {
  const bal = await getOrCreateBalance(email, year);
  const rem = Number(bal.annual_allowance) - Number(bal.used_annual);
  return rem < 0 ? 0 : rem;
}
