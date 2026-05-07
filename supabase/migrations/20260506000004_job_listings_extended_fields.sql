-- Migration 006-004: Job Listings — Extended Fields for Story 4.3
-- Adds fields required by the job listing creation form:
-- desired_location_state, radius_km, desired_availability, salary_min, salary_max
--
-- desired_availability TEXT values: 'sofort' | 'innerhalb_1_monat' | 'innerhalb_3_monate' | 'flexibel'
-- (kept as TEXT rather than enum for future extensibility without migrations)

ALTER TABLE job_listings
  ADD COLUMN IF NOT EXISTS desired_location_state TEXT,
  ADD COLUMN IF NOT EXISTS radius_km              INTEGER,
  ADD COLUMN IF NOT EXISTS desired_availability   TEXT,
  ADD COLUMN IF NOT EXISTS salary_min             INTEGER,
  ADD COLUMN IF NOT EXISTS salary_max             INTEGER;

-- Patch 6: add CHECK constraints to prevent invalid numeric values from direct API calls
ALTER TABLE job_listings
  ADD CONSTRAINT IF NOT EXISTS job_listings_salary_min_nonnegative CHECK (salary_min IS NULL OR salary_min >= 0),
  ADD CONSTRAINT IF NOT EXISTS job_listings_salary_max_nonnegative CHECK (salary_max IS NULL OR salary_max >= 0),
  ADD CONSTRAINT IF NOT EXISTS job_listings_radius_km_range        CHECK (radius_km IS NULL OR (radius_km >= 0 AND radius_km <= 500));
