
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TeamStats {
  teamMembers: number;
  partnerRealtors: number;
  sharedClients: number;
}

interface PerformanceMetrics {
  thisMonth: {
    referralsReceived: number;
    closedLoans: number;
    conversionRate: number;
  };
  lastMonth: {
    referralsReceived: number;
    closedLoans: number;
    conversionRate: number;
  };
}

export const useMortgageTeamStats = () => {
  const { data: teamStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['mortgage-team-stats'],
    queryFn: async (): Promise<TeamStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current user's professional profile
      const { data: currentProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'mortgage_professional')
        .single();

      if (!currentProfessional) {
        return { teamMembers: 0, partnerRealtors: 0, sharedClients: 0 };
      }

      // Count team members (other mortgage professionals in the organization)
      const { count: teamCount } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'mortgage_professional')
        .eq('status', 'active')
        .neq('id', currentProfessional.id);

      // Count partner realtors
      const { count: realtorCount } = await supabase
        .from('professional_teams')
        .select('*', { count: 'exact', head: true })
        .eq('mortgage_professional_id', currentProfessional.id)
        .eq('status', 'active');

      // Count shared clients
      const { count: sharedClientsCount } = await supabase
        .from('client_team_assignments')
        .select('client_id', { count: 'exact', head: true })
        .eq('professional_id', currentProfessional.id)
        .eq('status', 'active');

      return {
        teamMembers: teamCount || 0,
        partnerRealtors: realtorCount || 0,
        sharedClients: sharedClientsCount || 0,
      };
    },
  });

  const { data: performanceMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['mortgage-performance-metrics'],
    queryFn: async (): Promise<PerformanceMetrics> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get current user's professional profile
      const { data: currentProfessional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'mortgage_professional')
        .single();

      if (!currentProfessional) {
        return {
          thisMonth: { referralsReceived: 0, closedLoans: 0, conversionRate: 0 },
          lastMonth: { referralsReceived: 0, closedLoans: 0, conversionRate: 0 }
        };
      }

      // This month metrics
      const { count: thisMonthReferrals } = await supabase
        .from('client_team_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', currentProfessional.id)
        .gte('assigned_at', thisMonthStart.toISOString());

      const { count: thisMonthClosed } = await supabase
        .from('client_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', currentProfessional.id)
        .eq('status', 'closed')
        .gte('updated_at', thisMonthStart.toISOString());

      // Last month metrics
      const { count: lastMonthReferrals } = await supabase
        .from('client_team_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', currentProfessional.id)
        .gte('assigned_at', lastMonthStart.toISOString())
        .lt('assigned_at', thisMonthStart.toISOString());

      const { count: lastMonthClosed } = await supabase
        .from('client_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', currentProfessional.id)
        .eq('status', 'closed')
        .gte('updated_at', lastMonthStart.toISOString())
        .lt('updated_at', thisMonthStart.toISOString());

      return {
        thisMonth: {
          referralsReceived: thisMonthReferrals || 0,
          closedLoans: thisMonthClosed || 0,
          conversionRate: thisMonthReferrals ? Math.round((thisMonthClosed || 0) / thisMonthReferrals * 100) : 0
        },
        lastMonth: {
          referralsReceived: lastMonthReferrals || 0,
          closedLoans: lastMonthClosed || 0,
          conversionRate: lastMonthReferrals ? Math.round((lastMonthClosed || 0) / lastMonthReferrals * 100) : 0
        }
      };
    },
  });

  // Combine into a simple stats object for the dashboard
  const stats = {
    propertiesAnalyzed: (performanceMetrics?.thisMonth?.referralsReceived || 0) + (performanceMetrics?.lastMonth?.referralsReceived || 0),
    lmiEligible: performanceMetrics?.thisMonth?.closedLoans || 0,
    teamMembers: teamStats?.teamMembers || 0,
    activePartners: teamStats?.partnerRealtors || 0
  };

  return {
    teamStats,
    performanceMetrics,
    stats,
    isLoading: isLoadingStats || isLoadingMetrics,
  };
};
