import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { createLeaveReq, listMyLeaves, reviewLeave, listAllLeaves, deleteLeaveReq, getMyLeaveBalance } from '../controllers/leaveController.js';

const router = Router();

router.post('/', auth(), createLeaveReq);
router.get('/my', auth(), listMyLeaves);
router.get('/balance/my', auth(), getMyLeaveBalance);
router.get('/', auth(), requireRole('admin', 'teamlead', 'manager', 'hr'), listAllLeaves);
router.patch('/:id', auth(), requireRole('admin', 'teamlead', 'manager', 'hr'), reviewLeave);
router.delete('/:id', auth(), requireRole('admin', 'teamlead', 'manager', 'hr'), deleteLeaveReq);

export default router;
