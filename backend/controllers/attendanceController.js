import { upsertAttendance, listByEmail, listByDate } from '../models/attendanceModel.js';
import { findByEmail } from '../models/userModel.js';

export async function markAttendance(req, res, next) {
  try {
    const { email, date, status, hours } = req.body || {};
    if (!email || !date || !status) return res.status(400).json({ error: 'email, date, status required' });
    // Helpers
    const parseYMD = (ymd) => {
      try {
        const [y, m, d] = String(ymd).slice(0, 10).split('-').map(Number);
        return new Date(y, (m || 1) - 1, d || 1);
      } catch { return new Date(ymd); }
    };
    const toYMD = (d) => {
      const dt = d instanceof Date ? d : parseYMD(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const dy = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${dy}`;
    };

    // Weekly off rule: designation-based
    // Developers/IT: Saturday (6) and Sunday (0) are weekly off
    // Others: Wednesday (3) is weekly off
    const dow = parseYMD(date).getDay();
    try {
      const user = await findByEmail(email);
      const desig = String(user?.designation || '').toLowerCase();
      const dept = String(user?.department || '').toLowerCase();
      const isDeveloperOrIT = desig === 'developer' || 
                             desig.includes('developer') || 
                             dept === 'it';
      const isWeekOff = isDeveloperOrIT ? (dow === 0 || dow === 6) : (dow === 3);
      if (isWeekOff) {
        const msg = isDeveloperOrIT ? 'Saturday/Sunday are weekly off' : 'Wednesday is weekly off';
        return res.status(400).json({ error: msg });
      }
    } catch {
      // If user lookup fails, fall back to legacy Wednesday rule to be safe
      if (dow === 3) return res.status(400).json({ error: 'Wednesday is weekly off' });
    }
    // Allow past dates and today (block future unless Leave)
    const ymdInput = toYMD(date);
    const ymdToday = toYMD(new Date());
    const isPastOrToday = ymdInput <= ymdToday;
    if (!isPastOrToday && String(status) !== 'Leave') {
      return res.status(400).json({ error: 'Only past dates or today allowed (except Leave)' });
    }

    // Persist as time string HH:MM (controller accepts number hours or time string)
    const toTimeString = (input) => {
      if (typeof input === 'string' && input.includes(':')) {
        // Assume already HH:MM or HH:MM:SS
        return input.length === 5 ? `${input}:00` : input;
      }
      const num = Number(input);
      if (!Number.isFinite(num) || num < 0) return '00:00:00';
      const totalMins = Math.round(num * 60); // convert fractional hours to minutes
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(h)}:${pad(m)}:00`;
    };

    const timeStr = String(status) === 'Present' ? toTimeString(hours) : '00:00:00';
    const rec = await upsertAttendance({ email, date, status, hours: timeStr });
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

export async function getUserAttendance(req, res, next) {
  try {
    const { email } = req.params;
    const rows = await listByEmail(email);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function getDateAttendance(req, res, next) {
  try {
    const { ymd } = req.params;
    const rows = await listByDate(ymd);
    res.json(rows);
  } catch (e) { next(e); }
}

