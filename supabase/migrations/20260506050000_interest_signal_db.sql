-- Migration: Story 6.2 — Interesse-Signal & Identity-Reveal DB-Objekte
-- Erweitert interactions_audit_fn() + neue SECURITY DEFINER Funktion

-- ── 1. interactions_audit_fn() — Branch für 'interested' hinzufügen ──────────
-- CREATE OR REPLACE: überschreibt die bestehende Funktion aus Story 6.1
-- Trigger trg_interactions_audit bleibt unverändert (existiert bereits)

CREATE OR REPLACE FUNCTION public.interactions_audit_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'new' THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.set_by,
      'match.viewed',
      'match',
      NEW.match_id,
      NULL
    );
  ELSIF NEW.status = 'interested' THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
    VALUES (
      NEW.set_by,
      'match.interested',
      'match',
      NEW.match_id,
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ── 2. get_candidate_contact_for_match() — Recruiter-Kontakt nach Interest ───
-- SECURITY DEFINER: umgeht RLS, prüft selbst Zugangsberechtigung
-- Gibt Recruiter-Kontaktdaten zurück (KEIN Kandidaten-PII)
-- Voraussetzung: Unternehmen muss eigener Match-Eigentümer sein UND
--               eine Interaction mit status='interested' für diesen Match existieren

CREATE OR REPLACE FUNCTION public.get_candidate_contact_for_match(p_match_id uuid)
RETURNS TABLE(
  recruiter_first_name      text,
  recruiter_last_name       text,
  recruiter_email           text,
  recruiter_phone           text,
  candidate_anonymous_id    text,
  candidate_title           text,
  candidate_location_city   text,
  candidate_experience_years int
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id  uuid;
  v_has_interest boolean;
BEGIN
  -- Zugangsprüfung: Nur der eigene Unternehmens-User darf eigene Matches abrufen
  SELECT j.company_id INTO v_company_id
  FROM matches m
  JOIN jobs j ON j.id = m.job_id
  WHERE m.id = p_match_id;

  IF v_company_id IS NULL OR v_company_id != auth.uid() THEN
    RAISE EXCEPTION 'Zugriff verweigert' USING ERRCODE = 'P0001';
  END IF;

  -- Reveal-Gate: Nur nach 'interested' Interaction freigeben
  SELECT EXISTS(
    SELECT 1 FROM interactions
    WHERE match_id = p_match_id AND status = 'interested'
  ) INTO v_has_interest;

  IF NOT v_has_interest THEN
    RAISE EXCEPTION 'Kein Interesse signalisiert' USING ERRCODE = 'P0001';
  END IF;

  -- Recruiter-Kontaktdaten + anonymisierte Kandidaten-Daten zurückgeben
  -- KEIN Zugriff auf encrypted_* Felder — nur nicht-verschlüsselte Kandidaten-Felder
  RETURN QUERY
  SELECT
    u.first_name        AS recruiter_first_name,
    u.last_name         AS recruiter_last_name,
    u.email             AS recruiter_email,
    u.phone             AS recruiter_phone,
    c.anonymous_id      AS candidate_anonymous_id,
    c.professional_title AS candidate_title,
    c.location_city     AS candidate_location_city,
    c.experience_years  AS candidate_experience_years
  FROM matches m
  JOIN candidates c ON c.id = m.candidate_id
  JOIN users u ON u.id = c.recruiter_id
  WHERE m.id = p_match_id;
END;
$$;

-- Grants: Eingeloggte Nutzer dürfen die Funktion aufrufen (RLS-ähnliche Prüfung intern)
GRANT EXECUTE ON FUNCTION public.get_candidate_contact_for_match(uuid) TO authenticated;
