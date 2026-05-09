-- Migration: pg_cron Job für abgelaufene Banküberweisungen
-- Story 8.2: Täglich um 02:00 UTC abgelaufene ausstehende Überweisungen markieren

-- pg_cron Erweiterung aktivieren (falls nicht bereits aktiv)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Bestehenden Job entfernen falls vorhanden (Idempotenz)
SELECT cron.unschedule('expire-pending-bank-transfers')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'expire-pending-bank-transfers'
);

-- pg_cron Job: täglich 02:00 UTC
SELECT cron.schedule(
  'expire-pending-bank-transfers',
  '0 2 * * *',
  $$
    UPDATE subscriptions
    SET
      status     = 'abgelaufen',
      updated_at = NOW()
    WHERE status = 'ausstehend_zahlung'
      AND bank_transfer_requested_at < NOW() - INTERVAL '14 days';
  $$
);
