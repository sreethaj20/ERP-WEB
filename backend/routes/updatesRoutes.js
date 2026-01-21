import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { createUpdateCtrl, deleteUpdateCtrl, listUpdates } from '../controllers/updatesController.js';

const router = Router();

router.get('/', auth(), listUpdates);
router.post('/', auth(), requireRole('admin', 'teamlead', 'manager', 'hr'), createUpdateCtrl);
router.delete('/:id', auth(), requireRole('admin', 'teamlead', 'manager', 'hr'), deleteUpdateCtrl);

export default router;
