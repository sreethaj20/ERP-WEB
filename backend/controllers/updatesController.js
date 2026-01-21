import { createUpdate, deleteUpdate, listAll } from '../models/updatesModel.js';

export async function listUpdates(req, res, next) {
  try {
    const rows = await listAll();
    return res.json(rows);
  } catch (e) {
    return next(e);
  }
}

export async function createUpdateCtrl(req, res, next) {
  try {
    const { title, message, date } = req.body || {};
    const createdBy = req.user?.email || null;
    const rec = await createUpdate({ title, message, date, createdBy });
    return res.status(201).json(rec);
  } catch (e) {
    return next(e);
  }
}

export async function deleteUpdateCtrl(req, res, next) {
  try {
    const { id } = req.params;
    await deleteUpdate(id);
    return res.json({ ok: true });
  } catch (e) {
    return next(e);
  }
}
