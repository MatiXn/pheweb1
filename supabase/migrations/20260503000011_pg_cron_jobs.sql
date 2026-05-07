-- Migration 011: pg_cron Jobs
-- FR62: Matching-Trigger alle 5 Minuten via pg_net → Edge Function trigger-matching
-- NFR20: Inaktivitäts-Cleanup nach 24 Monaten (Sonntag 02:00 UTC)
--
-- VORAUSSETZUNG:
--   pg_cron muss aktiviert sein (CREATE EXTENSION IF NOT EXISTS pg_cron)
--   pg_net muss aktiviert sein  (CREATE EXTENSION IF NOT EXISTS pg_net)
--
-- Edge Function trigger-matching muss vor dieser Migration deployed sein
-- (verify_jwt=false, damit pg_cron ohne JWT-Token aufrufen kann)

-- ════════════════════════════════════════════════════════════
-- JOB 1: Matching-Trigger alle 5 Minuten
-- ════════════════════════════════════════════════════════════
-- Ruft die trigger-matching Edge Function auf (Stub in Story 1.4,
-- vollständige Implementierung in Story 5.x — Matching-Engine)

-- Unschedule first to make idempotent
SELECT cron.unschedule('trigger-matching-job') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'trigger-matching-job'
);
SELECT cron.schedule(
  'trigger-matching-job',
  '*/5 * * * *',
  $$
  -- NOTE: Replace the URL below with your actual Supabase project URL
  -- In production, use the SUPABASE_URL environment variable
  -- NOTE: The Authorization header below requires SUPABASE_SERVICE_ROLE_KEY
  -- This should be set via vault or passed as a parameter in production
  SELECT net.http_post(
    url     := 'https://cuesxuxkvxnpbanfgken.supabase.co/functions/v1/trigger-matching',
    body    := '{}'::jsonb,
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY_HERE"}'::jsonb
  ) AS request_id;
  $$
);

-- ════════════════════════════════════════════════════════════
-- JOB 2: Inaktivitäts-Cleanup wöchentlich (Sonntag 02:00 UTC)
-- ════════════════════════════════════════════════════════════
-- NFR20: Kandidaten-Profile mit letzter Aktivität > 24 Monate
-- → availability_status = 'loeschaufforderung'
-- WICHTIG: role = 'kandidat' — NUR Kandidaten, nicht Unternehmen/Recruiter/Admin

-- Unschedule first to make idempotent
SELECT cron.unschedule('cleanup-inactive-profiles') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'cleanup-inactive-profiles'
);
SELECT cron.schedule(
  'cleanup-inactive-profiles',
  '0 2 * * 0',
  $$
  -- NOTE: using updated_at as proxy for inactivity - consider adding a dedicated last_active_at column
  -- The update trigger resets updated_at on any profile update, which can reset the inactivity clock
  UPDATE profiles
  SET
    availability_status = 'loeschaufforderung'
  WHERE
    role                 = 'kandidat'
    AND is_active        = TRUE
    AND (availability_status IS NULL OR availability_status != 'loeschaufforderung')
    AND updated_at < NOW() - INTERVAL '24 months';
  $$
);
