import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { listTasks, createTaskCtrl, updateTaskCtrl, deleteTaskCtrl } from '../controllers/taskController.js';
import { getById as getTaskById } from '../models/taskModel.js';

const router = Router();

router.get('/', auth(), listTasks);
router.post('/', auth(), requireRole('admin', 'teamlead', 'manager'), createTaskCtrl);

// Allow PATCH if user has elevated role OR is the task assignee
async function allowAssigneeOrRole(req, res, next) {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (['admin', 'teamlead', 'manager'].includes(role)) return next();
    const taskId = req.params.id;
    const task = await getTaskById(taskId);
    const me = String(req.user?.email || '').toLowerCase();
    if (task && String(task.assignedTo || '').toLowerCase() === me) return next();
    return res.status(403).json({ error: 'Forbidden' });
  } catch (e) {
    return next(e);
  }
}

router.patch('/:id', auth(), allowAssigneeOrRole, updateTaskCtrl);
router.delete('/:id', auth(), requireRole('admin', 'teamlead', 'manager'), deleteTaskCtrl);

export default router;
