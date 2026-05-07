-- Migration 012: Profile-Trigger reparieren
-- handle_new_auth_user() inserierte fälschlicherweise in 'users' und 'companies' (existieren nicht)
-- Korrektur: Insert in 'profiles' mit korrektem user_role Enum (kandidat/unternehmen/recruiter/admin)
-- Trigger on_auth_user_created bleibt bestehen — nur die Funktion wird ersetzt

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'kandidat')::user_role,
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
