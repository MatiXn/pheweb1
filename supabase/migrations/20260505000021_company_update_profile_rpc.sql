-- Migration 021: SECURITY DEFINER RPC company_update_profile
-- Story 4.1: AC2 — Atomisches UPDATE profiles + INSERT audit_log
-- SECURITY DEFINER nötig, da audit_log nur service_role-Zugriff hat
CREATE OR REPLACE FUNCTION public.company_update_profile(
  p_company_name  TEXT,
  p_industry      TEXT,
  p_location      TEXT,
  p_description   TEXT,
  p_contact_name  TEXT,
  p_website       TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  IF (SELECT role FROM profiles WHERE id = v_user_id) != 'unternehmen' THEN
    RETURN json_build_object('success', false, 'error', 'unauthorized');
  END IF;
  UPDATE profiles SET
    company_name        = p_company_name,
    industry            = p_industry,
    location            = p_location,
    company_description = NULLIF(trim(p_description), ''),
    full_name           = NULLIF(trim(p_contact_name), ''),
    website             = NULLIF(trim(p_website), ''),
    updated_at          = now()
  WHERE id = v_user_id;
  INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata)
  VALUES (
    v_user_id,
    'company.profile.updated',
    'profile',
    v_user_id::text,
    json_build_object('company_name', p_company_name, 'industry', p_industry)
  );
  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.company_update_profile(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
