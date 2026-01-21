import { getForDate, listByEmail, upsertProduction } from '../models/projectModel.js';

const toYMD = (d) => new Date(d).toISOString().slice(0,10);

// Employee upserts their production metrics for a date (today allowed)
export async function upsertProductionCtrl(req, res, next) {
  try {
    const { date, dailyTarget, completed, notes } = req.body || {};
    const email = (req.user?.email || '').toLowerCase();
    if (!email || !date) return res.status(400).json({ error: 'date required' });
    const target = Number(dailyTarget) || 0;
    const done = Number(completed) || 0;
    const pending = Math.max(0, target - done);
    const efficiency = target > 0 ? Math.round((done / target) * 100) : 0;

    const rec = await upsertProduction({ email, date, dailyTarget: target, completed: done, pending, efficiency, notes });
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

export async function getMyProduction(req, res, next) {
  try {
    const email = (req.user?.email || '').toLowerCase();
    const rows = await listByEmail(email);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function getProductionForDate(req, res, next) {
  try {
    const email = String(req.params.email || '').toLowerCase();
    const { ymd } = req.params;
    const rec = await getForDate(email, ymd);
    res.json(rec || {});
  } catch (e) { next(e); }
}
