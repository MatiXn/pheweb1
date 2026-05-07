-- Migration 016: Candidate Onboarding Fields + Skills Seed
-- Adds wizard-specific columns to profiles table and seeds initial skills data

-- ── Neue Spalten in profiles ──────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_field TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary_expectation INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'EUR';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS desired_location_state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS radius_km INTEGER DEFAULT 50;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- ── Skills Seed-Daten ─────────────────────────────────────────
-- Elektrotechnik
INSERT INTO skills (name, category) VALUES
  ('SPS Siemens S7', 'elektrotechnik'),
  ('SPS Beckhoff TwinCAT', 'elektrotechnik'),
  ('Schaltpläne lesen', 'elektrotechnik'),
  ('Antriebstechnik', 'elektrotechnik'),
  ('Niederspannungsinstallation', 'elektrotechnik'),
  ('E-Plan P8', 'elektrotechnik'),
  ('Frequenzumrichter', 'elektrotechnik')
ON CONFLICT (name) DO NOTHING;

-- TGA
INSERT INTO skills (name, category) VALUES
  ('Lüftungsanlagen', 'tga'),
  ('Klimatechnik', 'tga'),
  ('Gebäudeautomation', 'tga'),
  ('MSR-Technik', 'tga'),
  ('BIM/AutoCAD', 'tga'),
  ('Hydraulik Heizung', 'tga')
ON CONFLICT (name) DO NOTHING;

-- SHK
INSERT INTO skills (name, category) VALUES
  ('Sanitärinstallation', 'shk'),
  ('Heizungsinstallation', 'shk'),
  ('Rohrleitungsbau', 'shk'),
  ('Wärmepumpen', 'shk'),
  ('Solar/Solarthermie', 'shk'),
  ('Gas-Wasserinstallation', 'shk')
ON CONFLICT (name) DO NOTHING;

-- Mechatronik
INSERT INTO skills (name, category) VALUES
  ('Hydraulik & Pneumatik', 'mechatronik'),
  ('CNC-Programmierung', 'mechatronik'),
  ('Roboterprogrammierung', 'mechatronik'),
  ('Schweißtechnik', 'mechatronik'),
  ('Maschinenwartung', 'mechatronik'),
  ('Hydraulikschaltpläne', 'mechatronik')
ON CONFLICT (name) DO NOTHING;

-- Sonstiges (fuer Kaeltetechnik + SPS als Berufsfeld)
INSERT INTO skills (name, category) VALUES
  ('Kälteanlagen Wartung', 'sonstiges'),
  ('Kältemittelhandhabung (Schein)', 'sonstiges'),
  ('Verdichtertechnik', 'sonstiges'),
  ('Kälteanlagen Installation', 'sonstiges'),
  ('SIMATIC Step 7', 'sonstiges'),
  ('TIA Portal', 'sonstiges')
ON CONFLICT (name) DO NOTHING;
