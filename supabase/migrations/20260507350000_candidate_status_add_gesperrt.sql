-- Migration: candidate_status Enum um 'gesperrt' erweitern (Story 7.3 — Teil 1/2)
-- KRITISCH: ALTER TYPE ... ADD VALUE muss in eigener Transaktion committed sein
-- bevor die zweite Migration (block_candidate-Funktion) DML mit dem neuen Wert nutzt.

ALTER TYPE candidate_status ADD VALUE IF NOT EXISTS 'gesperrt';
