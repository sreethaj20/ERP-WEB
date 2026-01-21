import { createTask, deleteTask, listAll, listForUser, updateTask } from '../models/taskModel.js';
import { addNotification } from '../models/notificationModel.js';

export async function listTasks(req, res, next) {
  try {
    const { assignedTo } = req.query;
    if (assignedTo) {
      const rows = await listForUser(assignedTo);
      return res.json(rows);
    }
    const rows = await listAll();
    res.json(rows);
  } catch (e) { next(e); }
}

export async function createTaskCtrl(req, res, next) {
  try {
    const { title, description, assignedTo, dueDate } = req.body || {};
    const createdBy = req.user?.email;
    if (!title || !assignedTo) return res.status(400).json({ error: 'title, assignedTo required' });
    const rec = await createTask({ title, description, assignedTo, dueDate, createdBy });
    // Notify assignee
    await addNotification({
      title: 'Task Created',
      message: `${title} → ${assignedTo}`,
      type: 'success',
      audience: `user:${assignedTo.toLowerCase()}`,
      link: '/admin/task-management'
    });
    res.status(201).json(rec);
  } catch (e) { next(e); }
}

export async function updateTaskCtrl(req, res, next) {
  try {
    const { id } = req.params;
    const patch = { ...req.body };
    const updated = await updateTask(id, patch);
    // Notify assignee
    if (updated?.assignedTo) {
      await addNotification({
        title: 'Task Updated',
        message: `${updated.title}`,
        type: 'info',
        audience: `user:${updated.assignedTo.toLowerCase()}`,
        link: '/admin/task-management'
      });
    }
    res.json(updated);
  } catch (e) { next(e); }
}

export async function deleteTaskCtrl(req, res, next) {
  try {
    const { id } = req.params;
    const removed = await deleteTask(id);
    if (removed?.assignedTo) {
      await addNotification({
        title: 'Task Deleted',
        message: `Deleted task #${removed.id}`,
        type: 'warning',
        audience: `user:${removed.assignedTo.toLowerCase()}`,
        link: '/admin/task-management'
      });
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
}
