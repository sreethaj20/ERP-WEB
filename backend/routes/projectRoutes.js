import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { getMyProduction, getProductionForDate, upsertProductionCtrl } from '../controllers/projectController.js';

const router = Router();

// Employee endpoints
router.get('/my', auth(), getMyProduction);
router.post('/', auth(), upsertProductionCtrl);

// Admin/TL can read any user's production for a date
router.get('/user/:email/:ymd', auth(), requireRole('admin', 'teamlead', 'manager'), getProductionForDate);

export default router;
