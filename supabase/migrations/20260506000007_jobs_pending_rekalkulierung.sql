-- Migration 007 (2026-05-06): jobs — pending_rekalkulierung Flag
-- Story 5.1: Die Matching-Engine verarbeitet nur Jobs mit diesem Flag.
-- Wird durch DB-Trigger (Migration 008) gesetzt wenn Kandidatendaten sich ändern.
-- WICHTIG: Gilt für 'jobs' (operatives System), nicht 'job_listings' (BMAD UI-Layer).

ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS pending_rekalkulierung BOOLEAN NOT NULL DEFAULT FALSE;

-- Partial Index: nur aktive Jobs mit gesetztem Flag → pg_cron Query sehr schnell
CREATE INDEX IF NOT EXISTS idx_jobs_pending_rekalk
  ON jobs (id)
  WHERE pending_rekalkulierung = TRUE AND status = 'active';
