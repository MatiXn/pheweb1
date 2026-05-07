-- Story 5.5: welcome_sent_at für pg_cron Welcome-Sequenz
ALTER TABLE companies ADD COLUMN IF NOT EXISTS welcome_sent_at TIMESTAMPTZ;

-- KRITISCH: Backfill alle bestehenden aktiven Unternehmen
-- Da companies.is_active DEFAULT true, würden ALLE Bestandsfirmen sonst sofort
-- eine Welcome-E-Mail erhalten — das wäre unerwünscht.
UPDATE companies SET welcome_sent_at = NOW() WHERE is_active = true;

-- Partial Index für schnelle pg_cron-Queries
CREATE INDEX IF NOT EXISTS idx_companies_welcome_unsent
  ON companies (created_at)
  WHERE welcome_sent_at IS NULL AND is_active = true;
