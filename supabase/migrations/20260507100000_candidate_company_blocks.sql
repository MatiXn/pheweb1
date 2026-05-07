-- Migration: candidate_company_blocks
-- Story 6.4: Kandidat lehnt Unternehmen ab oder blockiert es
-- Creates: candidate_company_blocks table, decline_match_as_recruiter(), block_company_for_candidate()

-- ── 1. Tabelle ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS candidate_company_blocks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid        NOT NULL,
  company_id   uuid        NOT NULL,
  recruiter_id uuid        NOT NULL,
  match_id     uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, company_id)
);

ALTER TABLE candidate_company_blocks ENABLE ROW LEVEL SECURITY;

-- Recruiter liest nur eigene Blocks
CREATE POLICY "recruiter_own_blocks"
  ON candidate_company_blocks FOR SELECT
  USING (recruiter_id = auth.uid());

-- ── 2. SECURITY DEFINER: decline_match_as_recruiter ──────────────────────────

CREATE OR REPLACE FUNCTION decline_match_as_recruiter(p_match_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  -- Prüfen ob Recruiter Zugriff auf diesen Match hat
  IF NOT EXISTS (
    SELECT 1 FROM recruiter_match_overview
    WHERE match_id = p_match_id AND recruiter_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Zugriff verweigert' USING ERRCODE = 'P0003';
  END IF;

  -- Append-only: candidate_declined Status setzen
  INSERT INTO interactions (match_id, status, set_by)
  VALUES (p_match_id, 'candidate_declined', auth.uid());
END;
$$;

-- ── 3. SECURITY DEFINER: block_company_for_candidate ─────────────────────────

CREATE OR REPLACE FUNCTION block_company_for_candidate(
  p_match_id   uuid,
  p_company_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_candidate_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;

  -- Recruiter-Zugriffsprüfung + candidate_id ermitteln
  SELECT candidate_id INTO v_candidate_id
  FROM recruiter_match_overview
  WHERE match_id = p_match_id AND recruiter_id = auth.uid();

  IF v_candidate_id IS NULL THEN
    RAISE EXCEPTION 'Zugriff verweigert' USING ERRCODE = 'P0003';
  END IF;

  -- Block anlegen (idempotent via ON CONFLICT)
  INSERT INTO candidate_company_blocks (candidate_id, company_id, recruiter_id, match_id)
  VALUES (v_candidate_id, p_company_id, auth.uid(), p_match_id)
  ON CONFLICT (candidate_id, company_id) DO NOTHING;

  -- Match ablehnen (append-only)
  INSERT INTO interactions (match_id, status, set_by)
  VALUES (p_match_id, 'candidate_declined', auth.uid());

  -- Audit-Log
  INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'candidate.company.blocked',
    'company',
    p_company_id,
    jsonb_build_object(
      'candidate_id', v_candidate_id,
      'match_id',     p_match_id
    )
  );
END;
$$;
