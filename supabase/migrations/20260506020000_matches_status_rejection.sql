-- Migration: match_status Enum + status + rejection_reason auf matches
-- Story 5.4: Match als „Nicht passend" markieren (Feedback-Loop)
--
-- WICHTIG: Das matches-Schema hatte bisher KEINEN status-Feld.
-- Diese Migration legt den minimalen Enum an (aktiv, abgelehnt).
-- Weitere Zustände (interessiert, kontakt_hergestellt, etc.) kommen in Epic 6.

-- match_status Enum — minimal für Story 5.4
CREATE TYPE match_status AS ENUM ('aktiv', 'abgelehnt');

-- status Spalte mit Default 'aktiv' für alle bestehenden Matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS status match_status NOT NULL DEFAULT 'aktiv';

-- rejection_reason als TEXT[] (Mehrfachauswahl, nullable — NULL = kein Feedback gegeben)
ALTER TABLE matches ADD COLUMN IF NOT EXISTS rejection_reason TEXT[];

-- Partial Index: nur aktive Matches indizieren (UI-Queries + pg_cron)
CREATE INDEX IF NOT EXISTS idx_matches_active
  ON matches (job_id, score DESC)
  WHERE status = 'aktiv';
