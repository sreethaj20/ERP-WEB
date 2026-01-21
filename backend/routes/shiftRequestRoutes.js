import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { createShiftRequestCtrl, listMyShiftRequestsCtrl, listAssignedShiftRequestsCtrl, updateShiftRequestStatusCtrl, createShiftRequestPublicCtrl } from '../controllers/shiftRequestController.js';

const router = Router();

// Employee: create and list own shift extension requests
router.post('/', auth(), createShiftRequestCtrl);
router.get('/my', auth(), listMyShiftRequestsCtrl);

// Public (no auth): allow creation when login is blocked by shift middleware
router.post('/public', createShiftRequestPublicCtrl);

// Team lead: list assigned and approve/reject
router.get('/assigned', auth(), requireRole('teamlead', 'manager', 'admin'), listAssignedShiftRequestsCtrl);
router.patch('/:id', auth(), requireRole('teamlead', 'manager', 'admin'), updateShiftRequestStatusCtrl);

export default router;
