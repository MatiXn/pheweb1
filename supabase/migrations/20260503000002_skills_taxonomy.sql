-- Migration 002: Skills Taxonomy
-- Creates skill_category enum, skills table, candidate_skills junction

-- ── Skill Category Enum ────────────────────────────────────────
CREATE TYPE skill_category AS ENUM (
  'elektrotechnik',
  'tga',
  'shk',
  'mechatronik',
  'it',
  'sonstiges'
);

-- ── Skills Taxonomy ────────────────────────────────────────────
CREATE TABLE skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  category    skill_category NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Kandidat Skills (Junction) ─────────────────────────────────
CREATE TABLE candidate_skills (
  candidate_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id      UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (candidate_id, skill_id)
);

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_skills ENABLE ROW LEVEL SECURITY;
