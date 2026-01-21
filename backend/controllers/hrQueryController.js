import { listMyQueries, listAssignedQueries, createQuery, respondToQuery } from '../models/hrQueryModel.js';
import { addNotification } from '../models/notificationModel.js';

export async function listMyHrQueriesCtrl(req, res, next) {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    const rows = await listMyQueries(email);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function createHrQueryCtrl(req, res, next) {
  try {
    const employeeEmail = String(req.user?.email || '').toLowerCase();
    const { category, subject, description, urgency, hrEmail } = req.body || {};
    if (!subject || !description || !hrEmail) {
      return res.status(400).json({ error: 'subject, description, hrEmail are required' });
    }
    const rec = await createQuery({ category, subject, description, urgency, employeeEmail, assignedHrEmail: hrEmail });
    try {
      await addNotification({
        title: 'HR Query Submitted',
        message: `#${rec.id} submitted: ${rec.subject}`,
        type: 'info',
        link: '/employee/lcrm/hr-query',
        audience: `user:${employeeEmail}`,
      });
      await addNotification({
        title: 'New HR Query Assigned',
        message: `${employeeEmail} submitted #${rec.id}: ${rec.subject}`,
        type: 'info',
        link: '/hr/lcrm',
        audience: `user:${String(hrEmail||'').toLowerCase()}`,
      });
    } catch {}
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

export async function listAssignedHrQueriesCtrl(req, res, next) {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    const rows = await listAssignedQueries(email);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function respondHrQueryCtrl(req, res, next) {
  try {
    const hrEmail = String(req.user?.email || '').toLowerCase();
    const { id } = req.params;
    const { response, status } = req.body || {};
    const rec = await respondToQuery({ id, hrEmail, response, status });
    if (!rec) return res.status(404).json({ error: 'Not found or not assigned to you' });
    try {
      await addNotification({
        title: 'HR Query Updated',
        message: `Your HR query #${rec.id} has been updated` ,
        type: 'info',
        link: '/employee/lcrm/hr-query',
        audience: `user:${String(rec.employeeEmail||'').toLowerCase()}`,
      });
    } catch {}
    res.json(rec);
  } catch (e) { next(e); }
}
