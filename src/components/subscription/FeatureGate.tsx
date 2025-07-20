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

      // For now, check features based on plan type since RPC functions need types update
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      // Temporary feature mapping based on user type until database types are updated
      const featureAccess: Record<string, string[]> = {
        'admin': ['api_access', 'crm_integrations', 'iframe_embed', 'white_label', 'ai_lead_scoring', 'custom_reports', 'multi_user'],
        'realtor': ['crm_integrations', 'iframe_embed', 'ai_lead_scoring', 'custom_reports', 'multi_user'],
        'mortgage_professional': ['crm_integrations', 'iframe_embed', 'ai_lead_scoring', 'custom_reports', 'multi_user'],
        'client': []
      };

      const userType = profile?.user_type || 'client';
      const allowedFeatures = featureAccess[userType] || [];
      const hasFeature = allowedFeatures.includes(feature);

      setAccess({
        hasFeature,
        planName: userType,
        planDisplayName: userType === 'admin' ? 'Enterprise' : 
                        userType === 'realtor' || userType === 'mortgage_professional' ? 'Professional' : 'Basic'
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
        <Button size="sm" variant="outline" className="ml-4">
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

        // Temporary feature check until database types are updated
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        const featureAccess: Record<string, string[]> = {
          'admin': ['api_access', 'crm_integrations', 'iframe_embed', 'white_label', 'ai_lead_scoring', 'custom_reports', 'multi_user'],
          'realtor': ['crm_integrations', 'iframe_embed', 'ai_lead_scoring', 'custom_reports', 'multi_user'],
          'mortgage_professional': ['crm_integrations', 'iframe_embed', 'ai_lead_scoring', 'custom_reports', 'multi_user'],
          'client': []
        };

        const userType = profile?.user_type || 'client';
        const allowedFeatures = featureAccess[userType] || [];
        setHasAccess(allowedFeatures.includes(feature));
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

        // Temporary limit check until database types are updated
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();

        const defaultLimits: Record<string, Record<string, number>> = {
          'admin': { 'team_members': 25, 'clients': 500, 'marketing_campaigns': 100, 'searches_per_month': -1 },
          'realtor': { 'team_members': 5, 'clients': 50, 'marketing_campaigns': 10, 'searches_per_month': 500 },
          'mortgage_professional': { 'team_members': 5, 'clients': 50, 'marketing_campaigns': 10, 'searches_per_month': 500 },
          'client': { 'team_members': 1, 'clients': 5, 'marketing_campaigns': 0, 'searches_per_month': 10 }
        };

        const userType = profile?.user_type || 'client';
        const userLimits = defaultLimits[userType] || defaultLimits['client'];
        setLimit(userLimits[resourceType] || 0);
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