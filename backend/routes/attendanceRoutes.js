import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { markAttendance, getUserAttendance, getDateAttendance } from '../controllers/attendanceController.js';

const router = Router();

router.post('/', auth(), markAttendance);
router.get('/user/:email', auth(), getUserAttendance);
router.get('/date/:ymd', auth(), getDateAttendance);

export default router;
