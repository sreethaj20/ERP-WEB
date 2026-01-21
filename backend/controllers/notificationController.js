import { addNotification, listAll, markRead, removeNotification } from '../models/notificationModel.js';

function isVisibleTo(n, user) {
  const audience = String(n.audience || 'all').toLowerCase();
  const email = (user?.email || '').toLowerCase();
  const role = (user?.role || '').toLowerCase();
  if (role === 'admin') return true; // admin can see everything
  if (audience === 'all') return true;
  if (audience === `user:${email}`) return true;
  if (audience === `role:${role}`) return true;
  return false;
}

// Allow users to delete only notifications targeted to themselves
export async function deleteNotificationSelf(req, res, next) {
  try {
    const { id } = req.params;
    const me = (req.user?.email || '').toLowerCase();
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const all = await listAll();
    const n = (all || []).find(x => x.id === id);
    if (!n) return res.status(204).end();
    const audience = String(n.audience || '').toLowerCase();
    if (audience !== `user:${me}`) {
      // Not owned by this user; treat as no-op to avoid noisy 403 in client
      return res.status(204).end();
    }
    await removeNotification(id);
    return res.status(204).end();
  } catch (e) { next(e); }
}

export async function listMyNotifications(req, res, next) {
  try {
    const all = await listAll();
    const me = req.user || {};
    const rows = Array.isArray(all) ? all : [];
    const filtered = rows.filter(n => {
      try { return isVisibleTo(n, me); } catch { return false; }
    });
    const email = String(me?.email || '').toLowerCase();
    const mapped = filtered.map(n => ({
      ...n,
      read: Array.isArray(n.readBy) ? n.readBy.includes(email) : false,
    }));
    res.json(mapped);
  } catch (e) { next(e); }
}

export async function createNotification(req, res, next) {
  try {
    const { title, message, type, link, audience } = req.body || {};
    const rec = await addNotification({ title, message, type, link, audience });
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

// Create a personal notification for the authenticated user regardless of role
export async function createNotificationSelf(req, res, next) {
  try {
    const { title, message, type, link } = req.body || {};
    const me = (req.user?.email || '').toLowerCase();
    if (!me) return res.status(401).json({ error: 'Unauthorized' });
    const audience = `user:${me}`;
    const rec = await addNotification({ title, message, type, link, audience });
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

export async function deleteNotification(req, res, next) {
  try {
    const { id } = req.params;
    try {
      const x = await removeNotification(id);
      res.json(x);
    } catch (e) {
      if (e && e.status === 404) return res.status(204).end();
      throw e;
    }
  } catch (e) { next(e); }
}

export async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    const n = await markRead(id, req.user?.email);
    const email = String(req.user?.email || '').toLowerCase();
    const withRead = { ...n, read: Array.isArray(n.readBy) ? n.readBy.includes(email) : false };
    res.json(withRead);
  } catch (e) { next(e); }
}
