-- Story 6.5: Merkliste & Prozess-Status-Tracking
-- Erstellt: match_shortlists Tabelle, toggle_match_shortlist() SECURITY DEFINER
-- Aktualisiert: get_top_3_candidates_for_job() mit is_shortlisted Feld

-- ── Tabelle: match_shortlists ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS match_shortlists (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   uuid        NOT NULL,
  company_id uuid        NOT NULL,
  created_by uuid        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (match_id, company_id)
);

ALTER TABLE match_shortlists ENABLE ROW LEVEL SECURITY;

-- Unternehmen liest/schreibt nur eigene Shortlist-Einträge
CREATE POLICY "company_own_shortlist"
  ON match_shortlists FOR ALL
  USING (company_id = auth_company_id());

-- ── Funktion: toggle_match_shortlist ────────────────────────────────────────

CREATE OR REPLACE FUNCTION toggle_match_shortlist(p_match_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_exists     boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  -- Unternehmens-ID ermitteln und Zugriffsrecht prüfen
  SELECT j.company_id INTO v_company_id
  FROM matches m
  JOIN jobs j ON j.id = m.job_id
  WHERE m.id = p_match_id
    AND j.company_id = auth_company_id();

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Zugriff verweigert' USING ERRCODE = 'P0003';
  END IF;

  -- Toggle: wenn vorhanden → löschen (return false), sonst einfügen (return true)
  SELECT EXISTS (
    SELECT 1 FROM match_shortlists
    WHERE match_id = p_match_id AND company_id = v_company_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM match_shortlists
    WHERE match_id = p_match_id AND company_id = v_company_id;
    RETURN false;
  ELSE
    INSERT INTO match_shortlists (match_id, company_id, created_by)
    VALUES (p_match_id, v_company_id, auth.uid());
    RETURN true;
  END IF;
END;
$$;

-- ── Funktion: get_top_3_candidates_for_job (UPDATE mit is_shortlisted) ───────
-- Muss gedroppt werden da sich das RETURNS TABLE geändert hat (neue Spalte is_shortlisted)
-- get_top_matches_for_company() ruft diese Funktion auf — wird durch CASCADE nicht berührt
DROP FUNCTION IF EXISTS get_top_3_candidates_for_job(uuid);

-- Ersetzt die vorherige Version komplett (CREATE OR REPLACE)
-- Änderungen vs. Vorgänger:
--   + is_shortlisted bool im RETURNS TABLE
--   + JOIN jobs j in den Haupt-FROM-Clause verschoben (für is_shortlisted EXISTS)
--   + Cooldown-Subquery verwendet Alias jj statt j
--   + education_type::text und availability::text explizite Casts

CREATE OR REPLACE FUNCTION get_top_3_candidates_for_job(p_job_id uuid)
RETURNS TABLE (
  match_id                  uuid,
  candidate_id              uuid,
  anonymous_id              text,
  category                  match_category,
  score                     numeric,
  hire_probability          numeric,
  skill_score               numeric,
  experience_score          numeric,
  salary_score              numeric,
  location_score            numeric,
  availability_score        numeric,
  switch_willingness_score  numeric,
  professional_title        text,
  location_city             text,
  experience_years          int,
  education_type            text,
  education_field           text,
  education_match           text,
  availability              text,
  salary_expectation        numeric,
  salary_currency           text,
  reasons                   jsonb,
  neutral_assessment        text,
  recommendation            text,
  skills                    jsonb,
  visible_until             timestamptz,
  current_status            interaction_status,
  is_shortlisted            bool
)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM jobs
      WHERE id = p_job_id
        AND company_id = auth_company_id()
        AND auth_role() = 'company'
    )
  ) THEN
    RAISE EXCEPTION 'Unauthorized access to job %', p_job_id
        USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    m.id AS match_id,
    c.id AS candidate_id,
    c.anonymous_id,
    m.category,
    m.score,
    m.hire_probability,
    m.skill_score,
    m.experience_score,
    m.salary_score,
    m.location_score,
    m.availability_score,
    m.switch_willingness_score,
    c.professional_title,
    c.location_city,
    c.experience_years,
    c.education_type::text,
    c.education_field,
    m.education_match,
    c.availability::text,
    c.salary_expectation,
    c.salary_currency,
    c.recruiter_reasons AS reasons,
    c.recruiter_neutral_assessment AS neutral_assessment,
    c.recruiter_recommendation AS recommendation,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'name', cs.skill_name,
            'level', cs.skill_level,
            'years', cs.years_experience
          ) ORDER BY cs.skill_level DESC
        )
        FROM candidate_skills cs
        WHERE cs.candidate_id = c.id
      ),
      '[]'::jsonb
    ) AS skills,
    m.visible_until,
    current_interaction_status(m.id) AS current_status,
    EXISTS (
      SELECT 1 FROM match_shortlists ms
      WHERE ms.match_id = m.id
        AND ms.company_id = j.company_id
    ) AS is_shortlisted
  FROM matches m
  JOIN jobs j ON j.id = m.job_id
  JOIN candidates c ON c.id = m.candidate_id
  WHERE m.job_id = p_job_id
    AND c.status = 'active'
    AND (m.visible_until IS NULL OR m.visible_until > NOW())
    AND NOT EXISTS (
        SELECT 1 FROM tokens t
        WHERE t.match_id = m.id AND t.decision = 'no'
    )
    AND NOT EXISTS (
        SELECT 1 FROM cooldowns cd
        JOIN jobs jj ON jj.id = m.job_id
        WHERE cd.candidate_id = c.id
          AND cd.company_id = jj.company_id
          AND cd.blocked_until > NOW()
    )
  ORDER BY m.score DESC, m.created_at ASC
  LIMIT 3;
END;
$$;
