-- Migration 008: JWT Revocations (FR46)
-- Ein Eintrag pro User (PRIMARY KEY auf user_id)
-- INSERT bei Kontoeinfrierung, DELETE bei Reaktivierung
-- is_jwt_revoked() SECURITY DEFINER liest diese Tabelle ohne RLS-Check

CREATE TABLE jwt_revocations (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE jwt_revocations ENABLE ROW LEVEL SECURITY;
