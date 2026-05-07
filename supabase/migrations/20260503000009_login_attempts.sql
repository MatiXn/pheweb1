-- Migration 009: Login Attempts (NFR25 Lockout)
-- 5 Fehlversuche in 15 Min → 30 Min Sperre
-- Enforced via Edge Function + check_rate_limit() aus Migration 010

CREATE TABLE login_attempts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   TEXT,
  success      BOOLEAN NOT NULL DEFAULT FALSE
);

-- KRITISCH für Performance: Queries filtern auf last-15-minutes + user_id
CREATE INDEX idx_login_attempts_user_recent
  ON login_attempts(user_id, attempted_at DESC);

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
