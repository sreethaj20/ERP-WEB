import { getAllUsers } from '../models/userModel.js';
import { listAll as listAttendance } from '../models/attendanceModel.js';
import { listByMonth as listRagByMonthModel, createRag } from '../models/ragModel.js';
import { listByMonth as listOOByMonthModel, createOneOnOne } from '../models/oneOnOneModel.js';
import { addNotification } from '../models/notificationModel.js';

const toYMD = (d) => new Date(d).toISOString().slice(0,10);

function countWorkingDaysExcludingWednesday(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, monthIndex, d).getDay();
    if (day !== 3) count++; // Wednesday off
  }
  return count;
}

// ===== RAG (Red/Amber/Green) monthly reports =====
export async function listRagByMonth(req, res, next) {
  try {
    const { month } = req.params; // YYYY-MM
    const m = (month || new Date().toISOString().slice(0,7)).slice(0,7);
    const rows = await listRagByMonthModel(m);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function createRagCtrl(req, res, next) {
  try {
    const { email, status, comments, month } = req.body || {};
    const manager = req.user?.email;
    if (!email || !status) return res.status(400).json({ error: 'email, status required' });
    const rec = await createRag({ email, status, comments, manager, month });
    // Notify admins
    try {
      await addNotification({
        title: 'RAG Submitted',
        message: `${manager || 'A manager'} submitted ${String(status).toUpperCase()} for ${email} (${(month||'').slice(0,7) || 'current month'})`,
        type: 'info',
        link: '/admin/teamlead-reports',
        audience: 'role:admin',
      });
    } catch {}
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

// ===== One-on-One monthly submissions =====
export async function listOneOnOneByMonth(req, res, next) {
  try {
    const { month } = req.params; // YYYY-MM
    const m = (month || new Date().toISOString().slice(0,7)).slice(0,7);
    const rows = await listOOByMonthModel(m);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function createOneOnOneCtrl(req, res, next) {
  try {
    const { email, comments, month } = req.body || {};
    const manager = req.user?.email;
    if (!email) return res.status(400).json({ error: 'email required' });
    const rec = await createOneOnOne({ email, comments, manager, month });
    // Notify admins
    try {
      await addNotification({
        title: '1:1 Submitted',
        message: `${manager || 'A manager'} submitted 1:1 for ${email} (${(month||'').slice(0,7) || 'current month'})`,
        type: 'info',
        link: '/admin/teamlead-reports',
        audience: 'role:admin',
      });
    } catch {}
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

export async function userMonthlySummary(req, res, next) {
  try {
    const { email } = req.params;
    const { month } = req.query; // YYYY-MM
    const m = month || new Date().toISOString().slice(0,7);
    const [y, mm] = m.split('-').map(Number);

    const all = await listAttendance();
    const rows = all.filter(a => (a.email||'').toLowerCase() === String(email||'').toLowerCase() && (a.date||'').startsWith(m));

    const present = rows.filter(r => r.status === 'Present').length;
    const leave = rows.filter(r => r.status === 'Leave').length;
    const hours = rows.reduce((s, r) => s + (Number(r.hours)||0), 0);
    const totalWorkingDays = countWorkingDaysExcludingWednesday(y, mm-1);
    const absent = Math.max(0, totalWorkingDays - present - leave);
    const attendanceRate = totalWorkingDays > 0 ? Math.round((present/totalWorkingDays)*100) : 0;

    res.json({ month: m, present, leave, absent, totalWorkingDays, attendanceRate, hours });
  } catch (e) { next(e); }
}

export async function overviewForDate(req, res, next) {
  try {
    const { ymd } = req.params; // YYYY-MM-DD
    const users = await getAllUsers();
    const all = await listAttendance();
    const map = new Map();
    all.filter(r => (r.date||'').slice(0,10) === ymd).forEach(r => {
      map.set((r.email||'').toLowerCase(), r);
    });
    const rows = users.map(u => {
      const rec = map.get((u.email||'').toLowerCase());
      const status = rec?.status || (toYMD(new Date()) > ymd ? 'Absent' : 'Not Marked');
      return { email: u.email, name: `${u.firstName||''} ${u.lastName||''}`.trim(), department: u.department || '', status, hours: rec?.hours || 0 };
    });
    res.json(rows);
  } catch (e) { next(e); }
}
