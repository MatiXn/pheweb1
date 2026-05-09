-- Migration: Bank Transfer Spalten zu subscriptions hinzufügen
-- Story 8.2: Banküberweisung als alternative Zahlungsmethode
-- Muss NACH 20260509000000 laufen (Enum muss committed sein)

-- Spalten hinzufügen
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS bank_transfer_reference       TEXT,
  ADD COLUMN IF NOT EXISTS bank_transfer_requested_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bank_transfer_email_sent_at   TIMESTAMPTZ;

-- Index für Admin-Abfragen auf ausstehende Überweisungen
CREATE INDEX IF NOT EXISTS idx_subscriptions_bank_transfer_status
  ON subscriptions (status)
  WHERE status = 'ausstehend_zahlung';
