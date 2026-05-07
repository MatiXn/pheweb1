-- Migration: candidate_status Enum erweitern (Story 7.1 — Teil 1/2)
-- MUSS in eigener Transaktion committed werden, bevor der neue Wert genutzt werden kann.
-- Supabase apply_migration name: candidate_status_add_ausstehend
ALTER TYPE candidate_status ADD VALUE IF NOT EXISTS 'ausstehend_verifizierung';
