-- Story 5.5: pg_cron Job für send-welcome-sequence
-- Offset: 3 Minuten nach trigger-matching (*/5), läuft bei Minute 3, 8, 13, ...
SELECT cron.schedule(
  'send-welcome-sequence-job',
  '3-58/5 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://cuesxuxkvxnpbanfgken.supabase.co/functions/v1/send-welcome-sequence',
    body    := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) AS request_id;
  $$
);
