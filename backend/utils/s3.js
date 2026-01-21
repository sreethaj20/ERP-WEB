import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

function getRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
}

function getBucket() {
  return process.env.AWS_S3_BUCKET;
}

function requireEnv(name, value) {
  if (!value) {
    const err = new Error(`${name} is required`);
    err.status = 500;
    throw err;
  }
}

function getClient() {
  const region = getRegion();
  requireEnv('AWS_REGION', region);
  return new S3Client({ region });
}

export function getBucketName() {
  const bucket = getBucket();
  requireEnv('AWS_S3_BUCKET', bucket);
  return bucket;
}

function normalizeBaseUrl(s) {
  const v = String(s || '').trim();
  if (!v) return '';
  return v.replace(/\/$/, '');
}

export function buildPublicUrl(key) {
  const base = normalizeBaseUrl(process.env.AWS_S3_PUBLIC_BASE_URL);
  if (base) return `${base}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;

  const region = getRegion();
  const bucket = getBucket();
  requireEnv('AWS_REGION', region);
  requireEnv('AWS_S3_BUCKET', bucket);
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
}

function sanitizeFilename(name) {
  return String(name || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 180);
}

function slugifyName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildCandidateDocKey({ candidateId, candidateName, docType, originalName }) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = sanitizeFilename(originalName);
  const safeDocType = String(docType || 'document').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 64);
  const safeCandidateId = String(candidateId || '').trim();
  const safeCandidateName = slugifyName(candidateName);
  const candidateFolder = safeCandidateName ? `${safeCandidateName}-${safeCandidateId}` : safeCandidateId;
  return `recruitment/candidates/${candidateFolder}/${safeDocType}/${ts}-${safeName}`;
}

export async function uploadBufferToS3({ key, body, contentType }) {
  const bucket = getBucket();
  requireEnv('AWS_S3_BUCKET', bucket);
  const client = getClient();

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType || 'application/octet-stream',
  });

  await client.send(cmd);

  return {
    bucket,
    key,
    url: buildPublicUrl(key),
  };
}

export async function getObjectStreamFromS3({ bucket, key }) {
  const b = bucket || getBucket();
  requireEnv('AWS_S3_BUCKET', b);
  const client = getClient();

  const cmd = new GetObjectCommand({
    Bucket: b,
    Key: String(key || '').trim(),
  });

  const out = await client.send(cmd);
  return out && out.Body ? out.Body : null;
}
