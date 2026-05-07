-- Migration 004: Matches
-- Creates match_status enum (9 states, UTF-8 Umlaut), matches table

-- ── Match Status Enum (9 Zustände) ────────────────────────────
-- KRITISCH: 'kandidat_nicht_verfügbar' mit Umlaut ü (UTF-8, Entscheidung Story 1.1 Review)
CREATE TYPE match_status AS ENUM (
  'ausstehend',
  'angesehen',
  'interessiert',
  'abgelehnt',
  'kontakt_hergestellt',
  'eingestellt',
  'nicht_eingestellt',
  'pausiert',
  'kandidat_nicht_verfügbar'
);

-- ── Matches ────────────────────────────────────────────────────
CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_listing_id  UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  status          match_status NOT NULL DEFAULT 'ausstehend',
  match_score     FLOAT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Kein doppelter Match für dasselbe Kandidat-Stelle-Paar
  UNIQUE (candidate_id, job_listing_id)
);

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
