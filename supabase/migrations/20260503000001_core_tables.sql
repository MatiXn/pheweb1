-- Migration 001: Core Tables
-- Creates uuid-ossp extension, user_role enum, profiles table

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── User Role Enum ─────────────────────────────────────────────
CREATE TYPE user_role AS ENUM (
  'kandidat',
  'unternehmen',
  'recruiter',
  'admin'
);

-- ── Profiles (extends auth.users 1:1) ─────────────────────────
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                user_role NOT NULL,
  full_name           TEXT,
  email               TEXT,
  phone               TEXT,

  -- Kandidat-specific (NULL for other roles)
  location            TEXT,
  years_experience    INTEGER,
  availability_status TEXT DEFAULT 'verfügbar',
  bio                 TEXT,

  -- Unternehmen/Recruiter-specific (NULL for other roles)
  company_name        TEXT,
  industry            TEXT,
  company_size        TEXT,
  website             TEXT,

  -- Common
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at (reused by all subsequent migrations)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
