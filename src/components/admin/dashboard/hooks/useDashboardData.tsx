
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

      // Check if user is admin using the safe function
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin_user_safe');
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        throw new Error('Failed to verify admin privileges');
      }

      if (!isAdmin) {
        throw new Error('Admin privileges required to view dashboard statistics');
      }

      // Fetch users from the list-users edge function instead of user_profiles
      const { data: userListResponse, error: userListError } = await supabase.functions.invoke('list-users');
      
      if (userListError) {
        console.error('Error fetching users:', userListError);
        throw new Error('Failed to fetch user data');
      }

      const users = userListResponse?.users || [];
      console.log('Fetched users:', users.length);

      // Count users by type from the actual user metadata
      const userCounts = {
        total: users.length,
        admin: users.filter(u => u.user_metadata?.user_type === 'admin').length,
        realtor: users.filter(u => u.user_metadata?.user_type === 'realtor').length,
        mortgage_professional: users.filter(u => u.user_metadata?.user_type === 'mortgage_professional').length,
        client: users.filter(u => u.user_metadata?.user_type === 'client' || !u.user_metadata?.user_type).length
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

      console.log('Dashboard data fetched successfully', {
        userCount: userCounts.total,
        realtorCount: userCounts.realtor,
        mortgageBrokerCount: userCounts.mortgage_professional,
        clientCount: userCounts.client,
        adminCount: userCounts.admin,
        propertyCount: propertyCount || 0
      });

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
