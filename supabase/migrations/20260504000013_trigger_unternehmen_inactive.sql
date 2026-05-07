-- Migration 013: Trigger-Update für Unternehmen/Recruiter-Rolle
-- Unternehmen und Recruiter starten mit is_active = false (pending Admin-Approval)
-- company_name wird aus raw_user_meta_data gelesen

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role user_role;
  v_is_active BOOLEAN;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'kandidat')::user_role;

  -- Unternehmen und Recruiter starten als inaktiv (pending Admin-Approval)
  v_is_active := CASE v_role
    WHEN 'unternehmen' THEN false
    WHEN 'recruiter'   THEN false
    ELSE true
  END;

  INSERT INTO public.profiles (id, role, email, company_name, is_active)
  VALUES (
    NEW.id,
    v_role,
    NEW.email,
    NEW.raw_user_meta_data->>'company_name',
    v_is_active
  );
  RETURN NEW;
END;
$$;
