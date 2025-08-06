import { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';

interface TrialInfo {
  isTrialActive: boolean;
  daysRemaining: number;
  trialExpired: boolean;
  isTrialUser: boolean;
}

export const useTrial = (): TrialInfo => {
  const { subscription, loading } = useSubscription();
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    isTrialActive: false,
    daysRemaining: 0,
    trialExpired: false,
    isTrialUser: false,
  });

  useEffect(() => {
    if (!loading && subscription) {
      const isTrialUser = subscription.subscription_tier === 'trial' || subscription.is_trial;
      const trialExpired = subscription.trial_expired || subscription.subscription_tier === 'expired';
      const daysRemaining = subscription.trial_days_remaining || 0;
      const isTrialActive = isTrialUser && !trialExpired && daysRemaining > 0;

      setTrialInfo({
        isTrialActive,
        daysRemaining,
        trialExpired,
        isTrialUser,
      });
    }
  }, [subscription, loading]);

  return trialInfo;
};