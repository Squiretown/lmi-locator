
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('❌ No authenticated user');
          return { teamMembers: 0, partnerRealtors: 0, sharedClients: 0 };
        }

        console.log('✅ Authenticated user:', user.id);

        // ✅ Get current user's professional profile
        const { data: currentProfessional, error: professionalError } = await supabase
          .from('professionals')
          .select('id, professional_type, user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (professionalError) {
          console.error('❌ Error fetching professional:', professionalError);
          return { teamMembers: 0, partnerRealtors: 0, sharedClients: 0 };
        }

        if (!currentProfessional) {
          console.log('ℹ️ No professional profile found for user');
          return { teamMembers: 0, partnerRealtors: 0, sharedClients: 0 };
        }

        console.log('✅ Current professional:', currentProfessional.id);

        // ✅ Count team members (other mortgage professionals at same company)
        const { count: teamCount, error: teamError } = await supabase
          .from('professionals')
          .select('*', { count: 'exact', head: true })
          .eq('professional_type', 'mortgage_broker')
          .neq('id', currentProfessional.id)
          .eq('status', 'active');

        if (teamError) {
          console.error('❌ Error counting team members:', teamError);
        } else {
          console.log('✅ Team members count:', teamCount);
        }

        // ✅ Count partner realtors from professional_teams table
        let realtorCount = 0;
        
        if (currentProfessional.professional_type === 'mortgage_broker' || 
            currentProfessional.professional_type === 'mortgage_professional') {
          
          const { count, error: realtorError } = await supabase
            .from('professional_teams')
            .select('*', { count: 'exact', head: true })
            .eq('mortgage_professional_id', currentProfessional.id)
            .eq('status', 'active');

          if (realtorError) {
            console.error('❌ Error counting realtor partners:', realtorError);
          } else {
            realtorCount = count ?? 0;
            console.log('✅ Realtor partners count:', realtorCount);
          }
        }

        // ✅ Count shared clients from client_team_assignments (fetch data to avoid 400 errors)
        const { data: sharedClientsData, error: clientsError } = await supabase
          .from('client_team_assignments')
          .select('id')
          .eq('professional_id', currentProfessional.id)
          .eq('status', 'active');

        const sharedClientsCount = sharedClientsData?.length ?? 0;

        if (clientsError) {
          console.error('❌ Error counting shared clients:', clientsError);
        } else {
          console.log('✅ Shared clients count:', sharedClientsCount);
        }

        const result = {
          teamMembers: teamCount ?? 0,
          partnerRealtors: realtorCount,
          sharedClients: sharedClientsCount ?? 0,
        };

        console.log('📊 Final team stats:', result);
        return result;

      } catch (error) {
        console.error('❌ Unexpected error in team stats:', error);
        return { teamMembers: 0, partnerRealtors: 0, sharedClients: 0 };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: performanceMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['mortgage-performance-metrics'],
    queryFn: async (): Promise<PerformanceMetrics> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('❌ No authenticated user for metrics');
          return {
            thisMonth: { referralsReceived: 0, closedLoans: 0, conversionRate: 0 },
            lastMonth: { referralsReceived: 0, closedLoans: 0, conversionRate: 0 }
          };
        }

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        console.log('📅 Date ranges:', {
          thisMonthStart: thisMonthStart.toISOString(),
          lastMonthStart: lastMonthStart.toISOString(),
          lastMonthEnd: lastMonthEnd.toISOString()
        });

        // ✅ Get current user's professional profile
        const { data: currentProfessional, error: professionalError } = await supabase
          .from('professionals')
          .select('id, professional_type, user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (professionalError || !currentProfessional) {
          console.error('❌ Error fetching professional for metrics:', professionalError);
          return {
            thisMonth: { referralsReceived: 0, closedLoans: 0, conversionRate: 0 },
            lastMonth: { referralsReceived: 0, closedLoans: 0, conversionRate: 0 }
          };
        }

        console.log('✅ Professional for metrics:', currentProfessional.id);

        // ✅ Count this month's referrals (fetch data to avoid 400 errors)
        const { data: thisMonthData, error: thisRefError } = await supabase
          .from('client_team_assignments')
          .select('id')
          .eq('professional_id', currentProfessional.id)
          .gte('created_at', thisMonthStart.toISOString());

        const thisMonthReferrals = thisMonthData?.length ?? 0;

        if (thisRefError) {
          console.error('❌ Error counting this month referrals:', thisRefError);
        } else {
          console.log('✅ This month referrals:', thisMonthReferrals);
        }

        // ✅ Count last month's referrals (fetch data to avoid 400 errors)
        const { data: lastMonthData, error: lastRefError } = await supabase
          .from('client_team_assignments')
          .select('id')
          .eq('professional_id', currentProfessional.id)
          .gte('created_at', lastMonthStart.toISOString())
          .lt('created_at', thisMonthStart.toISOString());

        const lastMonthReferrals = lastMonthData?.length ?? 0;

        if (lastRefError) {
          console.error('❌ Error counting last month referrals:', lastRefError);
        } else {
          console.log('✅ Last month referrals:', lastMonthReferrals);
        }

        // Return metrics without closed loans (set to 0)
        const result = {
          thisMonth: {
            referralsReceived: thisMonthReferrals ?? 0,
            closedLoans: 0, // Not tracking closed loans
            conversionRate: 0 // Not tracking conversion rate without closed loans
          },
          lastMonth: {
            referralsReceived: lastMonthReferrals ?? 0,
            closedLoans: 0, // Not tracking closed loans
            conversionRate: 0 // Not tracking conversion rate without closed loans
          }
        };

        console.log('📈 Final performance metrics:', result);
        return result;

      } catch (error) {
        console.error('❌ Unexpected error in performance metrics:', error);
        return {
          thisMonth: { referralsReceived: 0, closedLoans: 0, conversionRate: 0 },
          lastMonth: { referralsReceived: 0, closedLoans: 0, conversionRate: 0 }
        };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Combine into a simple stats object for the dashboard
  const stats = {
    propertiesAnalyzed: (performanceMetrics?.thisMonth?.referralsReceived || 0) + (performanceMetrics?.lastMonth?.referralsReceived || 0),
    lmiEligible: performanceMetrics?.thisMonth?.closedLoans || 0, // Will always be 0
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