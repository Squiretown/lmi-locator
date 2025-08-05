import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, loading, error, refetch } = useSubscription();

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL received');
      }
    } catch (err) {
      console.error('Error opening customer portal:', err);
      toast.error('Failed to open billing portal');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded"></div>
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
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No subscription information available.</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'secondary';
      case 'professional': return 'default';
      case 'enterprise': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Subscription Status
          </span>
          <Button onClick={refetch} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Manage your subscription and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Current Plan:</span>
          <Badge variant={getStatusColor(subscription.subscription_tier)}>
            {subscription.subscription_tier.charAt(0).toUpperCase() + 
             subscription.subscription_tier.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          <span className={`text-sm ${subscription.subscribed ? 'text-green-600' : 'text-muted-foreground'}`}>
            {subscription.subscribed ? 'Active' : 'Inactive'}
          </span>
        </div>

        {subscription.subscription_end && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Next Billing:
            </span>
            <span className="text-sm">{formatDate(subscription.subscription_end)}</span>
          </div>
        )}

        <div className="pt-4 space-y-2">
          {subscription.subscribed && (
            <Button onClick={openCustomerPortal} className="w-full">
              Manage Subscription
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/pricing'}
          >
            {subscription.subscription_tier === 'free' ? 'Upgrade Plan' : 'Change Plan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};