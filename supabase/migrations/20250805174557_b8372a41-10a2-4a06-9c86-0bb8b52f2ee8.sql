-- Phase 1: Create complete subscription system schema and populate data

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in cents
  billing_period TEXT NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  features TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create plan_limits table
CREATE TABLE IF NOT EXISTS public.plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('team_members', 'clients', 'marketing_campaigns', 'searches_per_month')),
  limit_value INTEGER NOT NULL, -- -1 means unlimited
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create plan_features table
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_value TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create billing_history table
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  billing_period_start TIMESTAMPTZ,
  billing_period_end TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription_changes table
CREATE TABLE IF NOT EXISTS public.subscription_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_plan_id UUID REFERENCES public.subscription_plans(id),
  to_plan_id UUID REFERENCES public.subscription_plans(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'cancel', 'renew')),
  effective_date TIMESTAMPTZ NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscribers table for Stripe integration
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_plans (public read, admin write)
CREATE POLICY "public_read_subscription_plans" ON public.subscription_plans
FOR SELECT USING (true);

CREATE POLICY "admin_manage_subscription_plans" ON public.subscription_plans
FOR ALL USING (user_is_admin());

-- Create RLS policies for plan_limits (public read, admin write)
CREATE POLICY "public_read_plan_limits" ON public.plan_limits
FOR SELECT USING (true);

CREATE POLICY "admin_manage_plan_limits" ON public.plan_limits
FOR ALL USING (user_is_admin());

-- Create RLS policies for plan_features (public read, admin write)
CREATE POLICY "public_read_plan_features" ON public.plan_features
FOR SELECT USING (true);

CREATE POLICY "admin_manage_plan_features" ON public.plan_features
FOR ALL USING (user_is_admin());

-- Create RLS policies for billing_history (users see own, admin sees all)
CREATE POLICY "users_read_own_billing" ON public.billing_history
FOR SELECT USING (user_id = auth.uid() OR user_is_admin());

CREATE POLICY "admin_manage_billing" ON public.billing_history
FOR ALL USING (user_is_admin());

-- Create RLS policies for subscription_changes (users see own, admin sees all)
CREATE POLICY "users_read_own_changes" ON public.subscription_changes
FOR SELECT USING (user_id = auth.uid() OR user_is_admin());

CREATE POLICY "admin_manage_changes" ON public.subscription_changes
FOR ALL USING (user_is_admin());

-- Create RLS policies for subscribers (users see own, functions can update)
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT WITH CHECK (true);

-- Add current_plan_id column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS current_plan_id UUID REFERENCES public.subscription_plans(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plan_limits_plan_id ON public.plan_limits(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON public.plan_features(plan_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_user_id ON public.subscription_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- Insert subscription plans
INSERT INTO public.subscription_plans (
  name, display_name, description, price, billing_period, is_active, is_popular, sort_order, features
) VALUES 
(
  'free',
  'Free',
  'Perfect for getting started with basic features',
  0,
  'monthly',
  true,
  false,
  1,
  ARRAY['Basic property search', 'Save up to 10 properties', 'Email support']
),
(
  'professional',
  'Professional',
  'Advanced features for real estate professionals',
  2999,
  'monthly',
  true,
  true,
  2,
  ARRAY['Unlimited property searches', 'Advanced market analytics', 'Client management', 'Team collaboration', 'Priority support', 'LMI qualification tools']
),
(
  'enterprise',
  'Enterprise',
  'Full-featured solution for large teams and brokerages',
  9999,
  'monthly',
  true,
  false,
  3,
  ARRAY['Everything in Professional', 'White-label branding', 'API access', 'Custom integrations', 'Dedicated account manager', 'SLA guarantee']
);

-- Insert plan limits
WITH plan_ids AS (SELECT id, name FROM subscription_plans)
INSERT INTO public.plan_limits (plan_id, resource_type, limit_value) 
SELECT p.id, limits.resource_type, limits.limit_value
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

SELECT p.id, limits.resource_type, limits.limit_value
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

SELECT p.id, limits.resource_type, limits.limit_value
FROM plan_ids p
CROSS JOIN (
  VALUES 
    ('team_members', -1),
    ('clients', -1),
    ('marketing_campaigns', -1),
    ('searches_per_month', -1)
) AS limits(resource_type, limit_value)
WHERE p.name = 'enterprise';

-- Insert plan features
WITH plan_ids AS (SELECT id, name FROM subscription_plans)
INSERT INTO public.plan_features (plan_id, feature_name, is_enabled)
SELECT p.id, features.feature_name, features.is_enabled
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

SELECT p.id, features.feature_name, features.is_enabled
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

SELECT p.id, features.feature_name, features.is_enabled
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

-- Update existing users to have the free plan
UPDATE public.user_profiles 
SET current_plan_id = (SELECT id FROM subscription_plans WHERE name = 'free' LIMIT 1)
WHERE current_plan_id IS NULL;