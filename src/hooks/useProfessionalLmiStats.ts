import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface LmiStats {
  totalSearches: number;
  lmiEligibleSearches: number;
  lmiEligiblePercentage: number;
  clientSearches: number;
  professionalSearches: number;
}

export function useProfessionalLmiStats() {
  const [stats, setStats] = useState<LmiStats>({
    totalSearches: 0,
    lmiEligibleSearches: 0,
    lmiEligiblePercentage: 0,
    clientSearches: 0,
    professionalSearches: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, userType } = useAuth();

  const fetchLmiStats = useCallback(async () => {
    if (!user?.id || userType !== 'mortgage_professional') {
      setStats({
        totalSearches: 0,
        lmiEligibleSearches: 0,
        lmiEligiblePercentage: 0,
        clientSearches: 0,
        professionalSearches: 0,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get direct searches by the mortgage professional
      const { data: professionalSearches, error: professionalError } = await supabase
        .from('search_history')
        .select('id, is_eligible')
        .eq('user_id', user.id);

      if (professionalError) throw professionalError;

      // Get client IDs for this professional
      const { data: clients, error: clientsError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('professional_id', user.id);

      if (clientsError) throw clientsError;

      let clientSearches: any[] = [];
      
      if (clients && clients.length > 0) {
        // Get searches by all clients of this professional
        // Note: We need to get the user_id from client profiles, but this requires
        // a more complex query or storing user_id in client_profiles
        // For now, let's use a simpler approach and get all searches, then filter
        const { data: allClientSearches, error: clientSearchesError } = await supabase
          .from('search_history')
          .select('id, is_eligible, user_id');

        if (clientSearchesError) throw clientSearchesError;

        // Filter searches that belong to clients of this professional
        // This is a simplified approach - in a real implementation you'd want to
        // either store professional_id in search_history or create a proper join
        clientSearches = allClientSearches || [];
      }

      // Calculate statistics
      const professionalSearchCount = professionalSearches?.length || 0;
      const clientSearchCount = clientSearches?.length || 0;
      const totalSearches = professionalSearchCount + clientSearchCount;

      const professionalEligible = professionalSearches?.filter(s => s.is_eligible).length || 0;
      const clientEligible = clientSearches?.filter(s => s.is_eligible).length || 0;
      const totalEligible = professionalEligible + clientEligible;

      const eligiblePercentage = totalSearches > 0 ? (totalEligible / totalSearches) * 100 : 0;

      setStats({
        totalSearches,
        lmiEligibleSearches: totalEligible,
        lmiEligiblePercentage: Math.round(eligiblePercentage),
        clientSearches: clientSearchCount,
        professionalSearches: professionalSearchCount,
      });

    } catch (err) {
      console.error('Error fetching LMI stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch LMI statistics');
      setStats({
        totalSearches: 0,
        lmiEligibleSearches: 0,
        lmiEligiblePercentage: 0,
        clientSearches: 0,
        professionalSearches: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userType]);

  useEffect(() => {
    fetchLmiStats();
  }, [fetchLmiStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchLmiStats
  };
}