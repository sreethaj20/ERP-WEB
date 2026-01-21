import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { listRecruitment, createRecruitment } from '../controllers/recruitmentController.js';
import recruitmentCandidateRoutes from './recruitmentCandidateRoutes.js';

const router = Router();

router.get('/', auth(), requireRole('admin', 'hr'), listRecruitment);
// Only HR can create recruitment submissions
router.post('/', auth(), requireRole('hr'), createRecruitment);

router.use('/candidates', recruitmentCandidateRoutes);

export default router;
