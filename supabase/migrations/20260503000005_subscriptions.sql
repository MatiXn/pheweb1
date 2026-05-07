-- Migration 005: Subscriptions + Stripe Events
-- Creates subscription enums, subscriptions table, stripe_events table (FR47 Idempotenz)

-- ── Subscription Tier + Status Enums ──────────────────────────
CREATE TYPE subscription_tier AS ENUM (
  'basis',
  'professional',
  'enterprise'
);

CREATE TYPE subscription_status AS ENUM (
  'aktiv',
  'ablaufend',
  'abgelaufen',
  'eingefroren'
);

-- ── Subscriptions ──────────────────────────────────────────────
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id              UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tier                    subscription_tier NOT NULL DEFAULT 'basis',
  status                  subscription_status NOT NULL DEFAULT 'aktiv',
  stripe_subscription_id  TEXT UNIQUE,
  stripe_customer_id      TEXT,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Stripe Events (Idempotenz — FR47) ─────────────────────────
-- stripe_event_id UNIQUE verhindert Doppelverarbeitung bei Webhook-Retries
CREATE TABLE stripe_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type      TEXT NOT NULL,
  payload         JSONB,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS aktivieren (Policies in Migration 010)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
