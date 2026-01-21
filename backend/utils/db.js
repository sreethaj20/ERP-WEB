import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

const files = {
  users: 'users.json',
  attendance: 'attendance.json',
  leaves: 'leaves.json',
  tasks: 'tasks.json',
  notifications: 'notifications.json',
  // Added stores
  ragReports: 'ragReports.json',
  oneOnOneReports: 'oneOnOneReports.json',
  recruitmentSubs: 'recruitmentSubs.json',
};

function fpath(name) {
  ensureDir();
  return path.join(dataDir, files[name]);
}

async function read(name) {
  const fp = fpath(name);
  try {
    const txt = await fs.promises.readFile(fp, 'utf-8');
    try {
      return JSON.parse(txt || '[]');
    } catch (parseErr) {
      // Auto-heal: back up the corrupted file and reset to []
      try {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        await fs.promises.writeFile(`${fp}.bak-${stamp}`, txt, 'utf-8');
      } catch {}
      try {
        await fs.promises.writeFile(fp, '[]', 'utf-8');
      } catch {}
      return [];
    }
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function write(name, data) {
  const fp = fpath(name);
  await fs.promises.writeFile(fp, JSON.stringify(data, null, 2), 'utf-8');
}

// Simple in-process lock per file key
const locks = new Map();
async function withLock(name, fn) {
  const prev = locks.get(name) || Promise.resolve();
  let release;
  const current = new Promise((res) => (release = res));
  locks.set(name, prev.then(() => current));
  try {
    const result = await fn();
    return result;
  } finally {
    release();
    // cleanup chain
    if (locks.get(name) === current) locks.delete(name);
  }
}

export const db = {
  read,
  write,
  withLock,
};
