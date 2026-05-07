-- Migration 017: Schritt-4-Felder + Soft Skills Seed
-- Fügt available_from, email_match_alerts, email_interest_alerts zu profiles hinzu
-- Seeded Soft Skills in Kategorie 'it' (bereits im skill_category ENUM vorhanden)

-- ── Neue Spalten in profiles ──────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available_from DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_match_alerts BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_interest_alerts BOOLEAN DEFAULT TRUE;

-- ── Soft Skills Seed (Kategorie 'it') ────────────────────────
INSERT INTO skills (name, category) VALUES
  ('Teamfähigkeit', 'it'),
  ('Kommunikationsstärke', 'it'),
  ('Selbstständiges Arbeiten', 'it'),
  ('Zuverlässigkeit', 'it'),
  ('Belastbarkeit', 'it'),
  ('Flexibilität', 'it'),
  ('Lernbereitschaft', 'it'),
  ('Kundenorientierung', 'it'),
  ('Problemlösungsfähigkeit', 'it'),
  ('Sorgfalt', 'it')
ON CONFLICT (name) DO NOTHING;
