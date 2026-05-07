-- Migration: Admin Monitoring Dashboard & Success-Fee-Tracking
-- Story 7.5: success_fees Tabelle, Trigger, 3 Admin-RPCs

-- ── success_fees Tabelle ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.success_fees (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id     uuid        NOT NULL UNIQUE REFERENCES public.matches(id) ON DELETE CASCADE,
  company_id   uuid        NOT NULL REFERENCES public.companies(id),
  candidate_id uuid        NOT NULL REFERENCES public.candidates(id),
  annual_salary integer    NOT NULL DEFAULT 0,
  fee_amount   integer     NOT NULL DEFAULT 0,
  fee_status   text        NOT NULL DEFAULT 'offen'
                           CHECK (fee_status IN ('offen', 'bezahlt')),
  notes        text,
  paid_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Indizes für häufige Admin-Queries
CREATE INDEX IF NOT EXISTS idx_success_fees_fee_status
  ON public.success_fees (fee_status);
CREATE INDEX IF NOT EXISTS idx_success_fees_created_at
  ON public.success_fees (created_at DESC);

-- RLS aktivieren
ALTER TABLE public.success_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nur Admins können success_fees einsehen"
  ON public.success_fees FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ── Trigger-Funktion: Auto-Eintrag bei interactions.status = 'hired' ────────
CREATE OR REPLACE FUNCTION public.trg_create_success_fee_on_hire()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_id        uuid;
  v_company_id    uuid;
  v_candidate_id  uuid;
  v_annual_salary integer;
  v_fee_amount    integer;
BEGIN
  -- Nur feuern wenn Status zu 'hired' wechselt
  IF NEW.status = 'hired' AND (OLD IS NULL OR OLD.status <> 'hired') THEN
    -- Match-Daten ermitteln
    SELECT job_id, candidate_id
    INTO v_job_id, v_candidate_id
    FROM matches WHERE id = NEW.match_id;

    IF NOT FOUND THEN
      RETURN NEW;
    END IF;

    -- company_id über jobs.company_id
    SELECT company_id INTO v_company_id
    FROM jobs WHERE id = v_job_id;

    IF NOT FOUND THEN
      RETURN NEW;
    END IF;

    -- Jahresgehalt aus candidate.salary_expectation (NULL → 0)
    SELECT COALESCE(salary_expectation, 0)
    INTO v_annual_salary
    FROM candidates WHERE id = v_candidate_id;

    IF NOT FOUND THEN
      RETURN NEW;
    END IF;

    v_fee_amount := (v_annual_salary::numeric * 0.25)::integer;

    INSERT INTO success_fees (match_id, company_id, candidate_id, annual_salary, fee_amount, fee_status)
    VALUES (NEW.match_id, v_company_id, v_candidate_id, v_annual_salary, v_fee_amount, 'offen')
    ON CONFLICT (match_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger auf interactions
CREATE OR REPLACE TRIGGER trg_interactions_hire
  AFTER INSERT OR UPDATE OF status ON public.interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_create_success_fee_on_hire();

-- ── get_admin_dashboard_metrics() ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;

  SELECT jsonb_build_object(
    'active_candidates',     (SELECT COUNT(*) FROM candidates WHERE status = 'active'),
    'pending_verifications', (SELECT COUNT(*) FROM candidates WHERE status = 'ausstehend_verifizierung'),
    'active_companies',      (SELECT COUNT(*) FROM companies WHERE account_status = 'aktiv'),
    'active_jobs',           (SELECT COUNT(*) FROM jobs WHERE status = 'active'),
    'matches_today',         (SELECT COUNT(*) FROM matches
                              WHERE created_at >= CURRENT_DATE::timestamptz
                                AND created_at < (CURRENT_DATE + 1)::timestamptz),
    'hires_this_week',       (SELECT COUNT(*) FROM interactions
                              WHERE status = 'hired'
                                AND created_at >= date_trunc('week', now()))
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_metrics() TO authenticated;

-- ── get_admin_success_fees() ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_admin_success_fees()
RETURNS TABLE (
  fee_id             uuid,
  company_name       text,
  candidate_anon_id  text,
  professional_title text,
  location_city      text,
  annual_salary      integer,
  fee_amount         integer,
  fee_status         text,
  created_at         timestamptz,
  paid_at            timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;

  RETURN QUERY
  SELECT
    sf.id,
    co.name,
    ca.anonymous_id,
    ca.professional_title,
    ca.location_city,
    sf.annual_salary,
    sf.fee_amount,
    sf.fee_status,
    sf.created_at,
    sf.paid_at
  FROM success_fees sf
  JOIN companies  co ON co.id = sf.company_id
  JOIN candidates ca ON ca.id = sf.candidate_id
  ORDER BY sf.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_success_fees() TO authenticated;

-- ── mark_success_fee_paid() ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_success_fee_paid(p_fee_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht authentifiziert' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM success_fees WHERE id = p_fee_id) THEN
    RAISE EXCEPTION 'Eintrag nicht gefunden' USING ERRCODE = 'P0001';
  END IF;

  UPDATE success_fees
  SET fee_status = 'bezahlt',
      paid_at    = now(),
      updated_at = now()
  WHERE id = p_fee_id
    AND fee_status = 'offen';

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows > 0 THEN
    INSERT INTO audit_log (user_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(),
      'success_fee.confirmed',
      'success_fee',
      p_fee_id,
      jsonb_build_object('paid_at', now()::text)
    );
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_success_fee_paid(uuid) TO authenticated;
