-- Migration 019: DSGVO-Einwilligung — Felder + Consent-RPC
-- Story 3.4: AC2 — dsgvo_consent_at, profile_status, audit_log 'candidate.consent.given'

-- ── 1. DSGVO-Felder zu profiles hinzufügen ───────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dsgvo_consent BOOLEAN DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dsgvo_consent_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_status TEXT DEFAULT 'entwurf'
  CHECK (profile_status IN ('entwurf', 'ausstehend_verifizierung', 'aktiv', 'abgelehnt', 'gesperrt'));

-- ── 2. SECURITY DEFINER RPC: Einwilligung erteilen ──────────
-- Schreibt atomisch: profiles UPDATE + audit_log INSERT
-- SECURITY DEFINER nötig, da audit_log nur service_role-Zugriff hat (FR59)
-- Muster analog zu record_login_attempt() aus Migration 015
CREATE OR REPLACE FUNCTION public.candidate_give_consent()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_role    user_role;
BEGIN
  -- Nur für authentifizierte User
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  -- Nur Kandidaten dürfen Einwilligung erteilen
  SELECT role INTO v_role FROM profiles WHERE id = v_user_id;
  IF v_role IS DISTINCT FROM 'kandidat' THEN
    RETURN jsonb_build_object('error', 'not_a_candidate');
  END IF;

  -- Idempotent: bereits erteilt → direkt zurückgeben
  -- (kein erneutes audit_log-Insert bei Doppelklick)
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = v_user_id AND dsgvo_consent_at IS NOT NULL
  ) THEN
    RETURN jsonb_build_object('success', true, 'already_consented', true);
  END IF;

  -- Einwilligung speichern + Status wechseln
  UPDATE profiles SET
    dsgvo_consent    = TRUE,
    dsgvo_consent_at = NOW(),
    profile_status   = 'ausstehend_verifizierung'
  WHERE id = v_user_id;

  -- Audit-Log schreiben (service_role Kontext durch SECURITY DEFINER)
  INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (
    v_user_id,
    'candidate.consent.given',
    'profile',
    v_user_id,
    jsonb_build_object(
      'consent_version', '1.0',
      'consent_at', NOW()::text
    )
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Authentifizierte User dürfen die Funktion aufrufen
GRANT EXECUTE ON FUNCTION public.candidate_give_consent() TO authenticated;
