-- ============================================================================
-- MedAI-CV — Hospital Clinical Workflow & RBAC Database Schema
-- SQLite3 Engine
-- ============================================================================

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,           -- 'doctor', 'admin', 'operator'
  name TEXT NOT NULL,                  -- 'Dokter Radiolog', etc.
  department TEXT NOT NULL,
  default_user_name TEXT NOT NULL,
  summary TEXT NOT NULL
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role_code TEXT NOT NULL,
  employee_id TEXT UNIQUE NOT NULL,
  workstation TEXT,
  FOREIGN KEY (role_code) REFERENCES roles(code)
);

-- 3. ROLE MENU PERMISSIONS
CREATE TABLE IF NOT EXISTS role_menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_code TEXT NOT NULL,
  menu_id TEXT NOT NULL,               -- e.g. 'menu-worklist', 'menu-pacs'
  menu_name TEXT NOT NULL,
  can_access INTEGER DEFAULT 1,
  FOREIGN KEY (role_code) REFERENCES roles(code)
);

-- 4. WORKFLOW STATES
CREATE TABLE IF NOT EXISTS workflow_states (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,           -- 'ingestion', 'inference', 'review', 'verified'
  label TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  description TEXT
);

-- 5. CLINICAL STUDIES
CREATE TABLE IF NOT EXISTS studies (
  id TEXT PRIMARY KEY,                 -- 'STD-2026-9041'
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  medical_record_no TEXT NOT NULL,
  modality TEXT NOT NULL,              -- 'CT-Thorax', 'Brain MRI', etc.
  ai_finding TEXT NOT NULL,
  confidence_pct REAL NOT NULL,
  state_code TEXT NOT NULL,
  created_time TEXT NOT NULL,
  assigned_doctor_id INTEGER,
  FOREIGN KEY (state_code) REFERENCES workflow_states(code),
  FOREIGN KEY (assigned_doctor_id) REFERENCES users(id)
);

-- SEED DATA
INSERT OR IGNORE INTO roles (id, code, name, department, default_user_name, summary) VALUES
  (1, 'doctor', 'Dokter Radiolog', 'Instalasi Radiologi', 'dr. Farhan Malik, Sp.Rad', 'Worklist klinis, validasi temuan AI & pengesahan resume medis.'),
  (2, 'admin', 'Admin IT & PACS', 'SIMRS / Divisi IT', 'Ahmad Zulkarnain, S.Kom', 'Gateway PACS, audit kepatuhan data UU PDP & tata kelola akses.'),
  (3, 'operator', 'Operator Model Support', 'Pusat Riset AI & MLOps', 'Rian Suryadi', 'Monitoring GPU, deteksi data drift & evaluasi active learning.');

INSERT OR IGNORE INTO users (id, name, email, role_code, employee_id, workstation) VALUES
  (1, 'dr. Farhan Malik, Sp.Rad', 'farhan.rad@rs-medai.id', 'doctor', 'MED-9021', 'WS-RAD-01'),
  (2, 'Ahmad Zulkarnain, S.Kom', 'it.pacs@rs-medai.id', 'admin', 'ADM-1044', 'SERVER-ROOM-02'),
  (3, 'Rian Suryadi', 'mlops.support@rs-medai.id', 'operator', 'ENG-3091', 'AI-OPS-CENTER');

-- Permissions Matrix
INSERT OR IGNORE INTO role_menus (role_code, menu_id, menu_name, can_access) VALUES
  ('doctor', 'menu-worklist', 'Worklist Pasien', 1),
  ('doctor', 'menu-viewer', 'DICOM AI Viewer', 1),
  ('doctor', 'menu-reports', 'Validasi & Tanda Tangan', 1),
  ('admin', 'menu-pacs', 'Gateway DICOM / PACS', 1),
  ('admin', 'menu-users', 'Manajemen Hak Akses', 1),
  ('admin', 'menu-audit', 'Audit Kepatuhan UU PDP', 1),
  ('admin', 'menu-reports', 'Laporan Kepatuhan', 1),
  ('operator', 'menu-models', 'Status Model & GPU', 1),
  ('operator', 'menu-pipeline', 'Active Learning Queue', 1),
  ('operator', 'menu-logs', 'Drift & Anomali Evaluasi', 1),
  ('operator', 'menu-worklist', 'Worklist Pasien', 1);

-- Workflow States
INSERT OR IGNORE INTO workflow_states (id, code, label, actor_role, description) VALUES
  (1, 'ingestion', 'Ingestion PACS', 'Gateway', 'DICOM diterima & dianonimkan'),
  (2, 'inference', 'Inferensi AI', 'Neural Model', 'Segmentasi lesi selesai'),
  (3, 'review', 'Review Dokter', 'Dokter', 'Menunggu validasi radiolog'),
  (4, 'verified', 'Tervalidasi & Ekspor', 'SIMRS', 'Ditandatangani & arsip final');

-- Studies
INSERT OR IGNORE INTO studies (id, patient_name, patient_age, medical_record_no, modality, ai_finding, confidence_pct, state_code, created_time, assigned_doctor_id) VALUES
  ('STD-2026-9041', 'Tn. Hendra Wijaya', 54, 'RM-88201', 'CT-Thorax', 'Solitary Nodule 8.4mm (RUL)', 98.2, 'review', '10:14 WIB', 1),
  ('STD-2026-9042', 'Ny. Ratna Sari', 41, 'RM-88195', 'Chest X-Ray', 'Bilateral Infiltrate, Susp. Pneumonia', 96.5, 'verified', '09:48 WIB', 1),
  ('STD-2026-9043', 'An. Dimas Pratama', 12, 'RM-88188', 'Brain MRI', 'Analisis Segmentasi T2-FLAIR', 91.0, 'inference', '10:22 WIB', 1),
  ('STD-2026-9044', 'Tn. Bambang Sutrisno', 67, 'RM-88179', 'CT Angiography', 'Antrean Verifikasi Kualitas DICOM', 88.5, 'ingestion', '10:26 WIB', 1);

