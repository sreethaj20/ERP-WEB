import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { listMyNotifications, createNotification, createNotificationSelf, deleteNotificationSelf, deleteNotification, markNotificationRead } from '../controllers/notificationController.js';

const router = Router();

router.get('/my', auth(), listMyNotifications);
router.post('/', auth(), requireRole('admin', 'teamlead', 'manager', 'hr'), createNotification);
router.post('/self', auth(), createNotificationSelf);
router.delete('/self/:id', auth(), deleteNotificationSelf);
router.delete('/:id', auth(), requireRole('admin', 'teamlead', 'manager'), deleteNotification);
router.post('/:id/read', auth(), markNotificationRead);

export default router;
