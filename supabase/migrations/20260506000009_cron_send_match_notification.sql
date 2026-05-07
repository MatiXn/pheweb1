-- Migration: pg_cron Job für send-match-notification
-- Story 5.2: Läuft alle 5 Minuten, 2 Minuten nach trigger-matching
-- Offset: 2-57/5 statt */5 damit Matching immer zuerst läuft
-- verify_jwt = false → kein Authorization Header nötig

SELECT cron.schedule(
  'send-match-notification-job',
  '2-57/5 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://cuesxuxkvxnpbanfgken.supabase.co/functions/v1/send-match-notification',
    body    := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) AS request_id;
  $$
);
