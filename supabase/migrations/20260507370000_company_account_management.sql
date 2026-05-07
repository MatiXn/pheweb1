-- Migration: Company Account Management
-- Story 7.4: Unternehmens-Aktivierung & Konto-Management
-- Adds account_status column to companies + 4 admin functions

-- ── 1. account_status Spalte hinzufügen ──────────────────────────────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS account_status TEXT
    DEFAULT 'ausstehend'
    CHECK (account_status IN ('ausstehend', 'aktiv', 'eingefroren', 'gesperrt'));

-- Backfill: Bestehende aktive Unternehmen auf 'aktiv' setzen
UPDATE companies SET account_status = 'aktiv' WHERE is_active = true;

-- ── 2. get_admin_company_queue() ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_company_queue()
RETURNS TABLE (
  company_id           uuid,
  company_name         text,
  industry             text,
  size                 text,
  website              text,
  contact_person_name  text,
  contact_person_phone text,
  user_email           text,
  user_first_name      text,
  user_last_name       text,
  account_status       text,
  created_at           timestamptz,
  welcome_sent_at      timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.industry,
    c.size,
    c.website,
    c.contact_person_name,
    c.contact_person_phone,
    u.email,
    u.first_name,
    u.last_name,
    c.account_status,
    c.created_at,
    c.welcome_sent_at
  FROM companies c
  JOIN users u ON u.company_id = c.id
  WHERE c.account_status = 'ausstehend'
  ORDER BY c.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_company_queue() TO authenticated;

-- ── 3. activate_company(p_company_id uuid) ───────────────────────────────────
CREATE OR REPLACE FUNCTION activate_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RAISE EXCEPTION 'Unternehmen nicht gefunden' USING ERRCODE = 'P0001';
  END IF;

  -- Company aktivieren (welcome_sent_at bleibt NULL → Cron sendet Welcome-E-Mail)
  UPDATE companies
  SET is_active = true, account_status = 'aktiv', updated_at = now()
  WHERE id = p_company_id;

  -- User-Account freischalten
  UPDATE users
  SET is_active = true
  WHERE company_id = p_company_id;

  -- Audit-Log (entity_id ist uuid, user_id ist uuid)
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'company.account.activated',
    'company',
    p_company_id,
    jsonb_build_object('activated_at', now()::text)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activate_company(uuid) TO authenticated;

-- ── 4. freeze_company(p_company_id uuid) ─────────────────────────────────────
-- HINWEIS: jobs.status Enum = {draft, active, paused, closed, filled, guarantee_triggered}
-- Verwendet 'paused' (englisch), NICHT 'pausiert'
CREATE OR REPLACE FUNCTION freeze_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RAISE EXCEPTION 'Unternehmen nicht gefunden' USING ERRCODE = 'P0001';
  END IF;

  -- Company einfrieren
  UPDATE companies
  SET is_active = false, account_status = 'eingefroren', updated_at = now()
  WHERE id = p_company_id;

  -- User-Account sperren
  UPDATE users
  SET is_active = false
  WHERE company_id = p_company_id;

  -- JWT-Revokation: alle aktiven Sessions invalidieren (FR46)
  INSERT INTO jwt_revocations (user_id, revoked_at)
  SELECT id, now()
  FROM users
  WHERE company_id = p_company_id
  ON CONFLICT (user_id) DO UPDATE SET revoked_at = now();

  -- Aktive Matches pausieren (bestehende Funktion verwenden)
  PERFORM pause_company_matches(p_company_id);

  -- Aktive Jobs auf 'paused' setzen (englischer Enum-Wert im jobs.status)
  UPDATE jobs
  SET status = 'paused', updated_at = now()
  WHERE company_id = p_company_id
    AND status::text IN ('draft', 'active');

  -- Audit-Log
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'company.account.frozen',
    'company',
    p_company_id,
    jsonb_build_object('frozen_at', now()::text)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.freeze_company(uuid) TO authenticated;

-- ── 5. block_company(p_company_id uuid, p_reason text) ───────────────────────
CREATE OR REPLACE FUNCTION block_company(p_company_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = p_company_id) THEN
    RAISE EXCEPTION 'Unternehmen nicht gefunden' USING ERRCODE = 'P0001';
  END IF;

  -- Company dauerhaft sperren
  UPDATE companies
  SET is_active = false, account_status = 'gesperrt', updated_at = now()
  WHERE id = p_company_id;

  -- User-Account sperren
  UPDATE users
  SET is_active = false
  WHERE company_id = p_company_id;

  -- JWT-Revokation
  INSERT INTO jwt_revocations (user_id, revoked_at)
  SELECT id, now()
  FROM users
  WHERE company_id = p_company_id
  ON CONFLICT (user_id) DO UPDATE SET revoked_at = now();

  -- Matches pausieren
  PERFORM pause_company_matches(p_company_id);

  -- Audit-Log mit Sperrgrund
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'company.account.blocked',
    'company',
    p_company_id,
    jsonb_build_object('reason', trim(p_reason), 'blocked_at', now()::text)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.block_company(uuid, text) TO authenticated;
