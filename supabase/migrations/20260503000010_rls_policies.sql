-- Migration 010: RLS Policies + Helper Functions
-- Sicherheits-Kern: Anonymisierung (FR27), RBAC, Tenant-Isolation, JWT-Revocation (FR46)
-- ALLE Helper-Funktionen sind SECURITY DEFINER → kein RLS-Recursion-Problem

-- ════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ════════════════════════════════════════════════════════════

-- FR46: JWT Revocation Check
-- SECURITY DEFINER: liest jwt_revocations ohne deren RLS-Policies zu triggern
CREATE OR REPLACE FUNCTION is_jwt_revoked()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM jwt_revocations WHERE user_id = auth.uid()
  );
$$;

-- RBAC Helper: Rolle des aktuellen Users
-- SECURITY DEFINER: liest profiles.role ohne profiles-RLS-Policies zu triggern (kein Infinite Loop)
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- FR27: Anonymisierungs-Check
-- Gibt TRUE zurück wenn Unternehmen (auth.uid()) einen enthüllten Match mit dem Kandidaten hat
CREATE OR REPLACE FUNCTION company_has_revealed_match(candidate_profile_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM matches m
    JOIN job_listings jl ON jl.id = m.job_listing_id
    WHERE m.candidate_id = candidate_profile_id
      AND jl.company_id = auth.uid()
      AND m.status IN (
        'interessiert',
        'kontakt_hergestellt',
        'eingestellt',
        'nicht_eingestellt'
      )
  );
$$;

-- FR63: Rate Limit Check (5 Fehlversuche in 15 Minuten)
CREATE OR REPLACE FUNCTION check_rate_limit(endpoint TEXT, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
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

-- ════════════════════════════════════════════════════════════
-- PROFILES RLS
-- ════════════════════════════════════════════════════════════

-- Eigenes Profil lesen
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (
    auth.uid() = id AND NOT is_jwt_revoked()
  );

-- FR27: Andere Profile sehen
-- Recruiter: alle Kandidaten (verwalten Kandidaten)
-- Unternehmen: nur bei enthülltem Match
-- Admin: alle
CREATE POLICY "profiles_select_others" ON profiles
  FOR SELECT USING (
    NOT is_jwt_revoked()
    AND role = 'kandidat'
    AND (
      current_user_role() = 'recruiter'
      OR current_user_role() = 'admin'
      OR (current_user_role() = 'unternehmen'
          AND company_has_revealed_match(id))
    )
  );

-- Eigenes Profil updaten
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING  (auth.uid() = id AND NOT is_jwt_revoked())
  WITH CHECK (auth.uid() = id);

-- Admin: vollständiger Zugriff
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- SKILLS RLS (öffentliche Taxonomie)
-- ════════════════════════════════════════════════════════════

CREATE POLICY "skills_select_authenticated" ON skills
  FOR SELECT USING (
    auth.role() = 'authenticated' AND NOT is_jwt_revoked()
  );

CREATE POLICY "skills_admin_write" ON skills
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- CANDIDATE_SKILLS RLS
-- ════════════════════════════════════════════════════════════

-- Kandidat: eigene Skills CRUD
CREATE POLICY "candidate_skills_own" ON candidate_skills
  FOR ALL USING (
    candidate_id = auth.uid() AND NOT is_jwt_revoked()
  );

-- Recruiter sehen Skills aller Kandidaten
CREATE POLICY "candidate_skills_recruiter_select" ON candidate_skills
  FOR SELECT USING (
    current_user_role() = 'recruiter' AND NOT is_jwt_revoked()
  );

-- Unternehmen sehen Skills von Kandidaten mit enthülltem Match
CREATE POLICY "candidate_skills_company_revealed" ON candidate_skills
  FOR SELECT USING (
    current_user_role() = 'unternehmen'
    AND NOT is_jwt_revoked()
    AND company_has_revealed_match(candidate_id)
  );

CREATE POLICY "candidate_skills_admin" ON candidate_skills
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- JOB_LISTINGS RLS
-- ════════════════════════════════════════════════════════════

-- Alle authentifizierten Nutzer sehen aktive Stellen
-- Unternehmen sehen auch eigene (pausiert/geschlossen)
-- Recruiter/Admin sehen alle
CREATE POLICY "job_listings_select" ON job_listings
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND NOT is_jwt_revoked()
    AND (
      status = 'aktiv'
      OR company_id = auth.uid()
      OR current_user_role() IN ('admin', 'recruiter')
    )
  );

CREATE POLICY "job_listings_company_insert" ON job_listings
  FOR INSERT WITH CHECK (
    company_id = auth.uid()
    AND current_user_role() = 'unternehmen'
    AND NOT is_jwt_revoked()
  );

CREATE POLICY "job_listings_company_update" ON job_listings
  FOR UPDATE
  USING (
    company_id = auth.uid()
    AND current_user_role() = 'unternehmen'
    AND NOT is_jwt_revoked()
  )
  WITH CHECK (company_id = auth.uid());

CREATE POLICY "job_listings_company_delete" ON job_listings
  FOR DELETE USING (
    company_id = auth.uid()
    AND current_user_role() = 'unternehmen'
    AND NOT is_jwt_revoked()
  );

CREATE POLICY "job_listings_admin" ON job_listings
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- JOB_SKILLS RLS
-- ════════════════════════════════════════════════════════════

CREATE POLICY "job_skills_select" ON job_skills
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND NOT is_jwt_revoked()
    AND EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_id
        AND (
          jl.status = 'aktiv'
          OR jl.company_id = auth.uid()
          OR current_user_role() IN ('admin', 'recruiter')
        )
    )
  );

CREATE POLICY "job_skills_company_write" ON job_skills
  FOR ALL USING (
    NOT is_jwt_revoked()
    AND current_user_role() = 'unternehmen'
    AND EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_id AND jl.company_id = auth.uid()
    )
  );

CREATE POLICY "job_skills_admin" ON job_skills
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- MATCHES RLS
-- ════════════════════════════════════════════════════════════

-- Kandidaten sehen eigene Matches
CREATE POLICY "matches_candidate_select" ON matches
  FOR SELECT USING (
    candidate_id = auth.uid() AND NOT is_jwt_revoked()
  );

-- Unternehmen sehen Matches ihrer Stellenausschreibungen
CREATE POLICY "matches_company_select" ON matches
  FOR SELECT USING (
    current_user_role() = 'unternehmen'
    AND NOT is_jwt_revoked()
    AND EXISTS (
      SELECT 1 FROM job_listings jl
      WHERE jl.id = job_listing_id AND jl.company_id = auth.uid()
    )
  );

-- Recruiter sehen alle Matches
CREATE POLICY "matches_recruiter_select" ON matches
  FOR SELECT USING (
    current_user_role() = 'recruiter' AND NOT is_jwt_revoked()
  );

-- Unternehmen können Status updaten (Interesse signalisieren: interessiert, abgelehnt)
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
  );

CREATE POLICY "matches_admin_all" ON matches
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- SUBSCRIPTIONS RLS
-- INSERT/UPDATE via Service Role (Stripe Webhook Edge Function)
-- ════════════════════════════════════════════════════════════

CREATE POLICY "subscriptions_company_select" ON subscriptions
  FOR SELECT USING (
    company_id = auth.uid() AND NOT is_jwt_revoked()
  );

CREATE POLICY "subscriptions_admin_all" ON subscriptions
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- STRIPE_EVENTS RLS
-- Keine User INSERT/UPDATE/DELETE → Service Role (Webhook) schreibt
-- ════════════════════════════════════════════════════════════

CREATE POLICY "stripe_events_admin_select" ON stripe_events
  FOR SELECT USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- DOCUMENTS RLS
-- ════════════════════════════════════════════════════════════

-- Kandidat: eigene Dokumente CRUD
CREATE POLICY "documents_candidate_own" ON documents
  FOR ALL USING (
    candidate_id = auth.uid() AND NOT is_jwt_revoked()
  );

-- Recruiter sehen Dokumente aller Kandidaten
CREATE POLICY "documents_recruiter_select" ON documents
  FOR SELECT USING (
    current_user_role() = 'recruiter' AND NOT is_jwt_revoked()
  );

-- Unternehmen sehen Dokumente bei enthülltem Match (FR27)
CREATE POLICY "documents_company_revealed" ON documents
  FOR SELECT USING (
    current_user_role() = 'unternehmen'
    AND NOT is_jwt_revoked()
    AND company_has_revealed_match(candidate_id)
  );

CREATE POLICY "documents_admin_all" ON documents
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- AUDIT_LOG RLS (immutable: kein UPDATE/DELETE Policy)
-- ════════════════════════════════════════════════════════════

CREATE POLICY "audit_log_admin_select" ON audit_log
  FOR SELECT USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- JWT_REVOCATIONS RLS
-- ════════════════════════════════════════════════════════════

CREATE POLICY "jwt_revocations_admin_all" ON jwt_revocations
  FOR ALL USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );

-- ════════════════════════════════════════════════════════════
-- LOGIN_ATTEMPTS RLS
-- ════════════════════════════════════════════════════════════

CREATE POLICY "login_attempts_admin_select" ON login_attempts
  FOR SELECT USING (
    current_user_role() = 'admin' AND NOT is_jwt_revoked()
  );
