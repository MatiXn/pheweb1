-- Story 3-1 Review Patch: Add SIMATIC Step 7 and TIA Portal to elektrotechnik category
-- These SPS-specific skills were incorrectly seeded into 'sonstiges'
-- but BERUFSFELD_KATEGORIE_MAP maps 'SPS' to 'elektrotechnik'
INSERT INTO skills (name, category) VALUES
  ('SIMATIC Step 7', 'elektrotechnik'),
  ('TIA Portal', 'elektrotechnik')
ON CONFLICT (name) DO UPDATE SET category = EXCLUDED.category;
