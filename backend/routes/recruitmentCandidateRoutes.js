import { Router } from 'express';
import multer from 'multer';
import { auth, requireRole } from '../middleware/auth.js';
import {
  createRecruitmentCandidate,
  downloadRecruitmentCandidateDocumentsZip,
  generateRecruitmentCandidateEmpId,
  getRecruitmentCandidate,
  listRecruitmentCandidateDocuments,
  listRecruitmentCandidates,
  uploadRecruitmentCandidateDocument,
} from '../controllers/recruitmentCandidateController.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.RECRUITMENT_UPLOAD_MAX_BYTES || 10 * 1024 * 1024),
  },
});

router.get('/', auth(), requireRole('admin', 'hr'), listRecruitmentCandidates);
router.post('/', auth(), requireRole('hr'), createRecruitmentCandidate);
router.get('/:id', auth(), requireRole('admin', 'hr'), getRecruitmentCandidate);
router.get('/:id/emp-id', auth(), requireRole('hr'), generateRecruitmentCandidateEmpId);
router.get('/:id/documents', auth(), requireRole('admin', 'hr'), listRecruitmentCandidateDocuments);
router.get('/:id/documents/zip', auth(), requireRole('admin', 'hr'), downloadRecruitmentCandidateDocumentsZip);
router.post('/:id/documents', auth(), requireRole('hr'), upload.single('file'), uploadRecruitmentCandidateDocument);

export default router;
