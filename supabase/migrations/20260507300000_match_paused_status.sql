-- Story 6.6: Matches bei Konto-Einfrierung pausieren
-- Adds 'paused' to interaction_status enum + pause/resume functions
-- Updates get_recruiter_interested_matches() to include paused matches + current_status field

-- ─────────────────────────────────────────────────────────────────
-- 1. 'paused' zu interaction_status Enum hinzufügen
--    PG12+: ALTER TYPE ADD VALUE ist in Transaktionen erlaubt
-- ─────────────────────────────────────────────────────────────────
ALTER TYPE interaction_status ADD VALUE IF NOT EXISTS 'paused';

-- ─────────────────────────────────────────────────────────────────
-- 2. pause_company_matches(p_company_id uuid) RETURNS int
--    SECURITY DEFINER, nur Admin
--    Legt für alle aktiven Matches des Unternehmens einen 'paused'-Eintrag an
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION pause_company_matches(p_company_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_match_id   uuid;
  v_cur_status interaction_status;
  v_count      int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0003';
  END IF;

  -- Alle Matches des Unternehmens mit aktivem Status ermitteln
  FOR v_match_id IN
    SELECT DISTINCT m.id
    FROM matches m
    JOIN jobs j ON j.id = m.job_id AND j.company_id = p_company_id
  LOOP
    -- Aktuellen Status prüfen (current_interaction_status ist bereits vorhanden)
    v_cur_status := current_interaction_status(v_match_id);

    -- Nur pausieren wenn aktiver Status (nicht already paused, nicht final)
    IF v_cur_status IN (
      'interested', 'token_sent', 'candidate_approved',
      'interview_planned', 'interview_done'
    ) THEN
      INSERT INTO interactions (match_id, status, set_by)
      VALUES (v_match_id, 'paused', auth.uid());
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- 3. resume_company_matches(p_company_id uuid) RETURNS int
--    SECURITY DEFINER, nur Admin
--    Setzt pausierte Matches zurück auf ihren letzten aktiven Status
--    interactions ist append-only: Pre-Pause = letzter Eintrag mit status != 'paused'
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION resume_company_matches(p_company_id uuid)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_match_id          uuid;
  v_pre_pause_status  interaction_status;
  v_count             int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0003';
  END IF;

  -- Alle aktuell pausierten Matches des Unternehmens ermitteln
  FOR v_match_id IN
    SELECT DISTINCT m.id
    FROM matches m
    JOIN jobs j ON j.id = m.job_id AND j.company_id = p_company_id
    WHERE current_interaction_status(m.id) = 'paused'
  LOOP
    -- Letzten aktiven Status vor der Pausierung finden
    SELECT status INTO v_pre_pause_status
    FROM interactions
    WHERE match_id = v_match_id
      AND status != 'paused'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Nur resumieren wenn Pre-Pause-Status gefunden
    IF v_pre_pause_status IS NOT NULL THEN
      INSERT INTO interactions (match_id, status, set_by)
      VALUES (v_match_id, v_pre_pause_status, auth.uid());
      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- 4. get_recruiter_interested_matches() aktualisieren
--    DROP + CREATE wegen RETURNS TABLE Änderung (neues Feld: current_status)
--    Neue Filter: current_status IN ('interested', 'paused')
-- ─────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS get_recruiter_interested_matches();

CREATE FUNCTION get_recruiter_interested_matches()
RETURNS TABLE (
  match_id          uuid,
  anonymous_id      text,
  professional_title text,
  job_title         text,
  company_name      text,
  company_id        uuid,
  score             numeric,
  category          match_category,
  matched_at        timestamptz,
  current_status    interaction_status
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT
    rmo.match_id,
    rmo.anonymous_id,
    rmo.professional_title,
    rmo.job_title,
    rmo.company_name,
    rmo.company_id,
    rmo.score,
    rmo.category,
    rmo.matched_at,
    rmo.current_status
  FROM recruiter_match_overview rmo
  WHERE rmo.recruiter_id = auth.uid()
    AND rmo.current_status IN ('interested', 'paused')
  ORDER BY rmo.matched_at DESC;
END;
$$;
