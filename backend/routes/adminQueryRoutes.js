import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { listMyAdminQueriesCtrl, listAllAdminQueriesCtrl, createAdminQueryCtrl, respondAdminQueryCtrl } from '../controllers/adminQueryController.js';

const router = Router();

// Employee: list own admin queries and create
router.get('/my', auth(), listMyAdminQueriesCtrl);
router.post('/', auth(), createAdminQueryCtrl);

// Admin: list all admin queries and respond
router.get('/', auth(), requireRole('admin'), listAllAdminQueriesCtrl);
router.patch('/:id', auth(), requireRole('admin'), respondAdminQueryCtrl);

export default router;
