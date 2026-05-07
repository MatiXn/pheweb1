-- Migration: candidate_status Enum erweitern (Story 7.2 — Teil 1/2)
-- MUSS in eigener Transaktion committed werden, bevor der neue Wert genutzt werden kann.
-- Supabase apply_migration name: candidate_status_add_dokumente_erforderlich
ALTER TYPE candidate_status ADD VALUE IF NOT EXISTS 'dokumente_erforderlich';
