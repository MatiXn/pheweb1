-- Migration 005 (2026-05-06): job_listings — pending_rekalkulierung Flag
-- Story 5.1: Matching-Engine braucht ein Flag um zu wissen welche Stellen
-- neu berechnet werden müssen (z.B. nach Kandidaten-Skill-Änderungen).
--
-- Partial Index beschleunigt die pg_cron-Query erheblich da in der Regel
-- nur ein Bruchteil aller Stellen auf pending_rekalkulierung = TRUE steht.

ALTER TABLE job_listings
  ADD COLUMN IF NOT EXISTS pending_rekalkulierung BOOLEAN NOT NULL DEFAULT FALSE;

-- Partial Index: nur Zeilen wo das Flag gesetzt und Stelle aktiv ist
CREATE INDEX IF NOT EXISTS idx_job_listings_pending_rekalk
  ON job_listings (id)
  WHERE pending_rekalkulierung = TRUE AND status = 'aktiv';
