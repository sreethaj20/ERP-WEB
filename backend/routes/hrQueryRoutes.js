import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { listMyHrQueriesCtrl, listAssignedHrQueriesCtrl, createHrQueryCtrl, respondHrQueryCtrl } from '../controllers/hrQueryController.js';

const router = Router();

// Employee: list own queries, create new query
router.get('/my', auth(), listMyHrQueriesCtrl);
router.post('/', auth(), createHrQueryCtrl);

// HR/HRBP: respond/update a query assigned to them
router.get('/assigned', auth(), requireRole('hr', 'hrbp'), listAssignedHrQueriesCtrl);
router.patch('/:id', auth(), requireRole('hr', 'hrbp'), respondHrQueryCtrl);

export default router;
