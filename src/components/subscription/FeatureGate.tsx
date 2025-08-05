import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

interface UserFeatureAccess {
  hasFeature: boolean;
  planName?: string;
  planDisplayName?: string;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback,
  showUpgrade = true 
}) => {
  const [access, setAccess] = useState<UserFeatureAccess>({ hasFeature: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFeatureAccess();
  }, [feature]);

  const checkFeatureAccess = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAccess({ hasFeature: false });
        return;
      }

      // Get user's current subscription plan
      const { data: profile } = await supabase
        .from('user_profiles')
        .select(`
          current_plan_id,
          subscription_plans!current_plan_id (
            id,
            name,
            display_name
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (!profile?.current_plan_id) {
        setAccess({ hasFeature: false });
        return;
      }

      // Get plan features for the user's current plan
      const { data: planFeatures } = await supabase
        .from('plan_features')
        .select('feature_name, is_enabled')
        .eq('plan_id', profile.current_plan_id);

      // Check if user has the requested feature
      const featureData = planFeatures?.find(f => f.feature_name === feature);
      const hasFeature = featureData?.is_enabled || false;

      const plan = profile.subscription_plans as any;
      setAccess({
        hasFeature,
        planName: plan?.name,
        planDisplayName: plan?.display_name
      });

    } catch (error) {
      console.error('Error in feature gate:', error);
      setAccess({ hasFeature: false });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-muted rounded p-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
      </div>
    );
  }

  if (access.hasFeature) {
    return <>{children}</>;
  }

  // Show fallback or default upgrade prompt
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Lock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="font-medium">Feature Not Available</div>
          <div className="text-sm text-muted-foreground">
            This feature requires a higher subscription plan.
            {access.planDisplayName && (
              <span> Current plan: <Badge variant="outline">{access.planDisplayName}</Badge></span>
            )}
          </div>
        </div>
        <Button size="sm" variant="outline" className="ml-4" onClick={() => window.location.href = '/pricing'}>
          <ArrowUp className="h-3 w-3 mr-1" />
          Upgrade Plan
        </Button>
      </AlertDescription>
    </Alert>
  );
};

// Hook for checking feature access in components
export const useFeatureAccess = (feature: string) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setHasAccess(false);
          return;
        }

        // Get user's current subscription plan and features
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('current_plan_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.current_plan_id) {
          setHasAccess(false);
          return;
        }

        // Get plan features for the user's current plan
        const { data: planFeatures } = await supabase
          .from('plan_features')
          .select('feature_name, is_enabled')
          .eq('plan_id', profile.current_plan_id);

        // Check if user has the requested feature
        const featureData = planFeatures?.find(f => f.feature_name === feature);
        setHasAccess(featureData?.is_enabled || false);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [feature]);

  return { hasAccess, loading };
};

// Hook for checking resource limits
export const useResourceLimit = (resourceType: string) => {
  const [limit, setLimit] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLimit = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLimit(0);
          return;
        }

        // Get user's current subscription plan and limits
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('current_plan_id')
          .eq('user_id', user.id)
          .single();

        if (!profile?.current_plan_id) {
          setLimit(0);
          return;
        }

        // Get plan limits for the user's current plan
        const { data: planLimits } = await supabase
          .from('plan_limits')
          .select('resource_type, limit_value')
          .eq('plan_id', profile.current_plan_id);

        // Find the specific resource limit
        const limitData = planLimits?.find(l => l.resource_type === resourceType);
        setLimit(limitData?.limit_value || 0);
      } catch (error) {
        console.error('Error checking resource limit:', error);
        setLimit(0);
      } finally {
        setLoading(false);
      }
    };

    checkLimit();
  }, [resourceType]);

  return { limit, loading };
};