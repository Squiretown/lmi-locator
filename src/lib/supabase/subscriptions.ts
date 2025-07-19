import { supabase } from "@/integrations/supabase/client";
import type { 
  SubscriptionPlan, 
  PlanLimit, 
  PlanFeature, 
  PlanWithLimitsAndFeatures,
  CreatePlanData,
  UpdatePlanData 
} from "@/lib/api/subscription-types";

// Get all active subscription plans (simplified approach)
export async function getSubscriptionPlans(): Promise<any[]> {
  try {
    // Use raw SQL for now since types aren't updated
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

// Check if user has a specific feature  
export async function checkUserFeature(userId: string, featureName: string): Promise<boolean> {
  try {
    // For now, return true until the function is properly set up
    // TODO: Implement proper feature checking once types are updated
    return true;
  } catch (error) {
    console.error('Error checking user feature:', error);
    return false;
  }
}

// Check user's limit for a specific resource
export async function checkUserResourceLimit(userId: string, resourceType: string): Promise<number> {
  try {
    // For now, return a default limit until the function is properly set up
    // TODO: Implement proper limit checking once types are updated
    return 100;
  } catch (error) {
    console.error('Error checking user limit:', error);
    return 0;
  }
}