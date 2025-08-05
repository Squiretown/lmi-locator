-- Phase 1: Populate subscription plans and update user profiles structure
-- Create subscription plans
INSERT INTO public.subscription_plans (
  id,
  name,
  display_name,
  description,
  price,
  billing_period,
  is_active,
  is_popular,
  sort_order,
  features,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'free',
  'Free',
  'Perfect for getting started with basic features',
  0,
  'monthly',
  true,
  false,
  1,
  ARRAY['Basic property search', 'Save up to 10 properties', 'Email support'],
  now(),
  now()
),
(
  gen_random_uuid(),
  'professional',
  'Professional',
  'Advanced features for real estate professionals',
  2999,
  'monthly',
  true,
  true,
  2,
  ARRAY['Unlimited property searches', 'Advanced market analytics', 'Client management', 'Team collaboration', 'Priority support', 'LMI qualification tools'],
  now(),
  now()
),
(
  gen_random_uuid(),
  'enterprise',
  'Enterprise',
  'Full-featured solution for large teams and brokerages',
  9999,
  'monthly',
  true,
  false,
  3,
  ARRAY['Everything in Professional', 'White-label branding', 'API access', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee'],
  now(),
  now()
);

-- Create plan limits for each plan
WITH plan_ids AS (
  SELECT id, name FROM subscription_plans
)
INSERT INTO public.plan_limits (
  id,
  plan_id,
  resource_type,
  limit_value,
  created_at
) 
SELECT 
  gen_random_uuid(),
  p.id,
  limits.resource_type,
  limits.limit_value,
  now()
FROM plan_ids p
CROSS JOIN (
  VALUES 
    ('team_members', 1),
    ('clients', 10),
    ('marketing_campaigns', 1),
    ('searches_per_month', 50)
) AS limits(resource_type, limit_value)
WHERE p.name = 'free'

UNION ALL

SELECT 
  gen_random_uuid(),
  p.id,
  limits.resource_type,
  limits.limit_value,
  now()
FROM plan_ids p
CROSS JOIN (
  VALUES 
    ('team_members', 10),
    ('clients', 500),
    ('marketing_campaigns', 20),
    ('searches_per_month', 1000)
) AS limits(resource_type, limit_value)
WHERE p.name = 'professional'

UNION ALL

SELECT 
  gen_random_uuid(),
  p.id,
  limits.resource_type,
  limits.limit_value,
  now()
FROM plan_ids p
CROSS JOIN (
  VALUES 
    ('team_members', -1),
    ('clients', -1),
    ('marketing_campaigns', -1),
    ('searches_per_month', -1)
) AS limits(resource_type, limit_value)
WHERE p.name = 'enterprise';

-- Create plan features for each plan
WITH plan_ids AS (
  SELECT id, name FROM subscription_plans
)
INSERT INTO public.plan_features (
  id,
  plan_id,
  feature_name,
  is_enabled,
  created_at
)
SELECT 
  gen_random_uuid(),
  p.id,
  features.feature_name,
  features.is_enabled,
  now()
FROM plan_ids p
CROSS JOIN (
  VALUES 
    ('basic_search', true),
    ('advanced_analytics', false),
    ('client_management', false),
    ('team_collaboration', false),
    ('api_access', false),
    ('white_label', false),
    ('priority_support', false)
) AS features(feature_name, is_enabled)
WHERE p.name = 'free'

UNION ALL

SELECT 
  gen_random_uuid(),
  p.id,
  features.feature_name,
  features.is_enabled,
  now()
FROM plan_ids p
CROSS JOIN (
  VALUES 
    ('basic_search', true),
    ('advanced_analytics', true),
    ('client_management', true),
    ('team_collaboration', true),
    ('api_access', false),
    ('white_label', false),
    ('priority_support', true)
) AS features(feature_name, is_enabled)
WHERE p.name = 'professional'

UNION ALL

SELECT 
  gen_random_uuid(),
  p.id,
  features.feature_name,
  features.is_enabled,
  now()
FROM plan_ids p
CROSS JOIN (
  VALUES 
    ('basic_search', true),
    ('advanced_analytics', true),
    ('client_management', true),
    ('team_collaboration', true),
    ('api_access', true),
    ('white_label', true),
    ('priority_support', true)
) AS features(feature_name, is_enabled)
WHERE p.name = 'enterprise';

-- Add current_plan_id column to user_profiles if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS current_plan_id UUID REFERENCES public.subscription_plans(id);

-- Update existing users to have the free plan
UPDATE public.user_profiles 
SET current_plan_id = (
  SELECT id FROM subscription_plans WHERE name = 'free' LIMIT 1
)
WHERE current_plan_id IS NULL;

-- Create subscribers table for subscription tracking
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);