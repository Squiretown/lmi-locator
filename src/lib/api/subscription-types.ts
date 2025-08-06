// Subscription and pricing related types for the admin-controlled pricing system

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  is_active: boolean;
  is_popular: boolean;
  is_trial?: boolean;
  trial_period_days?: number;
  sort_order: number;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface PlanLimit {
  id: string;
  plan_id: string;
  resource_type: 'team_members' | 'clients' | 'marketing_campaigns' | 'searches_per_month';
  limit_value: number;
  created_at: string;
}

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_name: string;
  feature_value?: string;
  is_enabled: boolean;
  created_at: string;
}

export interface BillingHistory {
  id: string;
  user_id: string;
  plan_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  billing_period_start?: string;
  billing_period_end?: string;
  stripe_payment_intent_id?: string;
  created_at: string;
}

export interface SubscriptionChange {
  id: string;
  user_id: string;
  from_plan_id?: string;
  to_plan_id?: string;
  change_type: 'upgrade' | 'downgrade' | 'cancel' | 'renew';
  effective_date: string;
  reason?: string;
  created_at: string;
}

export interface UserSubscription {
  current_plan_id?: string;
  subscription_status: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  trial_end_date?: string;
}

export interface PlanWithLimitsAndFeatures extends SubscriptionPlan {
  limits: PlanLimit[];
  plan_features: PlanFeature[];
}

export interface CreatePlanData {
  name: string;
  display_name: string;
  description?: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  is_popular?: boolean;
  is_trial?: boolean;
  trial_period_days?: number;
  sort_order?: number;
  features: string[];
  limits: Omit<PlanLimit, 'id' | 'plan_id' | 'created_at'>[];
  plan_features: Omit<PlanFeature, 'id' | 'plan_id' | 'created_at'>[];
}

export interface UpdatePlanData extends Partial<CreatePlanData> {
  id: string;
  is_active?: boolean;
}