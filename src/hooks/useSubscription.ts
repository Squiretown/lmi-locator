import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string | null;
  plan_id: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('check-subscription');
      
      if (functionError) throw functionError;
      
      setSubscription(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check subscription';
      setError(errorMessage);
      console.error('Error checking subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check subscription on mount
    checkSubscription();

    // Set up auth state listener to refresh subscription when user changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        checkSubscription();
      } else if (event === 'SIGNED_OUT') {
        setSubscription(null);
        setLoading(false);
      }
    });

    return () => {
      authSub.unsubscribe();
    };
  }, []);

  return {
    subscription,
    loading,
    error,
    refetch: checkSubscription
  };
};