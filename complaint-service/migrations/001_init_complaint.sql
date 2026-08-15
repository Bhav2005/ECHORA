-- Migration file to initialize the Complaint Service Database Schema

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  building VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  evidence_url VARCHAR(500),
  token_message VARCHAR(512) UNIQUE NOT NULL,
  token_signature VARCHAR(512) NOT NULL,
  mailbox_id VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  previous_hash VARCHAR(64) NOT NULL,
  block_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mailbox_id ON complaints(mailbox_id);

CREATE TABLE IF NOT EXISTS replies (
  id SERIAL PRIMARY KEY,
  mailbox_id VARCHAR(64) NOT NULL,
  sender VARCHAR(10) NOT NULL CHECK (sender IN ('ADMIN', 'USER')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS used_tokens (
  token_hash VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
