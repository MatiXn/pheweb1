-- Migration 020: company_description Spalte zu profiles hinzufügen
-- Story 4.1: AC1 — Unternehmensbeschreibung (max 500 Zeichen)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_description text CHECK (length(company_description) <= 500);
