-- Migration 014: Recruiter-Schema + Trigger-Fix
-- 1. Neue Spalte für Nutzungsvereinbarung (FR52: Audit-Artefakt)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS nutzungsvereinbarung_akzeptiert_at TIMESTAMPTZ;

-- 2. Trigger neu schreiben: recruiter is_active=true (Bug-Fix aus Migration 013)
--    + full_name aus Metadata
--    + nutzungsvereinbarung_akzeptiert_at für recruiter
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_role user_role;
  v_is_active BOOLEAN;
  v_nutzungsvereinbarung_at TIMESTAMPTZ;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'kandidat')::user_role;

  -- Nur Unternehmen starten inaktiv (pending Admin-Approval)
  -- Recruiter sind sofort aktiv (direkte Aktivierung, kein Admin-Schritt)
  v_is_active := CASE v_role
    WHEN 'unternehmen' THEN false
    ELSE true
  END;

  -- Nutzungsvereinbarung-Timestamp nur für Recruiter setzen
  v_nutzungsvereinbarung_at := CASE v_role
    WHEN 'recruiter' THEN NOW()
    ELSE NULL
  END;

  INSERT INTO public.profiles (
    id, role, email, full_name, company_name,
    is_active, nutzungsvereinbarung_akzeptiert_at
  )
  VALUES (
    NEW.id,
    v_role,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company_name',
    v_is_active,
    v_nutzungsvereinbarung_at
  );
  RETURN NEW;
END;
$$;

-- Re-bind trigger after function replacement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
