import { getAllUsers, findByEmail, updateUser, listHRDirectory } from '../models/userModel.js';

export async function getMe(req, res, next) {
  try {
    const email = (req.user?.email || '').toLowerCase();
    if (!email) return res.status(401).json({ error: 'Unauthorized' });
    const u = await findByEmail(email);
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json({ me: { ...u, passwordHash: undefined } });
  } catch (e) { next(e); }
}

export async function listUsers(_req, res, next) {
  try {
    const users = await getAllUsers();
    res.json(users.map(u => ({ ...u, passwordHash: undefined })));
  } catch (e) { next(e); }
}

export async function listMyTeam(req, res, next) {
  try {
    const caller = (req.user?.email || '').toLowerCase();
    const all = await getAllUsers();
    const team = all.filter(u => (u.teamLeadEmail || '').toLowerCase() === caller);
    res.json(team.map(u => ({ ...u, passwordHash: undefined })));
  } catch (e) { next(e); }
}

export async function listHrDirectory(_req, res, next) {
  try {
    const rows = await listHRDirectory();
    res.json(Array.isArray(rows) ? rows : []);
  } catch (e) { next(e); }
}

export async function getUser(req, res, next) {
  try {
    const { email } = req.params;
    const caller = (req.user?.email || '').toLowerCase();
    const isAdmin = (req.user?.role || '').toLowerCase() === 'admin';
    if (!isAdmin && caller !== String(email || '').toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const u = await findByEmail(email);
    if (!u) return res.status(404).json({ error: 'Not found' });
    res.json({ ...u, passwordHash: undefined });
  } catch (e) { next(e); }
}

export async function updateUserProfile(req, res, next) {
  try {
    const { email } = req.params;
    const caller = (req.user?.email || '').toLowerCase();
    const isAdmin = (req.user?.role || '').toLowerCase() === 'admin';
    if (!isAdmin && caller !== String(email || '').toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const patch = { ...req.body };
    delete patch.passwordHash;
    delete patch.email;
    const updated = await updateUser(email, patch);
    res.json(updated);
  } catch (e) { next(e); }
}
