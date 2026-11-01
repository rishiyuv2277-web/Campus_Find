CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(40) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  roll_no VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS item_reports (
  id VARCHAR(40) PRIMARY KEY,
  type VARCHAR(10) NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(40) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  report_date DATE NOT NULL,
  report_time VARCHAR(30),
  location VARCHAR(180) NOT NULL,
  features VARCHAR(1000) NOT NULL,
  image LONGTEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  contact VARCHAR(190) NOT NULL,
  reporter_id VARCHAR(40) NOT NULL,
  reporter_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  handover VARCHAR(30),
  seed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_report_student FOREIGN KEY (reporter_id) REFERENCES students(id),
  CONSTRAINT chk_report_type CHECK (type IN ('lost','found')),
  CONSTRAINT chk_report_status CHECK (status IN ('open','under-review','matched','returned'))
);
CREATE TABLE IF NOT EXISTS claim_requests (
  id VARCHAR(40) PRIMARY KEY,
  report_id VARCHAR(40) NOT NULL,
  claimant_name VARCHAR(120) NOT NULL,
  claimant_email VARCHAR(190) NOT NULL,
  secret_detail VARCHAR(1000) NOT NULL,
  message VARCHAR(1000),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_claim_report FOREIGN KEY (report_id) REFERENCES item_reports(id),
  CONSTRAINT chk_claim_status CHECK (status IN ('pending','approved','declined'))
);
CREATE TABLE IF NOT EXISTS auth_sessions (
  token VARCHAR(80) PRIMARY KEY,
  student_id VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
