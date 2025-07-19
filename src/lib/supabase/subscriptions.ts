import { supabase } from "@/integrations/supabase/client";
import type { 
  SubscriptionPlan, 
  PlanLimit, 
  PlanFeature, 
  PlanWithLimitsAndFeatures,
  CreatePlanData,
  UpdatePlanData 
} from "@/lib/api/subscription-types";

// Get all active subscription plans
export async function getSubscriptionPlans(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans' as any)
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
}

// Get plan limits for a plan
export async function getPlanLimits(planId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('plan_limits' as any)
      .select('*')
      .eq('plan_id', planId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching plan limits:', error);
    return [];
  }
}

// Get plan features for a plan
export async function getPlanFeatures(planId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('plan_features' as any)
      .select('*')
      .eq('plan_id', planId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching plan features:', error);
    return [];
  }
}

// Admin function to get all plans (including inactive)
export async function getAllSubscriptionPlans(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans' as any)
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all subscription plans:', error);
    return [];
  }
}

// Create a new subscription plan
export async function createSubscriptionPlan(planData: CreatePlanData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Create the plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans' as any)
      .insert({
        name: planData.name,
        display_name: planData.display_name,
        description: planData.description,
        price: planData.price,
        billing_period: planData.billing_period,
        is_popular: planData.is_popular || false,
        sort_order: planData.sort_order || 0,
        features: planData.features || []
      })
      .select()
      .single();

    if (planError || !plan) throw planError;

    // Create plan limits
    if (planData.limits && planData.limits.length > 0) {
      const limitsData = planData.limits.map(limit => ({
        plan_id: (plan as any).id,
        resource_type: limit.resource_type,
        limit_value: limit.limit_value
      }));

      const { error: limitsError } = await supabase
        .from('plan_limits' as any)
        .insert(limitsData);

      if (limitsError) throw limitsError;
    }

    // Create plan features
    if (planData.plan_features && planData.plan_features.length > 0) {
      const featuresData = planData.plan_features.map(feature => ({
        plan_id: (plan as any).id,
        feature_name: feature.feature_name,
        feature_value: feature.feature_value,
        is_enabled: feature.is_enabled
      }));

      const { error: featuresError } = await supabase
        .from('plan_features' as any)
        .insert(featuresData);

      if (featuresError) throw featuresError;
    }

    return { success: true, data: plan };
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update an existing subscription plan
export async function updateSubscriptionPlan(planData: UpdatePlanData): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Update the plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans' as any)
      .update({
        name: planData.name,
        display_name: planData.display_name,
        description: planData.description,
        price: planData.price,
        billing_period: planData.billing_period,
        is_popular: planData.is_popular,
        is_active: planData.is_active,
        sort_order: planData.sort_order,
        features: planData.features
      })
      .eq('id', planData.id)
      .select()
      .single();

    if (planError || !plan) throw planError;

    // Update plan limits if provided
    if (planData.limits) {
      // Delete existing limits
      await supabase
        .from('plan_limits' as any)
        .delete()
        .eq('plan_id', planData.id);

      // Insert new limits
      if (planData.limits.length > 0) {
        const limitsData = planData.limits.map(limit => ({
          plan_id: planData.id,
          resource_type: limit.resource_type,
          limit_value: limit.limit_value
        }));

        const { error: limitsError } = await supabase
          .from('plan_limits' as any)
          .insert(limitsData);

        if (limitsError) throw limitsError;
      }
    }

    // Update plan features if provided
    if (planData.plan_features) {
      // Delete existing features
      await supabase
        .from('plan_features' as any)
        .delete()
        .eq('plan_id', planData.id);

      // Insert new features
      if (planData.plan_features.length > 0) {
        const featuresData = planData.plan_features.map(feature => ({
          plan_id: planData.id,
          feature_name: feature.feature_name,
          feature_value: feature.feature_value,
          is_enabled: feature.is_enabled
        }));

        const { error: featuresError } = await supabase
          .from('plan_features' as any)
          .insert(featuresData);

        if (featuresError) throw featuresError;
      }
    }

    return { success: true, data: plan };
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Delete a subscription plan
export async function deleteSubscriptionPlan(planId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('subscription_plans' as any)
      .delete()
      .eq('id', planId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Check if user has a specific feature  
export async function checkUserFeature(userId: string, featureName: string): Promise<boolean> {
  try {
    // For now, return true for basic features - implement RPC when types are updated
    const basicFeatures = ['basic_search', 'property_reports'];
    return basicFeatures.includes(featureName);
  } catch (error) {
    console.error('Error checking user feature:', error);
    return false;
  }
}

// Check user's limit for a specific resource
export async function checkUserResourceLimit(userId: string, resourceType: string): Promise<number> {
  try {
    // For now, return default limits - implement RPC when types are updated
    const defaultLimits: Record<string, number> = {
      'team_members': 1,
      'clients': 5,
      'marketing_campaigns': 0,
      'searches_per_month': 10
    };
    return defaultLimits[resourceType] || 0;
  } catch (error) {
    console.error('Error checking user limit:', error);
    return 0;
  }
}