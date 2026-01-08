-- Stripe Subscriptions Migration
-- This migration creates tables to manage user subscriptions and usage tracking

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'standard', 'business')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription usage tracking table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  month DATE NOT NULL,
  documents_uploaded INTEGER DEFAULT 0,
  storage_used BIGINT DEFAULT 0, -- in bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON subscription_usage(user_id, month);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for subscription_usage table  
CREATE POLICY "Users can view own usage"
  ON subscription_usage FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Service role can manage usage"
  ON subscription_usage FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at
    BEFORE UPDATE ON subscription_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get user's subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id TEXT)
RETURNS TABLE (
  id UUID,
  plan_type TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.plan_type,
    s.status,
    s.current_period_end,
    s.cancel_at_period_end
  FROM subscriptions s
  WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can upload based on plan limits
CREATE OR REPLACE FUNCTION can_user_upload(p_user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type TEXT;
  v_uploads_this_month INTEGER;
BEGIN
  -- Get user's plan
  SELECT plan_type INTO v_plan_type
  FROM subscriptions
  WHERE user_id = p_user_id;
  
  -- If no subscription found, default to free plan
  IF v_plan_type IS NULL THEN
    v_plan_type := 'free';
  END IF;
  
  -- Paid plans have unlimited uploads
  IF v_plan_type IN ('standard', 'business') THEN
    RETURN TRUE;
  END IF;
  
  -- For free plan, check monthly limit (10 uploads)
  SELECT COALESCE(documents_uploaded, 0) INTO v_uploads_this_month
  FROM subscription_usage
  WHERE user_id = p_user_id 
    AND month = DATE_TRUNC('month', CURRENT_DATE)::DATE;
  
  RETURN COALESCE(v_uploads_this_month, 0) < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment upload count
CREATE OR REPLACE FUNCTION increment_upload_count(p_user_id TEXT, p_file_size BIGINT DEFAULT 0)
RETURNS void AS $$
BEGIN
  INSERT INTO subscription_usage (user_id, month, documents_uploaded, storage_used)
  VALUES (
    p_user_id,
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    1,
    p_file_size
  )
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    documents_uploaded = subscription_usage.documents_uploaded + 1,
    storage_used = subscription_usage.storage_used + p_file_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE subscriptions IS 'Stores user subscription information from Stripe';
COMMENT ON TABLE subscription_usage IS 'Tracks monthly usage metrics per user';
COMMENT ON FUNCTION get_user_subscription IS 'Retrieves subscription details for a specific user';
COMMENT ON FUNCTION can_user_upload IS 'Checks if user has remaining upload quota for their plan';
COMMENT ON FUNCTION increment_upload_count IS 'Increments usage counter when user uploads a document';
