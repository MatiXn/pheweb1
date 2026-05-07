-- Migration: matches — company_notified_at für Benachrichtigungs-Tracking
-- Story 5.2: Unternehmen-Match-Benachrichtigung via Resend
-- NULL = noch nicht benachrichtigt → E-Mail ausstehend
-- gesetzt = E-Mail erfolgreich gesendet (kein weiterer Versand)

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS company_notified_at TIMESTAMPTZ;

-- Partial Index: nur unbenachrichtigte Matches → pg_cron Query sehr schnell
CREATE INDEX IF NOT EXISTS idx_matches_unnotified
  ON matches (job_id, created_at)
  WHERE company_notified_at IS NULL;
