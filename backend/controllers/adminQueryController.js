import { listMyQueries, listAllForAdmin, createQuery, respondToQuery } from '../models/adminQueryModel.js';
import { addNotification } from '../models/notificationModel.js';

export async function listMyAdminQueriesCtrl(req, res, next) {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    const rows = await listMyQueries(email);
    res.json(rows);
  } catch (e) { next(e); }
}

export async function listAllAdminQueriesCtrl(_req, res, next) {
  try {
    const rows = await listAllForAdmin();
    res.json(rows);
  } catch (e) { next(e); }
}

export async function createAdminQueryCtrl(req, res, next) {
  try {
    const employeeEmail = String(req.user?.email || '').toLowerCase();
    const { category, subject, description, priority, adminEmail } = req.body || {};
    if (!subject || !description) return res.status(400).json({ error: 'subject and description are required' });

    const rec = await createQuery({ category, subject, description, priority, employeeEmail, assignedAdminEmail: adminEmail });

    try {
      await addNotification({
        title: 'Admin Query Submitted',
        message: `#${rec.id} submitted: ${rec.subject}`,
        type: 'info',
        link: '/employee/lcrm/admin-query',
        audience: `user:${employeeEmail}`,
      });
      if (adminEmail) {
        await addNotification({
          title: 'New Admin Query',
          message: `${employeeEmail} submitted #${rec.id}: ${rec.subject}`,
          type: 'info',
          link: '/admin/queries',
          audience: `user:${String(adminEmail).toLowerCase()}`,
        });
      }
    } catch {}

    res.status(201).json(rec);
  } catch (e) { next(e); }
}

export async function respondAdminQueryCtrl(req, res, next) {
  try {
    const adminEmail = String(req.user?.email || '').toLowerCase();
    const { id } = req.params;
    const { response, status } = req.body || {};
    const rec = await respondToQuery({ id, adminEmail, response, status });
    if (!rec) return res.status(404).json({ error: 'Not found' });

    try {
      await addNotification({
        title: 'Admin Query Updated',
        message: `Your admin query #${rec.id} has been updated`,
        type: 'info',
        link: '/employee/lcrm/admin-query',
        audience: `user:${String(rec.employeeEmail||'').toLowerCase()}`,
      });
    } catch {}

    res.json(rec);
  } catch (e) { next(e); }
}
