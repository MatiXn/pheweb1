-- Migration 006 (2026-05-06): DB-Trigger — pending_rekalkulierung bei Kandidatenänderungen
-- Story 5.1 AC #6: Wenn ein Kandidat Skills oder Verfügbarkeit ändert →
-- pending_rekalkulierung = TRUE auf ALLEN aktiven Jobs setzen.
--
-- Referenziert: candidates (nicht profiles), jobs (nicht job_listings)
-- FOR EACH STATEMENT auf candidate_skills: Bulk-Inserts triggern nur 1 UPDATE.
-- SECURITY DEFINER: umgeht RLS (setzt nur Boolean-Flag, kein Datenleak).

CREATE OR REPLACE FUNCTION fn_set_pending_rekalkulierung()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE jobs
  SET pending_rekalkulierung = TRUE
  WHERE status = 'active';
  RETURN NULL;
END;
$$;

-- Trigger 1: Kandidaten-Skills geändert
DROP TRIGGER IF EXISTS trg_candidate_skills_rekalk ON candidate_skills;
CREATE TRIGGER trg_candidate_skills_rekalk
  AFTER INSERT OR DELETE ON candidate_skills
  FOR EACH STATEMENT
  EXECUTE FUNCTION fn_set_pending_rekalkulierung();

-- Trigger 2: Kandidaten-Verfügbarkeit geändert (candidates.availability)
DROP TRIGGER IF EXISTS trg_candidate_avail_rekalk ON candidates;
CREATE TRIGGER trg_candidate_avail_rekalk
  AFTER UPDATE OF availability ON candidates
  FOR EACH ROW
  WHEN (OLD.availability IS DISTINCT FROM NEW.availability)
  EXECUTE FUNCTION fn_set_pending_rekalkulierung();
