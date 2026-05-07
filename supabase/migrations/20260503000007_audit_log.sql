-- Migration 007: Audit Log
-- Immutable append-only log (FR59)
-- Service Role schreibt (bypassed RLS), User können nicht löschen/updaten

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   UUID,
  metadata    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index für schnelle Actor- und Target-Abfragen
CREATE INDEX idx_audit_log_actor  ON audit_log(actor_id, created_at DESC);
CREATE INDEX idx_audit_log_target ON audit_log(target_type, target_id, created_at DESC);

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
