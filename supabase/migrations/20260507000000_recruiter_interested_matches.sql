-- Migration: get_recruiter_interested_matches() SECURITY DEFINER
-- Story 6.3: Recruiter-seitige Interessenten-Übersicht
-- Gibt Matches zurück, bei denen recruiter_id = auth.uid() AND current_status = 'interested'
-- Nutzt recruiter_match_overview VIEW (enthält company_name via companies JOIN)

CREATE OR REPLACE FUNCTION get_recruiter_interested_matches()
RETURNS TABLE (
  match_id          uuid,
  anonymous_id      text,
  professional_title text,
  job_title         text,
  company_name      text,
  company_id        uuid,
  score             numeric,
  category          match_category,
  matched_at        timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    rmo.matched_at
  FROM recruiter_match_overview rmo
  WHERE rmo.recruiter_id = auth.uid()
    AND rmo.current_status = 'interested'
  ORDER BY rmo.matched_at DESC;
END;
$$;
