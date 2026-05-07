-- Migration: Admin-Verifizierungs-Queue (Story 7.1)
-- Fügt ausstehend_verifizierung zu candidate_status hinzu,
-- migriert bestehende Kandidaten und erstellt get_admin_verification_queue().

-- ── 1. Enum-Erweiterung ────────────────────────────────────────────────────
-- DO-Block öffnet eigene Subtransaktion → ADD VALUE darf darin stehen
DO $$ BEGIN
  ALTER TYPE candidate_status ADD VALUE IF NOT EXISTS 'ausstehend_verifizierung';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Datenmigration ─────────────────────────────────────────────────────
-- Kandidaten mit erteilter Einwilligung und noch inaktivem Status übernehmen
UPDATE candidates
SET status = 'ausstehend_verifizierung'
WHERE consent_given = true
  AND status = 'inactive';

-- ── 3. RLS-Policy: Admins dürfen alle Dokumente lesen ─────────────────────
-- (candidates_admin_all existiert bereits und deckt SELECT ab)
DROP POLICY IF EXISTS "admin_read_all_documents" ON documents;
CREATE POLICY "admin_read_all_documents" ON documents
  FOR SELECT
  USING (is_admin());

-- ── 4. Funktion: get_admin_verification_queue() ────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_verification_queue()
RETURNS TABLE (
  candidate_id                 uuid,
  anonymous_id                 text,
  professional_title           text,
  location_city                text,
  experience_years             integer,
  education_type               education_type,
  education_field              text,
  availability                 availability,
  salary_expectation           integer,
  salary_currency              text,
  recruiter_recommendation     text,
  recruiter_neutral_assessment text,
  consent_given_at             timestamptz,
  created_at                   timestamptz,
  document_count               bigint,
  recruiter_id                 uuid,
  recruiter_first_name         text,
  recruiter_last_name          text,
  subscription_tier            subscription_tier,
  completeness_score           integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auth-Guard: nur Admins dürfen die Queue abrufen
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  WITH doc_counts AS (
    SELECT d.candidate_id, COUNT(*) AS doc_count
    FROM documents d
    GROUP BY d.candidate_id
  ),
  recruiter_tier AS (
    SELECT
      u.id AS user_id,
      COALESCE(s.tier, 'basis'::subscription_tier) AS tier
    FROM users u
    LEFT JOIN subscriptions s ON s.company_id = u.company_id
      AND s.status = 'active'
  )
  SELECT
    c.id                                                AS candidate_id,
    c.anonymous_id,
    c.professional_title,
    c.location_city,
    c.experience_years,
    c.education_type,
    c.education_field,
    c.availability,
    c.salary_expectation,
    c.salary_currency,
    c.recruiter_recommendation,
    c.recruiter_neutral_assessment,
    c.consent_given_at,
    c.created_at,
    COALESCE(dc.doc_count, 0)                           AS document_count,
    c.recruiter_id,
    u.first_name                                        AS recruiter_first_name,
    u.last_name                                         AS recruiter_last_name,
    COALESCE(rt.tier, 'basis'::subscription_tier)       AS subscription_tier,
    (
      CASE WHEN c.cv_file_url                  IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.education_field              IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.education_institution        IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.salary_expectation           IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.switch_reason                IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.recruiter_recommendation     IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.recruiter_neutral_assessment IS NOT NULL THEN 1 ELSE 0 END +
      COALESCE(dc.doc_count::integer, 0)
    )                                                   AS completeness_score
  FROM candidates c
  JOIN users u ON u.id = c.recruiter_id
  LEFT JOIN doc_counts dc ON dc.candidate_id = c.id
  LEFT JOIN recruiter_tier rt ON rt.user_id = c.recruiter_id
  WHERE c.status = 'ausstehend_verifizierung'
  ORDER BY
    c.created_at ASC,
    (
      CASE WHEN c.cv_file_url                  IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.education_field              IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.education_institution        IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.salary_expectation           IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.switch_reason                IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.recruiter_recommendation     IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN c.recruiter_neutral_assessment IS NOT NULL THEN 1 ELSE 0 END +
      COALESCE(dc.doc_count::integer, 0)
    ) DESC,
    CASE rt.tier
      WHEN 'enterprise'   THEN 1
      WHEN 'professional' THEN 2
      WHEN 'basis'        THEN 3
      ELSE 4
    END ASC;
END;
$$;
