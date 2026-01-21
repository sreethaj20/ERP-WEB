import { listAll, createSubmission } from '../models/recruitmentModel.js';
import { addNotification } from '../models/notificationModel.js';

export async function listRecruitment(req, res, next) {
  try {
    const rows = await listAll();
    res.json(rows);
  } catch (e) { next(e); }
}

export async function createRecruitment(req, res, next) {
  try {
    const { studentName, college, qualification, company } = req.body || {};
    const submittedByEmail = req.user?.email || '';
    const submittedByName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.username || submittedByEmail;
    if (!studentName || !college || !qualification || !company) {
      return res.status(400).json({ error: 'studentName, college, qualification, company are required' });
    }
    const rec = await createSubmission({ studentName, college, qualification, company, submittedByEmail, submittedByName });
    // Notify admin and HR
    try {
      const title = 'Recruitment Submission';
      const message = `${submittedByName || submittedByEmail} submitted ${studentName} (${qualification}) for ${company}`;
      const link = '/admin/hr-reports';
      await addNotification({ title, message, type: 'info', link, audience: 'role:admin' });
      await addNotification({ title, message, type: 'info', link, audience: 'role:hr' });
    } catch {}
    res.status(201).json(rec);
  } catch (e) { next(e); }
}
