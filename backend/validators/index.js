// Lightweight validation library returning { ok: true, value } or { ok: false, field, message }

function ok(value) { return { ok: true, value }; }
function fail(field, message) { return { ok: false, field, message }; }
function isEmail(s) { return typeof s === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim()); }
function nonEmpty(s) { return typeof s === 'string' && s.trim().length > 0; }
function toYMD(s) {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0,10);
}

const auth = {
  login: (body = {}) => {
    const { email, password } = body;
    if (!isEmail(email)) return fail('email', 'invalid_email');
    if (!nonEmpty(password)) return fail('password', 'required');
    return ok({ email: String(email).trim().toLowerCase(), password: String(password) });
  },
  register: (body = {}) => {
    const { email, password, firstName, lastName, role, department, designation } = body;
    if (!isEmail(email)) return fail('email', 'invalid_email');
    if (!nonEmpty(password)) return fail('password', 'required');
    return ok({
      ...body,
      email: String(email).trim().toLowerCase(),
      firstName: (firstName || '').toString().trim(),
      lastName: (lastName || '').toString().trim(),
      role: (role || 'employee').toString().trim(),
      department: (department || '').toString().trim(),
      designation: (designation || '').toString().trim(),
    });
  }
};

const attendance = {
  mark: (body = {}) => {
    const email = (body.email || '').toString().trim().toLowerCase();
    const status = (body.status || '').toString().trim();
    const hours = (body.hours || '').toString().trim();
    if (!isEmail(email)) return fail('email', 'invalid_email');
    if (!['Present','present','Absent','absent','On Leave','on leave','Half Day','half day'].includes(status)) {
      return fail('status', 'invalid_status');
    }
    // Accept HH:MM or numeric hours
    if (!( /^\d{1,2}:\d{2}$/.test(hours) || /^\d+(\.\d+)?$/.test(hours) )) {
      return fail('hours', 'invalid_hours');
    }
    const date = toYMD(body.date || new Date());
    return ok({ email, status, hours, date });
  }
};

const leaves = {
  create: (body = {}) => {
    const from = toYMD(body.from);
    const to = toYMD(body.to);
    const type = (body.type || '').toString().trim();
    const reason = (body.reason || '').toString().trim();
    if (!from || !to) return fail('from', 'invalid_date_range');
    if (!type) return fail('type', 'required');
    if (!reason) return fail('reason', 'required');
    const out = { from, to, type, reason };
    if (body.duration != null) out.duration = Number(body.duration);
    if (body.partOfDay !== undefined) out.partOfDay = body.partOfDay;
    return ok(out);
  },
  review: (body = {}) => {
    const status = (body.status || '').toString().trim().toLowerCase();
    if (!['approved','rejected','pending'].includes(status)) return fail('status', 'invalid_status');
    return ok({ status });
  },
  idParam: (params = {}) => {
    const id = (params.id || '').toString().trim();
    if (!id) return fail('id', 'required');
    return ok({ id });
  }
};

const tasks = {
  create: (body = {}) => {
    const title = (body.title || '').toString().trim();
    if (!title) return fail('title', 'required');
    const assignedTo = (body.assignedTo || '').toString().trim().toLowerCase();
    if (assignedTo && !isEmail(assignedTo)) return fail('assignedTo', 'invalid_email');
    return ok({ ...body, title, assignedTo });
  },
  update: (body = {}) => {
    const patch = { ...body };
    if (patch.assignedTo) {
      const at = patch.assignedTo.toString().trim().toLowerCase();
      if (!isEmail(at)) return fail('assignedTo', 'invalid_email');
      patch.assignedTo = at;
    }
    return ok(patch);
  },
  idParam: (params = {}) => {
    const id = (params.id || '').toString().trim();
    if (!id) return fail('id', 'required');
    return ok({ id });
  }
};

const notifications = {
  create: (body = {}) => {
    const title = (body.title || '').toString().trim();
    const message = (body.message || '').toString().trim();
    if (!title) return fail('title', 'required');
    if (!message) return fail('message', 'required');
    return ok({ ...body, title, message });
  },
  idParam: (params = {}) => {
    const id = (params.id || '').toString().trim();
    if (!id) return fail('id', 'required');
    return ok({ id });
  }
};

export const validate = { auth, attendance, leaves, tasks, notifications };
export default { validate };
