
-- Phase 1: Create dynamic pricing configuration tables

-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- internal name (basic, pro, enterprise)
  display_name TEXT NOT NULL, -- user-facing name
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb, -- array of feature descriptions
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create plan limits table for resource limits
CREATE TABLE public.plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL, -- team_members, clients, marketing_campaigns, searches_per_month, etc.
  limit_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create plan features table for detailed feature configuration
CREATE TABLE public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  feature_value TEXT, -- for text/string features
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create billing history table
CREATE TABLE public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL, -- pending, paid, failed, refunded
  billing_period_start DATE,
  billing_period_end DATE,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscription changes log
CREATE TABLE public.subscription_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  from_plan_id UUID REFERENCES public.subscription_plans(id),
  to_plan_id UUID REFERENCES public.subscription_plans(id),
  change_type TEXT NOT NULL, -- upgrade, downgrade, cancel, renew
  effective_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add subscription fields to user_profiles if not exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS current_plan_id UUID REFERENCES public.subscription_plans(id),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public readable, admin manageable)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (user_is_admin());

-- RLS Policies for plan_limits (public readable, admin manageable)
CREATE POLICY "Anyone can view plan limits" ON public.plan_limits
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.subscription_plans 
    WHERE id = plan_limits.plan_id AND is_active = true
  ));

CREATE POLICY "Admins can manage plan limits" ON public.plan_limits
  FOR ALL USING (user_is_admin());

-- RLS Policies for plan_features (public readable, admin manageable)
CREATE POLICY "Anyone can view plan features" ON public.plan_features
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.subscription_plans 
    WHERE id = plan_features.plan_id AND is_active = true
  ));

CREATE POLICY "Admins can manage plan features" ON public.plan_features
  FOR ALL USING (user_is_admin());

-- RLS Policies for billing_history (users see their own, admins see all)
CREATE POLICY "Users can view own billing history" ON public.billing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all billing history" ON public.billing_history
  FOR ALL USING (user_is_admin());

-- RLS Policies for subscription_changes (users see their own, admins see all)
CREATE POLICY "Users can view own subscription changes" ON public.subscription_changes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscription changes" ON public.subscription_changes
  FOR ALL USING (user_is_admin());

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, display_name, description, price, billing_period, is_popular, sort_order, features) VALUES
('free', 'Basic', 'For individuals looking to check a single property', 0.00, 'monthly', false, 1, '["Single property LMI eligibility check", "Basic program eligibility screening", "Property report generation", "Limited searches per month"]'::jsonb),
('professional', 'Professional', 'For realtors and mortgage professionals', 49.99, 'monthly', true, 2, '["Unlimited property LMI checks", "Advanced program matching", "Client management tools", "Marketing list generation", "Property history tracking", "Email notifications"]'::jsonb),
('enterprise', 'Enterprise', 'For teams and organizations', 149.99, 'monthly', false, 3, '["All Professional features", "Team member accounts", "API access for integration", "Bulk property checking", "Advanced analytics dashboard", "White-label reports", "Priority support"]'::jsonb);

-- Insert default plan limits
INSERT INTO public.plan_limits (plan_id, resource_type, limit_value) VALUES
-- Free plan limits
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'team_members', 1),
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'clients', 5),
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'marketing_campaigns', 0),
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'searches_per_month', 10),
-- Professional plan limits
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'team_members', 5),
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'clients', 50),
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'marketing_campaigns', 10),
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'searches_per_month', 500),
-- Enterprise plan limits
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'team_members', 25),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'clients', 500),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'marketing_campaigns', 100),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'searches_per_month', -1); -- -1 = unlimited

-- Insert default plan features
INSERT INTO public.plan_features (plan_id, feature_name, is_enabled) VALUES
-- Free plan features
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'basic_search', true),
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'property_reports', true),
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'team_management', false),
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'marketing_tools', false),
((SELECT id FROM public.subscription_plans WHERE name = 'free'), 'api_access', false),
-- Professional plan features
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'basic_search', true),
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'property_reports', true),
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'team_management', true),
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'marketing_tools', true),
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'client_management', true),
((SELECT id FROM public.subscription_plans WHERE name = 'professional'), 'api_access', false),
-- Enterprise plan features
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'basic_search', true),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'property_reports', true),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'team_management', true),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'marketing_tools', true),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'client_management', true),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'api_access', true),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'white_label', true),
((SELECT id FROM public.subscription_plans WHERE name = 'enterprise'), 'priority_support', true);

-- Create helper functions for subscription management
CREATE OR REPLACE FUNCTION public.get_user_plan_limits(user_uuid UUID)
RETURNS TABLE (
  resource_type TEXT,
  limit_value INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT pl.resource_type, pl.limit_value
  FROM public.user_profiles up
  JOIN public.subscription_plans sp ON up.current_plan_id = sp.id
  JOIN public.plan_limits pl ON sp.id = pl.plan_id
  WHERE up.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.check_user_limit(user_uuid UUID, resource TEXT)
RETURNS INTEGER AS $$
DECLARE
  user_limit INTEGER;
BEGIN
  SELECT limit_value INTO user_limit
  FROM public.get_user_plan_limits(user_uuid)
  WHERE resource_type = resource;
  
  RETURN COALESCE(user_limit, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_has_feature(user_uuid UUID, feature TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_feature BOOLEAN;
BEGIN
  SELECT pf.is_enabled INTO has_feature
  FROM public.user_profiles up
  JOIN public.subscription_plans sp ON up.current_plan_id = sp.id
  JOIN public.plan_features pf ON sp.id = pf.plan_id
  WHERE up.user_id = user_uuid AND pf.feature_name = feature;
  
  RETURN COALESCE(has_feature, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing user_type data to subscription plans
UPDATE public.user_profiles 
SET current_plan_id = (
  CASE 
    WHEN user_type = 'client' THEN (SELECT id FROM public.subscription_plans WHERE name = 'free')
    WHEN user_type = 'realtor' OR user_type = 'mortgage_professional' THEN (SELECT id FROM public.subscription_plans WHERE name = 'professional')
    WHEN user_type = 'admin' THEN (SELECT id FROM public.subscription_plans WHERE name = 'enterprise')
    ELSE (SELECT id FROM public.subscription_plans WHERE name = 'free')
  END
),
subscription_status = 'active',
subscription_start_date = created_at
WHERE current_plan_id IS NULL;

-- Create indexes for performance
CREATE INDEX idx_subscription_plans_active ON public.subscription_plans(is_active) WHERE is_active = true;
CREATE INDEX idx_plan_limits_plan_id ON public.plan_limits(plan_id);
CREATE INDEX idx_plan_features_plan_id ON public.plan_features(plan_id);
CREATE INDEX idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX idx_subscription_changes_user_id ON public.subscription_changes(user_id);
CREATE INDEX idx_user_profiles_current_plan_id ON public.user_profiles(current_plan_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_subscription_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_plans_updated_at();
