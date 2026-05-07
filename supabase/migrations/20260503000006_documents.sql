-- Migration 006: Documents
-- Creates document_type enum, documents table

-- ── Document Type Enum ─────────────────────────────────────────
CREATE TYPE document_type AS ENUM (
  'lebenslauf',
  'zeugnis',
  'zertifikat',
  'sonstiges'
);

-- ── Documents ──────────────────────────────────────────────────
CREATE TABLE documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path      TEXT NOT NULL,
  document_type     document_type NOT NULL,
  original_filename TEXT,
  file_size_bytes   INTEGER,
  verified          BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
