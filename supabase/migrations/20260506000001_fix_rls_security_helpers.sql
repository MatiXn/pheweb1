-- Story 1-3 Review Patches: Fix SECURITY DEFINER helper functions in migration 010

-- P1: Add SET search_path to prevent search_path injection attacks
-- P4: STABLE→VOLATILE for security-critical RLS functions (prevent stale caching within transactions)
-- P5: Add GRANT EXECUTE for explicit permission control

CREATE OR REPLACE FUNCTION is_jwt_revoked()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER VOLATILE SET search_path = public, auth AS $$
  SELECT EXISTS (SELECT 1 FROM jwt_revocations WHERE user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION company_has_revealed_match(candidate_profile_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER VOLATILE SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM matches m
    JOIN job_listings jl ON jl.id = m.job_listing_id
    WHERE m.candidate_id = candidate_profile_id
      AND jl.company_id = auth.uid()
      AND m.status IN ('interessiert','kontakt_hergestellt','eingestellt','nicht_eingestellt')
  );
$$;

CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM login_attempts
  WHERE user_id = p_user_id
    AND attempted_at > NOW() - INTERVAL '15 minutes'
    AND success = FALSE;
  RETURN attempt_count < 5;
END;
$$;

GRANT EXECUTE ON FUNCTION is_jwt_revoked() TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION company_has_revealed_match(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(UUID) TO authenticated;

-- P2: Prevent role self-escalation via profiles_update_own
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING  (auth.uid() = id AND NOT is_jwt_revoked())
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
  );

-- P3: Prevent match job_listing_id pivoting via matches_company_update_status
DROP POLICY IF EXISTS "matches_company_update_status" ON matches;
CREATE POLICY "matches_company_update_status" ON matches
  FOR UPDATE
  USING (
    current_user_role() = 'unternehmen'
    AND NOT is_jwt_revoked()
    AND EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_id AND jl.company_id = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('interessiert', 'abgelehnt')
    AND EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_id AND jl.company_id = auth.uid()
    )
  );
