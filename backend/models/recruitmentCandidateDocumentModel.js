import { pool } from '../utils/pg.js';

function rowToApi(r = {}) {
  return {
    id: r.id,
    candidateId: r.candidate_id,
    docType: r.doc_type,
    fileName: r.file_name,
    mimeType: r.mime_type,
    s3Bucket: r.s3_bucket,
    s3Key: r.s3_key,
    url: r.url,
    uploadedByEmail: r.uploaded_by_email,
    uploadedAt: r.uploaded_at ? new Date(r.uploaded_at).toISOString() : null,
  };
}

export async function addCandidateDocument({ candidateId, docType, fileName, mimeType, s3Bucket, s3Key, url, uploadedByEmail }) {
  const { rows } = await pool.query(
    `INSERT INTO recruitment_candidate_documents
      (candidate_id, doc_type, file_name, mime_type, s3_bucket, s3_key, url, uploaded_by_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, candidate_id, doc_type, file_name, mime_type, s3_bucket, s3_key, url, uploaded_by_email, uploaded_at`,
    [
      candidateId,
      String(docType || '').trim().toLowerCase(),
      fileName ? String(fileName).trim() : null,
      mimeType ? String(mimeType).trim() : null,
      s3Bucket ? String(s3Bucket).trim() : null,
      s3Key ? String(s3Key).trim() : null,
      String(url || '').trim(),
      uploadedByEmail ? String(uploadedByEmail).trim().toLowerCase() : null,
    ]
  );
  return rowToApi(rows[0] || {});
}

export async function listCandidateDocuments(candidateId) {
  const { rows } = await pool.query(
    `SELECT id, candidate_id, doc_type, file_name, mime_type, s3_bucket, s3_key, url, uploaded_by_email, uploaded_at
     FROM recruitment_candidate_documents
     WHERE candidate_id = $1
     ORDER BY uploaded_at DESC NULLS LAST, id DESC`,
    [candidateId]
  );
  return rows.map(rowToApi);
}
