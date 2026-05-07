-- Migration: get_my_subscription() RPC
-- Story 8.1: Gibt die aktuelle Subscription des angemeldeten Unternehmens zurück

CREATE OR REPLACE FUNCTION public.get_my_subscription()
RETURNS TABLE (
  id                     uuid,
  tier                   text,
  status                 text,
  stripe_subscription_id text,
  stripe_customer_id     text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  SELECT company_id INTO v_company_id
  FROM users WHERE id = auth.uid();

  IF v_company_id IS NULL THEN
    -- Kein Unternehmen verknüpft (z.B. Kandidat oder Recruiter) → leeres Ergebnis
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.id,
    s.tier::text,
    s.status::text,
    s.stripe_subscription_id,
    s.stripe_customer_id,
    s.current_period_start,
    s.current_period_end,
    s.created_at
  FROM subscriptions s
  WHERE s.company_id = v_company_id
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_subscription() TO authenticated;
