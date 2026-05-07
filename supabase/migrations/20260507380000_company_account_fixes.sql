-- Migration: Company Account Management — Fixes
-- Story 7.4 Code-Review Follow-ups:
--   P1: get_admin_company_queue DISTINCT ON (Multi-User-Unternehmen)
--   P2: block_company — Job-Pausing hinzufügen
--   P3: Backfill — is_active=false Unternehmen auf 'eingefroren' (statt 'ausstehend')
--   P4: block_company — Mindestlänge 10 Zeichen für p_reason
--   D1: get_admin_company_queue — 'aktiv' einschließen (für Einfrieren-Workflow)
--   D3: activate_company — jwt_revocations löschen (Force-Relogin nach Einfrieren aufheben)

-- ── P3: Backfill-Fix ──────────────────────────────────────────────────────────
-- Unternehmen die vor 7.4 via is_active=false deaktiviert waren, bleiben fälschlicherweise
-- als 'ausstehend'. Sie werden jetzt korrekt als 'eingefroren' klassifiziert.
UPDATE companies
SET account_status = 'eingefroren'
WHERE is_active = false
  AND account_status = 'ausstehend';

-- ── P1 + D1: get_admin_company_queue ─────────────────────────────────────────
-- Änderungen:
--   - DISTINCT ON (c.id) → verhindert Duplikate bei Unternehmen mit mehreren Nutzern
--   - WHERE c.account_status IN ('ausstehend', 'aktiv') → schließt aktive Unternehmen ein
--     (für den Einfrieren-Workflow aus AC#2)
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

  -- DISTINCT ON (c.id) wählt pro Unternehmen genau einen Nutzer (ältester zuerst).
  -- Äußere ORDER BY sortiert Ergebnismenge nach Registrierungsdatum.
  RETURN QUERY
  SELECT q.* FROM (
    SELECT DISTINCT ON (c.id)
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
    WHERE c.account_status IN ('ausstehend', 'aktiv')
    ORDER BY c.id, u.created_at ASC
  ) q
  ORDER BY q.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_company_queue() TO authenticated;

-- ── D3: activate_company ──────────────────────────────────────────────────────
-- Änderung: jwt_revocations löschen, sodass reaktivierte Nutzer sich wieder
-- einloggen können ohne Force-Relogin nach Freeze→Activate-Zyklus.
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

  -- JWT-Revocations löschen: Nutzer können sich nach Reaktivierung wieder einloggen
  DELETE FROM jwt_revocations
  WHERE user_id IN (SELECT id FROM users WHERE company_id = p_company_id);

  -- Audit-Log
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

-- ── P2 + P4: block_company ────────────────────────────────────────────────────
-- Änderungen:
--   P2: UPDATE jobs ... status = 'paused' hinzugefügt (war in freeze_company, fehlte hier)
--   P4: Mindestlänge 10 Zeichen für p_reason (war bisher nur nicht-leer geprüft)
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
  -- P4: Mindestlänge 10 Zeichen
  IF p_reason IS NULL OR length(trim(p_reason)) < 10 THEN
    RAISE EXCEPTION 'Sperrgrund muss mindestens 10 Zeichen lang sein' USING ERRCODE = 'P0001';
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

  -- P2: Aktive Jobs auf 'paused' setzen (wie in freeze_company)
  UPDATE jobs
  SET status = 'paused', updated_at = now()
  WHERE company_id = p_company_id
    AND status::text IN ('draft', 'active');

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
