-- Migration: Admin Kandidaten-Verifizierungs-Aktionen (Story 7.2 — Teil 2/2)
-- Voraussetzung: 20260507330000_candidate_status_add_dokumente_erforderlich.sql muss committed sein.
-- Erstellt: approve_candidate(), reject_candidate(), pg_cron Schedule

-- ── approve_candidate() ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION approve_candidate(p_candidate_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = p_candidate_id AND status = 'ausstehend_verifizierung') THEN
    RAISE EXCEPTION 'Kandidat nicht in Verifizierungs-Queue' USING ERRCODE = 'P0001';
  END IF;

  UPDATE candidates
  SET status = 'active', updated_at = now()
  WHERE id = p_candidate_id;

  INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid()::text,
    'candidate.profile.approved',
    'candidate',
    p_candidate_id::text,
    jsonb_build_object('approved_at', now()::text)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_candidate(uuid) TO authenticated;

-- ── reject_candidate() ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION reject_candidate(p_candidate_id uuid, p_feedback text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;
  IF p_feedback IS NULL OR trim(p_feedback) = '' THEN
    RAISE EXCEPTION 'Feedback-Hinweis ist erforderlich' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = p_candidate_id AND status = 'ausstehend_verifizierung') THEN
    RAISE EXCEPTION 'Kandidat nicht in Verifizierungs-Queue' USING ERRCODE = 'P0001';
  END IF;

  UPDATE candidates
  SET status = 'dokumente_erforderlich', updated_at = now()
  WHERE id = p_candidate_id;

  INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid()::text,
    'candidate.profile.rejected',
    'candidate',
    p_candidate_id::text,
    jsonb_build_object('feedback', trim(p_feedback), 'rejected_at', now()::text)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.reject_candidate(uuid, text) TO authenticated;

-- ── pg_cron: send-verification-result alle 5 Minuten ────────────────────────
-- verify_jwt = false gesetzt bei Edge-Function-Deployment (pg_cron kann keinen JWT liefern)
SELECT cron.schedule(
  'send-verification-result-job',
  '3-58/5 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://cuesxuxkvxnpbanfgken.supabase.co/functions/v1/send-verification-result',
    body    := '{}'::jsonb,
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) AS request_id;
  $$
);
