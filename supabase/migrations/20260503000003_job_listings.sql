-- Migration 003: Job Listings
-- Creates job_listing_status enum, job_listings table, job_skills junction

-- ── Job Listing Status Enum ────────────────────────────────────
CREATE TYPE job_listing_status AS ENUM (
  'aktiv',
  'pausiert',
  'geschlossen'
);

-- ── Job Listings ───────────────────────────────────────────────
CREATE TABLE job_listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  location      TEXT,
  status        job_listing_status NOT NULL DEFAULT 'aktiv',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Job Skills (Junction) ──────────────────────────────────────
-- Hier (nach job_listings UND skills), beide FKs möglich
CREATE TABLE job_skills (
  job_listing_id  UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  skill_id        UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (job_listing_id, skill_id)
);

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;
