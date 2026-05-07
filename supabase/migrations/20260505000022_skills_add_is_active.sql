-- Story 4-2: Skills-Taxonomie — add is_active column for soft-deactivation
-- Admins can deactivate skills without losing historical candidate_skills / job_skills data

ALTER TABLE skills ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
