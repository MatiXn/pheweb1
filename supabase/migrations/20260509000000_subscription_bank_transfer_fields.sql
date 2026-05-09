-- Migration: subscription_status Enum + Bank Transfer Spalten
-- Story 8.2: Banküberweisung als alternative Zahlungsmethode
-- HINWEIS: ALTER TYPE ADD VALUE muss in eigener Transaktion laufen
-- Daher aufgeteilt in 20260509000000 (Enum) und 20260509000001 (Spalten)

-- Enum-Wert hinzufügen (eigene Transaktion erforderlich)
ALTER TYPE subscription_status ADD VALUE IF NOT EXISTS 'ausstehend_zahlung';
