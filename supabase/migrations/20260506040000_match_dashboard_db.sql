-- Story 6.1: Match-Dashboard DB — Audit-Trigger + Kandidaten-Stats-Funktion
-- Trigger: trg_interactions_audit — schreibt 'match.viewed' in audit_log bei status='new'
-- Funktion: get_candidate_match_stats(p_candidate_id) — Profil-Ansichten + aktive Jobs in Region

-- ─────────────────────────────────────────────────────────────────
-- 1. Trigger-Funktion für Audit-Log bei neuer Interaction
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.interactions_audit_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Nur 'new' (= angesehen) wird in audit_log eingetragen
  IF NEW.status = 'new' THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.set_by,
      'match.viewed',
      'match',
      NEW.match_id,
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- 2. Trigger auf interactions registrieren
-- ─────────────────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_interactions_audit ON public.interactions;

CREATE TRIGGER trg_interactions_audit
AFTER INSERT ON public.interactions
FOR EACH ROW EXECUTE FUNCTION public.interactions_audit_fn();

-- ─────────────────────────────────────────────────────────────────
-- 3. SECURITY DEFINER Funktion: get_candidate_match_stats
--    Aufgerufen vom Recruiter (recruiter_id = auth.uid())
--    Gibt zurück: Anzahl Profilansichten + aktive Jobs in der Kandidaten-Region
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_candidate_match_stats(p_candidate_id uuid)
RETURNS TABLE(profile_view_count bigint, active_jobs_in_region bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_location_city TEXT;
BEGIN
  -- Zugriffsprüfung: Aufrufer muss der Recruiter sein, der diesen Kandidaten angelegt hat
  SELECT c.location_city
  INTO v_location_city
  FROM candidates c
  WHERE c.id = p_candidate_id
    AND c.recruiter_id = auth.uid()
    AND c.status = 'active';

  IF v_location_city IS NULL THEN
    RAISE EXCEPTION 'Kandidat nicht gefunden oder kein Zugriff' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT
    (
      SELECT COUNT(*)
      FROM interactions i
      JOIN matches m ON m.id = i.match_id
      WHERE m.candidate_id = p_candidate_id
        AND i.status = 'new'
    ) AS profile_view_count,
    (
      SELECT COUNT(*)
      FROM jobs j
      WHERE j.status = 'active'
        AND j.location_city = v_location_city
    ) AS active_jobs_in_region;
END;
$$;

-- Funktion nur über angemeldete Benutzer aufrufbar (kein anonymer Zugriff)
REVOKE ALL ON FUNCTION public.get_candidate_match_stats(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_candidate_match_stats(uuid) TO authenticated;
