-- Migration: candidate_notified_at zu matches hinzufügen
-- Story 5.3: Kandidaten-Benachrichtigung (via Recruiter)
-- Analog zu company_notified_at (Story 5.2)

ALTER TABLE matches ADD COLUMN IF NOT EXISTS candidate_notified_at TIMESTAMPTZ;

-- Partial Index für schnelle pg_cron-Queries
-- Nur Matches ohne Kandidaten-Benachrichtigung werden indiziert
CREATE INDEX IF NOT EXISTS idx_matches_candidate_unnotified
  ON matches (candidate_id, created_at)
  WHERE candidate_notified_at IS NULL;
