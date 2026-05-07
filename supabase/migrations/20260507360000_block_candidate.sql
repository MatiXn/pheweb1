-- Migration: Admin Kandidaten-Sperr-Funktion (Story 7.3 — Teil 2/2)
-- Voraussetzung: 20260507350000_candidate_status_add_gesperrt.sql muss committed sein.
-- Erstellt: block_candidate()

-- ── block_candidate() ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION block_candidate(p_candidate_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;
  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RAISE EXCEPTION 'Sperrgrund ist erforderlich' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM candidates WHERE id = p_candidate_id) THEN
    RAISE EXCEPTION 'Kandidat nicht gefunden' USING ERRCODE = 'P0001';
  END IF;

  -- Kandidaten-Status auf 'gesperrt' setzen
  UPDATE candidates
  SET status = 'gesperrt', updated_at = now()
  WHERE id = p_candidate_id;

  -- Laufende Matches pausieren (FR21: Match-Scores invalidieren)
  -- Analog zu pause_company_matches() aus Story 6.6
  FOR v_match_id IN
    SELECT id FROM matches WHERE candidate_id = p_candidate_id
  LOOP
    IF current_interaction_status(v_match_id) IN (
      'interested', 'token_sent', 'candidate_approved',
      'interview_planned', 'interview_done'
    ) THEN
      INSERT INTO interactions (match_id, status, set_by)
      VALUES (v_match_id, 'paused', auth.uid());
    END IF;
  END LOOP;

  -- Audit-Log
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid()::text,
    'candidate.profile.blocked',
    'candidate',
    p_candidate_id::text,
    jsonb_build_object('reason', trim(p_reason), 'blocked_at', now()::text)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.block_candidate(uuid, text) TO authenticated;
