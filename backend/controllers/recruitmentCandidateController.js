import archiver from 'archiver';
import { createCandidate, ensureCandidateEmpId, getCandidateById, listCandidates } from '../models/recruitmentCandidateModel.js';
import { addCandidateDocument, listCandidateDocuments } from '../models/recruitmentCandidateDocumentModel.js';
import { buildCandidateDocKey, getBucketName, getObjectStreamFromS3, uploadBufferToS3 } from '../utils/s3.js';

function safeZipFilename(name) {
  const base = String(name || 'candidate')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
  return base || 'candidate';
}

export async function listRecruitmentCandidates(req, res, next) {
  try {
    const limit = req.query?.limit;
    const offset = req.query?.offset;
    const rows = await listCandidates({ limit, offset });
    res.json(rows);
  } catch (e) {
    next(e);
  }
}

export async function createRecruitmentCandidate(req, res, next) {
  try {
    const { name, dateOfBirth, contactNumber, candidateType } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });

    const createdByEmail = req.user?.email || '';
    const createdByName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.username || createdByEmail;

    const out = await createCandidate({
      name,
      dateOfBirth: dateOfBirth || null,
      contactNumber,
      candidateType,
      createdByEmail,
      createdByName,
    });

    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

export async function getRecruitmentCandidate(req, res, next) {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const row = await getCandidateById(id);
    if (!row) return res.status(404).json({ error: 'Candidate not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function generateRecruitmentCandidateEmpId(req, res, next) {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const row = await ensureCandidateEmpId(id);
    if (!row) return res.status(404).json({ error: 'Candidate not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function listRecruitmentCandidateDocuments(req, res, next) {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    const row = await getCandidateById(id);
    if (!row) return res.status(404).json({ error: 'Candidate not found' });

    const docs = await listCandidateDocuments(id);
    res.json(docs);
  } catch (e) {
    next(e);
  }
}

export async function uploadRecruitmentCandidateDocument(req, res, next) {
  try {
    const candidateId = req.params?.id;
    if (!candidateId) return res.status(400).json({ error: 'id is required' });

    const candidate = await getCandidateById(candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const docType = (req.body?.docType || req.body?.type || '').toString().trim();
    if (!docType) return res.status(400).json({ error: 'docType is required' });

    const file = req.file;
    if (!file || !file.buffer) return res.status(400).json({ error: 'file is required' });

    const key = buildCandidateDocKey({
      candidateId,
      candidateName: candidate?.name,
      docType,
      originalName: file.originalname,
    });
    const bucket = getBucketName();

    const uploaded = await uploadBufferToS3({ key, body: file.buffer, contentType: file.mimetype });

    const uploadedByEmail = req.user?.email || '';

    const dbRow = await addCandidateDocument({
      candidateId,
      docType,
      fileName: file.originalname,
      mimeType: file.mimetype,
      s3Bucket: bucket,
      s3Key: uploaded.key,
      url: uploaded.url,
      uploadedByEmail,
    });

    res.status(201).json(dbRow);
  } catch (e) {
    next(e);
  }
}

export async function downloadRecruitmentCandidateDocumentsZip(req, res, next) {
  try {
    const id = req.params?.id;
    if (!id) return res.status(400).json({ error: 'id is required' });

    const candidate = await getCandidateById(id);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const docs = await listCandidateDocuments(id);
    if (!Array.isArray(docs) || docs.length === 0) return res.status(404).json({ error: 'No documents found' });

    const zipBase = `${safeZipFilename(candidate?.name)}-${String(candidate?.empId || candidate?.id || id).trim()}`;
    const zipName = `${zipBase}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('warning', (err) => {
      // ignore stat warnings, surface others
      if (err && err.code !== 'ENOENT') {
        throw err;
      }
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    const usedNames = new Map();
    const uniqName = (n) => {
      const key = String(n || 'file');
      const c = usedNames.get(key) || 0;
      usedNames.set(key, c + 1);
      if (c === 0) return key;
      const idx = key.lastIndexOf('.');
      if (idx > 0) return `${key.slice(0, idx)}_${c + 1}${key.slice(idx)}`;
      return `${key}_${c + 1}`;
    };

    for (const d of docs) {
      const s3Key = d?.s3Key;
      const bucket = d?.s3Bucket;
      if (!s3Key) continue;

      const stream = await getObjectStreamFromS3({ bucket, key: s3Key });
      if (!stream) continue;

      const safeType = String(d?.docType || 'document').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 64) || 'document';
      const safeFile = String(d?.fileName || 'file').trim().replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180) || 'file';
      const entry = uniqName(`${safeType}/${safeFile}`);
      archive.append(stream, { name: entry });
    }

    await archive.finalize();
  } catch (e) {
    next(e);
  }
}
