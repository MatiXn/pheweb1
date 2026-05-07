-- Migration 015: Login-Security-Funktionen
-- record_login_attempt: schreibt Fehlversuch, gibt TRUE zurück wenn gesperrt
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_failure_count INT;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  INSERT INTO public.login_attempts (user_id, ip_address, success)
  VALUES (v_user_id, p_ip_address, p_success);

  IF NOT p_success THEN
    SELECT COUNT(*) INTO v_failure_count
    FROM public.login_attempts
    WHERE user_id = v_user_id
      AND success = false
      AND attempted_at > NOW() - INTERVAL '15 minutes';

    RETURN v_failure_count >= 5;
  END IF;

  RETURN FALSE;
END;
$$;

-- check_login_lockout: nur prüfen, kein Schreiben
CREATE OR REPLACE FUNCTION public.check_login_lockout(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_failure_count INT;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*) INTO v_failure_count
  FROM public.login_attempts
  WHERE user_id = v_user_id
    AND success = false
    AND attempted_at > NOW() - INTERVAL '15 minutes';

  RETURN v_failure_count >= 5;
END;
$$;
