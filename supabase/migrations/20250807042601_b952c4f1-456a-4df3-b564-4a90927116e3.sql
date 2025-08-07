-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN 'AC' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

-- Fix check_feature_limit function
CREATE OR REPLACE FUNCTION check_feature_limit(
  p_user_id UUID,
  p_feature_type TEXT,
  p_subscription_tier subscription_tier
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_usage INTEGER;
  limit_count INTEGER;
  period_start TIMESTAMPTZ;
BEGIN
  -- Set period start to beginning of current month
  period_start := DATE_TRUNC('month', NOW());
  
  -- Get current usage for this month
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM public.usage_tracking
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
$$;

-- Fix increment_feature_usage function
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature_type TEXT
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  period_start TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  period_start := DATE_TRUNC('month', NOW());
  period_end := period_start + INTERVAL '1 month' - INTERVAL '1 second';
  
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_count, period_start, period_end)
  VALUES (p_user_id, p_feature_type, 1, period_start, period_end)
  ON CONFLICT (user_id, feature_type, period_start)
  DO UPDATE SET 
    usage_count = public.usage_tracking.usage_count + 1,
    updated_at = NOW();
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;