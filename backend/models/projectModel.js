import { db } from '../utils/db.js';
import { nanoid } from 'nanoid';

// We keep per-user daily production metrics in a separate collection
// Schema: { id, email, date, dailyTarget, completed, pending, efficiency, notes }
const FILE = 'projects';

export async function listAll() { return db.read(FILE); }

export async function listByEmail(email) {
  const all = await listAll();
  const e = String(email || '').toLowerCase();
  return all.filter(r => (r.email || '').toLowerCase() === e);
}

export async function getForDate(email, dateYMD) {
  const all = await listAll();
  const e = String(email || '').toLowerCase();
  const d = String(dateYMD || '').slice(0,10);
  return all.find(r => (r.email||'').toLowerCase() === e && (r.date||'').slice(0,10) === d) || null;
}

export async function upsertProduction({ email, date, dailyTarget = 0, completed = 0, pending = 0, efficiency = 0, notes = '' }) {
  return db.withLock(FILE, async () => {
    const all = await listAll();
    const e = String(email || '').toLowerCase();
    const d = String(date || '').slice(0,10);
    const idx = all.findIndex(r => (r.email||'').toLowerCase() === e && (r.date||'').slice(0,10) === d);
    const rec = {
      id: idx === -1 ? nanoid(10) : all[idx].id,
      email: e,
      date: new Date(date || Date.now()).toISOString(),
      dailyTarget: Number(dailyTarget) || 0,
      completed: Number(completed) || 0,
      pending: Number(pending) || 0,
      efficiency: Number(efficiency) || 0,
      notes: String(notes || ''),
      updatedAt: new Date().toISOString(),
    };
    if (idx === -1) all.push(rec); else all[idx] = rec;
    await db.write(FILE, all);
    return rec;
  });
}
