import { validate } from '../validators/index.js';

// Global request validator
// - Runs before routes
// - Matches method + path against a registry of validators
// - Returns 400 with details on first failure
export default function globalValidator(options = {}) {
  const registry = buildRegistry(options?.extra || {});
  return (req, res, next) => {
    try {
      const path = (req.path || req.originalUrl || '').toLowerCase();
      const method = String(req.method || 'GET').toUpperCase();
      const match = findValidator(registry, method, path);
      if (!match) return next();
      const { which, schema } = match;

      let target;
      if (which === 'body') target = (req.body || {});
      else if (which === 'query') target = (req.query || {});
      else {
        const params = (req.params || {});
        if (params && Object.keys(params).length) {
          target = params;
        } else {
          target = extractParamsFromPath(path);
        }
      }

      const result = schema(target);
      if (result?.ok) {
        // attach normalized values
        if (which === 'body') req.body = result.value;
        else if (which === 'query') req.query = result.value;
        else req.params = result.value;
        return next();
      }
      return res.status(400).json({ error: 'Validation failed', field: result?.field || null, message: result?.message || 'invalid_request' });
    } catch (e) {
      // Never fail the request pipeline on validator errors
      return next();
    }
  };
}

function extractParamsFromPath(path = '') {
  try {
    const parts = String(path || '').split('?')[0].split('/').filter(Boolean);
    if (!parts.length) return {};
    let id = parts[parts.length - 1] || '';
    if (id === 'read' && parts.length >= 2) id = parts[parts.length - 2] || '';
    return id ? { id } : {};
  } catch {
    return {};
  }
}

function buildRegistry(extra) {
  // Each entry: { method, test(path)->bool, which: 'body'|'query'|'params', schema }
  const r = [
    // Auth
    { method: 'POST', test: p => p.startsWith('/api/auth/login'), which: 'body', schema: validate.auth.login },
    { method: 'POST', test: p => p.startsWith('/api/auth/register'), which: 'body', schema: validate.auth.register },

    // Attendance
    { method: 'POST', test: p => p === '/api/attendance' || p.startsWith('/api/attendance'), which: 'body', schema: validate.attendance.mark },

    // Leaves
    { method: 'POST', test: p => p === '/api/leaves' || p.startsWith('/api/leaves'), which: 'body', schema: validate.leaves.create },
    { method: 'PATCH', test: p => p.startsWith('/api/leaves/'), which: 'body', schema: validate.leaves.review },
    { method: 'DELETE', test: p => p.startsWith('/api/leaves/'), which: 'params', schema: validate.leaves.idParam },

    // Tasks
    { method: 'POST', test: p => p === '/api/tasks' || p.startsWith('/api/tasks'), which: 'body', schema: validate.tasks.create },
    { method: 'PATCH', test: p => p.startsWith('/api/tasks/'), which: 'body', schema: validate.tasks.update },
    { method: 'DELETE', test: p => p.startsWith('/api/tasks/'), which: 'params', schema: validate.tasks.idParam },

    // Notifications
    { method: 'POST', test: p => p === '/api/notifications' || p === '/api/notifications/self', which: 'body', schema: validate.notifications.create },
    { method: 'POST', test: p => /\/api\/notifications\/[^/]+\/read$/.test(p), which: 'params', schema: validate.notifications.idParam },
    { method: 'DELETE', test: p => p.startsWith('/api/notifications/'), which: 'params', schema: validate.notifications.idParam },
  ];
  // Merge extras
  if (Array.isArray(extra)) r.push(...extra);
  return r;
}

function findValidator(registry, method, path) {
  for (const entry of registry) {
    if (entry.method !== method) continue;
    try { if (entry.test(path)) return entry; } catch {}
  }
  return null;
}
