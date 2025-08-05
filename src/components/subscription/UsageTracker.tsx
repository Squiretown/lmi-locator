import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Building, Search, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useResourceLimit } from '@/components/subscription/FeatureGate';

interface UsageData {
  resource_type: string;
  current_usage: number;
  limit: number;
  period_start: string;
  period_end: string;
}

interface ResourceConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
}

const resourceConfig: Record<string, ResourceConfig> = {
  'team_members': {
    icon: <Users className="w-4 h-4" />,
    label: 'Team Members',
    description: 'Active team members in your organization'
  },
  'clients': {
    icon: <Building className="w-4 h-4" />,
    label: 'Clients',
    description: 'Active client profiles'
  },
  'searches_per_month': {
    icon: <Search className="w-4 h-4" />,
    label: 'Searches',
    description: 'Property searches this month'
  },
  'marketing_campaigns': {
    icon: <Mail className="w-4 h-4" />,
    label: 'Marketing Campaigns',
    description: 'Active marketing campaigns'
  }
};

export const UsageTracker: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current limits for each resource type
  const teamLimit = useResourceLimit('team_members');
  const clientLimit = useResourceLimit('clients');
  const searchLimit = useResourceLimit('searches_per_month');
  const campaignLimit = useResourceLimit('marketing_campaigns');

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // For now, simulate usage data based on actual database counts
      const usagePromises = [
        // Team members (count from contacts table for now)
        supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
        // Clients (count from client_profiles table)
        supabase.from('client_profiles').select('id', { count: 'exact', head: true }).eq('professional_id', user.id),
        // Searches (count from census_tract_searches table this month)
        supabase.from('census_tract_searches')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        // Marketing campaigns (count from communications table)
        supabase.from('client_communications')
          .select('id', { count: 'exact', head: true })
          .eq('professional_id', user.id)
      ];

      const [teamResult, clientResult, searchResult, campaignResult] = await Promise.all(usagePromises);

      const mockUsageData: UsageData[] = [
        {
          resource_type: 'team_members',
          current_usage: teamResult.count || 0,
          limit: teamLimit.limit,
          period_start: new Date().toISOString(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          resource_type: 'clients',
          current_usage: clientResult.count || 0,
          limit: clientLimit.limit,
          period_start: new Date().toISOString(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          resource_type: 'searches_per_month',
          current_usage: searchResult.count || 0,
          limit: searchLimit.limit,
          period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()
        },
        {
          resource_type: 'marketing_campaigns',
          current_usage: campaignResult.count || 0,
          limit: campaignLimit.limit,
          period_start: new Date().toISOString(),
          period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setUsageData(mockUsageData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load usage data';
      setError(errorMessage);
      console.error('Error loading usage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    if (limit === 0) return 100; // No allowance
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Usage & Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-2 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <BarChart3 className="w-5 h-5 mr-2" />
            Usage & Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Usage & Limits
        </CardTitle>
        <CardDescription>
          Track your usage against plan limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {usageData.map((usage) => {
          const config = resourceConfig[usage.resource_type];
          if (!config) return null;

          const percentage = getUsagePercentage(usage.current_usage, usage.limit);
          const isUnlimited = usage.limit === -1;
          const isOverLimit = usage.current_usage > usage.limit && usage.limit > 0;

          return (
            <div key={usage.resource_type} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {config.icon}
                  <span className="font-medium">{config.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isUnlimited ? (
                    <Badge variant="secondary">Unlimited</Badge>
                  ) : isOverLimit ? (
                    <Badge variant="destructive">Over Limit</Badge>
                  ) : (
                    <span className={`text-sm ${getUsageColor(percentage)}`}>
                      {usage.current_usage} / {usage.limit}
                    </span>
                  )}
                </div>
              </div>
              
              {!isUnlimited && (
                <Progress
                  value={percentage}
                  className="h-2"
                />
              )}
              
              <p className="text-xs text-muted-foreground">
                {config.description}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};