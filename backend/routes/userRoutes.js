import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { getMe, listUsers, listMyTeam, listHrDirectory, getUser, updateUserProfile } from '../controllers/userController.js';

const router = Router();

router.get('/me', auth(), getMe);
// Safe directory endpoint: any authenticated user can fetch HR names/emails for dropdowns
router.get('/hr-directory', auth(), listHrDirectory);
router.get('/', auth(), requireRole('admin'), listUsers);
router.get('/team', auth(), requireRole('teamlead','admin'), listMyTeam);
router.get('/:email', auth(), getUser); // admin or self checked in controller
router.patch('/:email', auth(), updateUserProfile); // admin or self checked in controller

export default router;
