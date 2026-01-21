import { createLeave, listByEmail, updateLeave, listAll, deleteLeave, getById } from '../models/leaveModel.js';
import { addAnnualUsage, getAnnualRemaining } from '../models/leaveBalanceModel.js';
import { addNotification } from '../models/notificationModel.js';

export async function createLeaveReq(req, res, next) {
  try {
    const { from, to, type, reason, duration, partOfDay } = req.body || {};
    const email = req.user?.email;
    if (!email || !from || !to) return res.status(400).json({ error: 'from, to required', message: 'from, to required' });
    // Enforce monthly leave limit (count only Approved so submission isn't blocked)
    const toYMD = (d) => {
      try { return String(d).slice(0,10); } catch { return String(d || '').slice(0,10); }
    };
    const start = new Date(toYMD(from));
    const end = new Date(toYMD(to));
    const requestedDays = Math.max(1, Math.ceil((end - start) / (1000*60*60*24)) + 1);
    const month = start.getMonth();
    const year = start.getFullYear();
    const existing = await listByEmail(email);
    // Block duplicate half-day leave for the same date
    const isHalfDay = String(type || '').toLowerCase().replace(/\s+/g, '-') === 'half-day';
    if (isHalfDay) {
      const targetDate = toYMD(from);
      const alreadyHalfDay = (existing || []).some(r => {
        const rType = String(r.type || '').toLowerCase().replace(/\s+/g, '-');
        const sameDate = toYMD(r.from) === targetDate && toYMD(r.to) === targetDate;
        const isHalf = rType === 'half-day' || Number(r.duration) === 0.5;
        return sameDate && isHalf;
      });
      if (alreadyHalfDay) {
        return res.status(400).json({
          error: 'Duplicate half-day leave',
          message: 'Half-day leave has already been requested for this date.'
        });
      }
    }
    const usedThisMonth = (existing || [])
      .filter(r => {
        const d = new Date(toYMD(r.from));
        const status = String(r.status || '').toLowerCase();
        // Count only approved toward blocking calculation for creation
        const counts = status === 'approved';
        return counts && d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, r) => {
        const rs = new Date(toYMD(r.from)); const re = new Date(toYMD(r.to));
        // Respect duration if present (half-days)
        const days = (r.duration != null) ? Math.max(0.5, Number(r.duration)) : Math.max(1, Math.ceil((re - rs) / (1000*60*60*24)) + 1);
        return sum + days;
      }, 0);
    const MONTHLY_LIMIT = 1.5;

    // Strict monthly cap: block when monthly limit is reached or exceeded
    if (usedThisMonth >= MONTHLY_LIMIT) {
      return res.status(400).json({
        error: 'Monthly limit reached',
        message: 'Leaves for the month are completed.',
        limitDays: MONTHLY_LIMIT,
        usedDays: usedThisMonth
      });
    }

    // Retain annual remaining advisory logic (no block here since monthly check above handles cap)

    const rec = await createLeave({ email, from, to, type, reason, duration, partOfDay });
    const advisory = (usedThisMonth + requestedDays > MONTHLY_LIMIT)
      ? { advisory: 'Monthly leave limit exceeded; Team Lead/Admin review required.' }
      : {};
    res.status(201).json({ ...rec, ...advisory });
  } catch (e) { next(e); }
}

export async function listMyLeaves(req, res, next) {
  try {
    const email = req.user?.email;
    const rows = await listByEmail(email);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function listAllLeaves(_req, res, next) {
  try {
    const rows = await listAll();
    res.json(rows);
  } catch (e) { next(e); }
}

export async function reviewLeave(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const rawStatus = String(status || '').trim();
    const lowerStatus = rawStatus.toLowerCase();
    if (!['approved', 'rejected', 'pending'].includes(lowerStatus)) {
      return res.status(400).json({ error: `Invalid status ${rawStatus}` });
    }
    const serverStatus = lowerStatus === 'approved' ? 'Approved' : lowerStatus === 'rejected' ? 'Rejected' : 'Pending';
    const patch = { status: serverStatus, approverEmail: req.user?.email };
    // Fetch existing leave to compute month and days
    const before = await getById(id);
    const updated = await updateLeave(id, patch);

    // If approved, compute monthly usage and deduct from annual balance (hybrid):
    // 1) Always deduct full approved days from annual remaining
    // 2) Additionally show advisory if monthly cap (1.5) is exceeded after approval
    let advisory = {};
    if (lowerStatus === 'approved' && before) {
      const toYMD = (d) => String(d || '').slice(0,10);
      const start = new Date(toYMD(before.from));
      const end = new Date(toYMD(before.to));
      const computedDays = Math.max(1, Math.ceil((end - start) / (1000*60*60*24)) + 1);
      const thisDays = (before.duration != null) ? Math.max(0.5, Number(before.duration)) : computedDays;
      const month = start.getMonth();
      const year = start.getFullYear();

      const existing = await listByEmail(before.email);
      const approvedDaysThisMonth = (existing || [])
        .filter(r => {
          if (String(r.id) === String(id)) return false; // exclude this one (will add separately)
          const d = new Date(toYMD(r.from));
          return String(r.status || '').toLowerCase() === 'approved' && d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((sum, r) => {
          if (r.duration != null) return sum + Math.max(0.5, Number(r.duration));
          const rs = new Date(toYMD(r.from)); const re = new Date(toYMD(r.to));
          return sum + Math.max(1, Math.ceil((re - rs) / (1000*60*60*24)) + 1);
        }, 0);

      const MONTHLY_LIMIT = 1.5;
      const totalAfterApproval = approvedDaysThisMonth + thisDays;
      const overflow = Math.max(0, totalAfterApproval - MONTHLY_LIMIT);

      // Avoid double deduction if it was already approved before
      const beforeApproved = String(before.status || '').toLowerCase() === 'approved';
      if (!beforeApproved) {
        // Always deduct full days from annual balance on first approval
        const remainingBefore = await getAnnualRemaining(before.email, year);
        const toDeductAnnual = Math.min(thisDays, remainingBefore);
        if (toDeductAnnual > 0) {
          await addAnnualUsage(before.email, year, toDeductAnnual);
          advisory = { advisory: `Approved ${thisDays} day(s). Deducted ${toDeductAnnual} from annual balance.` };
        } else {
          advisory = { advisory: `Approved ${thisDays} day(s). No annual balance remaining to deduct.` };
        }
      }

      // Add cap warning if needed
      if (overflow > 0) {
        advisory = { ...advisory, capWarning: `Monthly cap exceeded by ${overflow} day(s).` };
      }
    }

    // Fire a user notification reflecting leave decision
    try {
      const toYMD = (d) => String(d || '').slice(0,10);
      const f = before ? toYMD(before.from) : undefined;
      const t = before ? toYMD(before.to) : undefined;
      const isHalf = (before && ((before.duration != null && Number(before.duration) === 0.5) || String(before.type || '').toLowerCase().includes('half') || !!before.partOfDay));
      const title = 'Leave request updated';
      const prettyType = isHalf ? 'Half-day leave' : (before?.type || 'Leave');
      const dateRange = (f && t) ? (f === t ? f : `${f} - ${t}`) : '';
      const msg = `${prettyType} ${dateRange ? `(${dateRange}) ` : ''}was ${lowerStatus}`;
      await addNotification({
        title,
        message: msg,
        type: 'info',
        link: '/leave-request',
        audience: `user:${String(before?.email || '').toLowerCase()}`,
      });
    } catch {}

    res.json({ ...updated, ...advisory });
  } catch (e) { next(e); }
}

export async function deleteLeaveReq(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await deleteLeave(id);
    res.json({ ok: true, deleted: removed });
  } catch (e) { next(e); }
}

// Get current user's annual leave balance for a year
export async function getMyLeaveBalance(req, res, next) {
  try {
    const email = req.user?.email;
    if (!email) return res.status(401).json({ error: 'Unauthorized' });
    const y = Number(req.query.year) || new Date().getFullYear();
    // Ensure a row exists and fetch values
    const remaining = await getAnnualRemaining(email, y);
    // Since getAnnualRemaining ensures row, query it back for totals
    const { getOrCreateBalance } = await import('../models/leaveBalanceModel.js');
    const bal = await getOrCreateBalance(email, y);
    res.json({
      year: y,
      annualAllowance: Number(bal.annual_allowance),
      usedAnnual: Number(bal.used_annual),
      remaining: Number(remaining)
    });
  } catch (e) { next(e); }
}
