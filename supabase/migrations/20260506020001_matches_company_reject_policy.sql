-- Migration: RLS UPDATE Policy — Unternehmen darf eigene Matches ablehnen
-- Story 5.4: Match als „Nicht passend" markieren (Feedback-Loop)
--
-- Bestehende RLS-Policies auf matches (live verifiziert, Stand 2026-05-06):
--   matches_admin_all              — ALL für Admins (is_admin())
--   matches_company_read_own_jobs  — SELECT für company-Rolle + eigene Jobs
--   matches_recruiter_own_candidates — SELECT für recruiter + eigene Kandidaten
--
-- Auth Helper Functions (bereits vorhanden):
--   auth_role()       → SELECT role FROM users WHERE id = auth.uid()
--   auth_company_id() → SELECT company_id FROM users WHERE id = auth.uid()
--
-- NEUE POLICY: Unternehmen kann eigene Job-Matches AUSSCHLIESSLICH auf 'abgelehnt' setzen.
-- USING (vorher): muss company-Rolle sein + Job gehört dem Unternehmen
-- WITH CHECK (nachher): Nur status = 'abgelehnt' erlaubt + Job gehört dem Unternehmen

CREATE POLICY "matches_company_reject"
ON matches
FOR UPDATE
USING (
  auth_role() = 'company'
  AND EXISTS (
    SELECT 1 FROM jobs j
    WHERE j.id = matches.job_id
      AND j.company_id = auth_company_id()
  )
)
WITH CHECK (
  status = 'abgelehnt'
  AND EXISTS (
    SELECT 1 FROM jobs j
    WHERE j.id = matches.job_id
      AND j.company_id = auth_company_id()
  )
);
