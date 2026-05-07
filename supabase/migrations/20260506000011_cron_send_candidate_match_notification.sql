-- Migration: pg_cron Job für send-candidate-match-notification
-- Story 5.3: Läuft alle 5 Minuten, 4 Minuten nach trigger-matching
-- Timing-Sequenz:
--   */5 * * * *   → trigger-matching (Minute 0, 5, 10...)
--   2-57/5        → send-match-notification (Unternehmen, Minute 2, 7, 12...)
--   4-59/5        → send-candidate-match-notification (Recruiter, Minute 4, 9, 14...)
-- verify_jwt = false → kein Authorization Header nötig

SELECT cron.schedule(
  'send-candidate-match-notification-job',
  '4-59/5 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://cuesxuxkvxnpbanfgken.supabase.co/functions/v1/send-candidate-match-notification',
    body    := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) AS request_id;
  $$
);
