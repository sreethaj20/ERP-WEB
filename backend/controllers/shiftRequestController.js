import { createShiftRequest, listMyShiftRequests, listAssignedShiftRequests, updateShiftRequestStatus } from '../models/shiftRequestModel.js';
import { findByEmail as findUserByEmail } from '../models/userModel.js';
import { addNotification } from '../models/notificationModel.js';

export async function createShiftRequestCtrl(req, res, next) {
  try {
    const employeeEmail = String((req.user && req.user.email) || req.body?.email || '').toLowerCase();
    const { assignedLeadEmail, shiftType, requestedMinutes = 30, reason = '' } = req.body || {};
    // Infer approver from request body, token, or user model fallback
    let approver = String(assignedLeadEmail || req.user?.teamLeadEmail || '').toLowerCase();
    if (!approver) {
      try {
        const u = await findUserByEmail(employeeEmail);
        approver = String(u?.teamLeadEmail || '').toLowerCase();
      } catch {}
    }
    if (!employeeEmail) {
      return res.status(400).json({ error: 'email required' });
    }
    if (!approver) {
      return res.status(400).json({ error: 'No team lead configured for employee' });
    }
    const rec = await createShiftRequest({
      employeeEmail,
      assignedLeadEmail: approver,
      shiftType,
      requestedMinutes,
      reason,
    });
    try {
      await addNotification({
        title: 'Shift extension requested',
        message: `${employeeEmail} requested ${requestedMinutes} min extension for ${shiftType || ''}`,
        type: 'info',
        link: '/teamlead/shift-extensions',
        audience: `user:${String(rec.assignedLeadEmail||'').toLowerCase()}`,
      });
    } catch {}
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

// Public endpoint: create shift extension without auth (used when login is blocked)
export async function createShiftRequestPublicCtrl(req, res, next) {
  try {
    const { email, shiftType, requestedMinutes = 30, reason = '' } = req.body || {};
    const employeeEmail = String(email || '').toLowerCase();
    if (!employeeEmail) return res.status(400).json({ error: 'email required' });
    let approverEmail = '';
    try {
      const user = await findUserByEmail(employeeEmail);
      approverEmail = String(user?.teamLeadEmail || '').toLowerCase();
    } catch {}
    if (!approverEmail) return res.status(400).json({ error: 'No team lead configured for employee' });
    const rec = await createShiftRequest({ employeeEmail, assignedLeadEmail: approverEmail, shiftType, requestedMinutes, reason });
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

export async function listMyShiftRequestsCtrl(req, res, next) {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    const rows = await listMyShiftRequests(email);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function listAssignedShiftRequestsCtrl(req, res, next) {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    const status = req.query?.status || undefined;
    const rows = await listAssignedShiftRequests(email, { status });
    res.json(rows);
  } catch (e) { next(e); }
}

export async function updateShiftRequestStatusCtrl(req, res, next) {
  try {
    const leadEmail = String(req.user?.email || '').toLowerCase();
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['approved','rejected','pending','Approved','Rejected','Pending'].includes(String(status))) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const rec = await updateShiftRequestStatus(id, leadEmail, status);
    if (!rec) return res.status(404).json({ error: 'Not found or not assigned to you' });
    try {
      await addNotification({
        title: 'Shift extension updated',
        message: `Your shift extension #${rec.id} was ${rec.status}`,
        type: 'info',
        link: '/late-login',
        audience: `user:${String(rec.employeeEmail||'').toLowerCase()}`,
      });
    } catch {}
    res.json(rec);
  } catch (e) { next(e); }
}
