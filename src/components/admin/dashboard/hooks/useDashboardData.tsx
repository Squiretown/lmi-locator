
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardStats {
  userCount: number;
  propertyCount: number;
  realtorCount: number;
  mortgageBrokerCount: number;
  clientCount: number;
  adminCount: number;
  searchHistory: any[];
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    propertyCount: 0,
    realtorCount: 0,
    mortgageBrokerCount: 0,
    clientCount: 0,
    adminCount: 0,
    searchHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching dashboard statistics...');

      // Check if user is admin using the new safe function
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user_safe');
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        throw new Error('Failed to verify admin privileges');
      }

      if (!isAdmin) {
        throw new Error('Admin privileges required to view dashboard statistics');
      }

      // Fetch user profiles with the new RLS policies
      const { data: userProfiles, error: userError } = await supabase
        .from('user_profiles')
        .select('user_type');

      if (userError) {
        console.error('Error fetching user profiles:', userError);
        // Try to get basic user count from auth.users instead
        console.log('Attempting to get user count from metadata...');
      }

      // Count users by type
      const userCounts = {
        total: userProfiles?.length || 0,
        admin: userProfiles?.filter(u => u.user_type === 'admin').length || 0,
        realtor: userProfiles?.filter(u => u.user_type === 'realtor').length || 0,
        mortgage_professional: userProfiles?.filter(u => u.user_type === 'mortgage_professional').length || 0,
        client: userProfiles?.filter(u => u.user_type === 'client').length || 0
      };

      console.log('User counts by type:', userCounts);

      // Fetch property count
      const { count: propertyCount, error: propertyError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      if (propertyError) {
        console.warn('Error fetching property count:', propertyError);
      }

      // Fetch recent search history
      const { data: searchHistory, error: searchError } = await supabase
        .from('search_history')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(5);

      if (searchError) {
        console.warn('Error fetching search history:', searchError);
      }

      setStats({
        userCount: userCounts.total,
        propertyCount: propertyCount || 0,
        realtorCount: userCounts.realtor,
        mortgageBrokerCount: userCounts.mortgage_professional,
        clientCount: userCounts.client,
        adminCount: userCounts.admin,
        searchHistory: searchHistory || []
      });

      console.log('Dashboard data fetched successfully');

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      
      // Set all stats to 0 when there's an error
      setStats({
        userCount: 0,
        propertyCount: 0,
        realtorCount: 0,
        mortgageBrokerCount: 0,
        clientCount: 0,
        adminCount: 0,
        searchHistory: []
      });
      
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    fetchDashboardData();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    stats,
    isLoading,
    error,
    usingMockData: false,
    handleRetry
  };
};
