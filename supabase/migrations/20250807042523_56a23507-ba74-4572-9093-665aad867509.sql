-- Create subscription plans enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'student', 'premium', 'institutional');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Create payment method enum
CREATE TYPE public.payment_method AS ENUM ('bank_transfer', 'momo', 'zalopay', 'vnpay', 'paypal');

-- Create billing cycle enum
CREATE TYPE public.billing_cycle AS ENUM ('monthly', 'yearly');

-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  billing_cycle billing_cycle DEFAULT 'monthly',
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_code TEXT NOT NULL UNIQUE,
  subscription_tier subscription_tier NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  payment_method payment_method NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_proof_url TEXT,
  admin_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_type, period_start)
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscribers
CREATE POLICY "Users can view their own subscription"
ON public.subscribers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscribers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscribers FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
ON public.payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
ON public.payments FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for usage tracking
CREATE POLICY "Users can view their own usage"
ON public.usage_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.usage_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update usage tracking"
ON public.usage_tracking FOR UPDATE
USING (true);

-- Create function to generate order code
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'AC' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to check feature usage limit
CREATE OR REPLACE FUNCTION check_feature_limit(
  p_user_id UUID,
  p_feature_type TEXT,
  p_subscription_tier subscription_tier
) RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  limit_count INTEGER;
  period_start TIMESTAMPTZ;
BEGIN
  -- Set period start to beginning of current month
  period_start := DATE_TRUNC('month', NOW());
  
  -- Get current usage for this month
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id 
    AND feature_type = p_feature_type 
    AND period_start = DATE_TRUNC('month', NOW());
  
  -- Set limits based on subscription tier and feature type
  CASE p_subscription_tier
    WHEN 'free' THEN
      CASE p_feature_type
        WHEN 'outline_generator' THEN limit_count := 3;
        WHEN 'writing_projects' THEN limit_count := 2;
        WHEN 'grammar_check' THEN limit_count := 5;
        WHEN 'document_summarizer' THEN limit_count := 0;
        WHEN 'citation_manager' THEN limit_count := 0;
        WHEN 'plagiarism_check' THEN limit_count := 0;
        ELSE limit_count := 0;
      END CASE;
    WHEN 'student' THEN
      CASE p_feature_type
        WHEN 'outline_generator' THEN limit_count := 999999; -- Unlimited
        WHEN 'writing_projects' THEN limit_count := 20;
        WHEN 'grammar_check' THEN limit_count := 999999; -- Unlimited
        WHEN 'document_summarizer' THEN limit_count := 50;
        WHEN 'citation_manager' THEN limit_count := 999999; -- Unlimited
        WHEN 'plagiarism_check' THEN limit_count := 10;
        ELSE limit_count := 999999;
      END CASE;
    WHEN 'premium' THEN
      limit_count := 999999; -- Unlimited for all features
    WHEN 'institutional' THEN
      limit_count := 999999; -- Unlimited for all features
    ELSE
      limit_count := 0;
  END CASE;
  
  RETURN current_usage < limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature_type TEXT
) RETURNS VOID AS $$
DECLARE
  period_start TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  period_start := DATE_TRUNC('month', NOW());
  period_end := period_start + INTERVAL '1 month' - INTERVAL '1 second';
  
  INSERT INTO usage_tracking (user_id, feature_type, usage_count, period_start, period_end)
  VALUES (p_user_id, p_feature_type, 1, period_start, period_end)
  ON CONFLICT (user_id, feature_type, period_start)
  DO UPDATE SET 
    usage_count = usage_tracking.usage_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();