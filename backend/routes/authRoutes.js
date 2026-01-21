import { Router } from 'express';
import { auth } from '../middleware/auth.js';

import { login, register, me, logoutEnforced, logoutClear } from '../controllers/authController.js';
import ipFilter from '../middleware/ipFilter.js';

const router = Router();

router.post('/register', register);
//router.post('/login', login);
router.post('/login', ipFilter(), login);
router.get('/me', auth(), me);
// Enforced logout check: returns 200 OK if allowed, 403 if not
router.post('/logout', auth(), logoutEnforced);
// Immediate cookie clear (used on late-login rejection)
router.post('/logout-clear', logoutClear);

export default router;
