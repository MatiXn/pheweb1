-- Migration: RPCs für Banküberweisung
-- Story 8.2: initiate_bank_transfer + admin_confirm_bank_transfer

-- ─────────────────────────────────────────────────────────────────
-- RPC: initiate_bank_transfer
-- Aufgerufen vom Unternehmensvertreter; legt ausstehende Subscription an
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.initiate_bank_transfer(p_tier subscription_tier)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id   UUID;
  v_reference    TEXT;
  v_sub_id       UUID;
  v_existing_id  UUID;
BEGIN
  -- Auth-Check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  -- Unternehmen des eingeloggten Nutzers ermitteln
  SELECT company_id INTO v_company_id
  FROM users WHERE id = auth.uid();

  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'Kein Unternehmen gefunden' USING ERRCODE = 'P0002';
  END IF;

  -- Prüfen ob bereits eine ausstehende Überweisung existiert
  SELECT id INTO v_existing_id
  FROM subscriptions
  WHERE company_id = v_company_id
    AND status = 'ausstehend_zahlung'
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'Bereits eine ausstehende Banküberweisung vorhanden' USING ERRCODE = 'P0003';
  END IF;

  -- Referenz-ID generieren: PHE-{XXXXXXXX}-{TIER}
  v_reference := 'PHE-' || UPPER(LEFT(v_company_id::TEXT, 8)) || '-' || UPPER(p_tier::TEXT);

  -- Subscription-Eintrag anlegen
  INSERT INTO subscriptions (
    company_id,
    tier,
    status,
    bank_transfer_reference,
    bank_transfer_requested_at,
    expires_at
  ) VALUES (
    v_company_id,
    p_tier,
    'ausstehend_zahlung',
    v_reference,
    NOW(),
    NOW() + INTERVAL '14 days'
  )
  RETURNING id INTO v_sub_id;

  RETURN v_sub_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.initiate_bank_transfer(subscription_tier) TO authenticated;

-- ─────────────────────────────────────────────────────────────────
-- RPC: admin_confirm_bank_transfer
-- Nur für Admins; aktiviert Subscription + Company nach Zahlungseingang
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_confirm_bank_transfer(p_subscription_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub          RECORD;
  v_admin_role   TEXT;
BEGIN
  -- Admin-Check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  SELECT role INTO v_admin_role
  FROM users WHERE id = auth.uid();

  IF v_admin_role != 'admin' THEN
    RAISE EXCEPTION 'Nur Admins können Zahlungen bestätigen' USING ERRCODE = 'P0004';
  END IF;

  -- Subscription laden
  SELECT * INTO v_sub
  FROM subscriptions
  WHERE id = p_subscription_id
    AND status = 'ausstehend_zahlung';

  IF v_sub IS NULL THEN
    RAISE EXCEPTION 'Subscription nicht gefunden oder nicht im Status ausstehend_zahlung' USING ERRCODE = 'P0005';
  END IF;

  -- Subscription aktivieren (90 Tage Laufzeit)
  UPDATE subscriptions
  SET
    status     = 'aktiv',
    starts_at  = NOW(),
    expires_at = NOW() + INTERVAL '90 days',
    updated_at = NOW()
  WHERE id = p_subscription_id;

  -- Company-Profil aktivieren
  UPDATE profiles
  SET
    subscription_tier = v_sub.tier,
    account_status    = 'aktiv',
    updated_at        = NOW()
  WHERE id = v_sub.company_id
    AND account_status != 'aktiv';

  -- Audit-Log
  INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    performed_by,
    metadata
  ) VALUES (
    'payment.bank_transfer.confirmed',
    'company',
    v_sub.company_id,
    auth.uid(),
    jsonb_build_object(
      'subscription_id', p_subscription_id,
      'tier', v_sub.tier::text,
      'reference', v_sub.bank_transfer_reference
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_confirm_bank_transfer(UUID) TO authenticated;
