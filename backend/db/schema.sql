-- PostgreSQL schema for ERP
-- Enable UUID extension (safe if already installed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee',
  first_name TEXT,
  last_name TEXT,
  department TEXT,
  designation TEXT,
  emp_id TEXT,
  date_of_joining DATE,
  team_lead_email TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now(),
  shift TEXT DEFAULT 'Morning'
);

-- ============================================================
-- LCRM Queries (IT Support, HR Query, Admin Query, Payroll)
-- ============================================================
CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,                 -- it | hr | admin | payroll
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',    -- open | in_progress | resolved | closed
  priority TEXT DEFAULT 'medium',         -- low | medium | high | urgent
  created_by_email TEXT NOT NULL,
  assigned_to_email TEXT,                 -- optional owner/assignee
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS query_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_query_messages_query
    FOREIGN KEY(query_id) REFERENCES queries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS query_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID NOT NULL,
  message_id UUID,                         -- optional: link to a specific message
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,                  -- if using object storage or public assets
  uploaded_by_email TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_query_attachments_query
    FOREIGN KEY(query_id) REFERENCES queries(id) ON DELETE CASCADE
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_queries_category_status ON queries (category, status);
CREATE INDEX IF NOT EXISTS idx_queries_assigned ON queries (assigned_to_email);
CREATE INDEX IF NOT EXISTS idx_query_messages_query ON query_messages (query_id);
CREATE INDEX IF NOT EXISTS idx_query_attachments_query ON query_attachments (query_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  audience TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RAG Reports
CREATE TABLE IF NOT EXISTS rag_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  status TEXT NOT NULL,
  comments TEXT,
  manager TEXT,
  month TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- One-on-One Reports
CREATE TABLE IF NOT EXISTS one_on_one_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  comments TEXT,
  manager TEXT,
  month TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Recruitment submissions
CREATE TABLE IF NOT EXISTS recruitment_subs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  college TEXT NOT NULL,
  qualification TEXT NOT NULL,
  company TEXT NOT NULL,
  submitted_by_email TEXT,
  submitted_by_name TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  signature TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS recruitment_candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emp_id TEXT UNIQUE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  contact_number TEXT,
  candidate_type TEXT DEFAULT 'fresher',
  created_by_email TEXT,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sequence for generating sequential Emp IDs (EMP-000001)
CREATE SEQUENCE IF NOT EXISTS recruitment_candidate_emp_id_seq;

CREATE INDEX IF NOT EXISTS idx_recruitment_candidates_created_at ON recruitment_candidates (created_at);

CREATE TABLE IF NOT EXISTS recruitment_candidate_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL,
  doc_type TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  s3_bucket TEXT,
  s3_key TEXT,
  url TEXT NOT NULL,
  uploaded_by_email TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_recruitment_candidate_documents_candidate
    FOREIGN KEY(candidate_id) REFERENCES recruitment_candidates(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recruitment_candidate_documents_candidate ON recruitment_candidate_documents (candidate_id, uploaded_at);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  hours NUMERIC(5,2) DEFAULT 0,
  CONSTRAINT attendance_unique UNIQUE (email, date)
);

-- Leaves
CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  type TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shift extension requests (Team Lead workflow)
CREATE TABLE IF NOT EXISTS shift_requests (
  id SERIAL PRIMARY KEY,
  employee_email TEXT NOT NULL,
  assigned_lead_email TEXT NOT NULL,
  shift_type TEXT,
  requested_minutes INTEGER DEFAULT 30,
  reason TEXT,
  status TEXT DEFAULT 'Pending', -- Pending | Approved | Rejected
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shift_requests_assigned ON shift_requests (assigned_lead_email, status);
CREATE INDEX IF NOT EXISTS idx_shift_requests_employee ON shift_requests (employee_email);
