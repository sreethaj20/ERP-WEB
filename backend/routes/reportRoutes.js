import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { overviewForDate, userMonthlySummary, listRagByMonth, createRagCtrl, listOneOnOneByMonth, createOneOnOneCtrl } from '../controllers/reportController.js';

const router = Router();

// Attendance summaries
router.get('/user/:email/month', auth(), userMonthlySummary);
router.get('/overview/:ymd', auth(), requireRole('admin', 'teamlead', 'manager', 'hr'), overviewForDate);
// RAG reports
router.get('/rag/:month', auth(), requireRole('admin', 'teamlead', 'manager'), listRagByMonth);
router.post('/rag', auth(), requireRole('admin', 'teamlead', 'manager'), createRagCtrl);
// One-on-One reports
router.get('/oneonone/:month', auth(), requireRole('admin', 'teamlead', 'manager'), listOneOnOneByMonth);
router.post('/oneonone', auth(), requireRole('admin', 'teamlead', 'manager'), createOneOnOneCtrl);

export default router;
