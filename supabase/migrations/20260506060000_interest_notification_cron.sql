-- Migration: pg_cron Job für send-interest-notification
-- Story 6.2: Läuft alle 5 Minuten, Offset 1-56/5 (freier Slot)
-- verify_jwt = false → kein Authorization Header nötig
-- Idempotenz via audit_log Einträge 'email.interest_notification.sent'

SELECT cron.schedule(
  'send-interest-notification-job',
  '1-56/5 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://cuesxuxkvxnpbanfgken.supabase.co/functions/v1/send-interest-notification',
    body    := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) AS request_id;
  $$
);
