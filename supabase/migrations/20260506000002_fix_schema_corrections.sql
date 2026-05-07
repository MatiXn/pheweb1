-- Story 1-2 Review Patches: Schema corrections

-- P8: match_score should use NUMERIC(5,4) not FLOAT for precision
ALTER TABLE matches ALTER COLUMN match_score TYPE NUMERIC(5,4) USING match_score::NUMERIC(5,4);

-- P9: stripe_customer_id should have UNIQUE constraint
ALTER TABLE subscriptions ADD CONSTRAINT IF NOT EXISTS subscriptions_stripe_customer_id_unique UNIQUE (stripe_customer_id);

-- P7: documents table missing updated_at column and trigger
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TRIGGER set_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
