
import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '@/lib/supabase/dashboard';
import { toast } from 'sonner';

interface DashboardStats {
  userCount: number;
  propertyCount: number;
  realtorCount: number;
  mortgageBrokerCount: number;
  searchHistory: any[];
}

const mockStats: DashboardStats = {
  userCount: 1250,
  propertyCount: 3420,
  realtorCount: 89,
  mortgageBrokerCount: 56,
  searchHistory: [
    {
      id: '1',
      address: '123 Main St, San Francisco, CA',
      user_id: 'user1',
      searched_at: new Date().toISOString(),
      is_eligible: true,
      result_count: 5
    },
    {
      id: '2',
      address: '456 Oak Ave, Los Angeles, CA',
      user_id: 'user2',
      searched_at: new Date(Date.now() - 86400000).toISOString(),
      is_eligible: false,
      result_count: 0
    }
  ]
};

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(true);

  const loadDashboardData = useCallback(async () => {
    console.log('Attempting to load dashboard data from database');
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getDashboardStats();
      
      if (result.success) {
        console.log('Dashboard data loaded successfully:', result);
        setStats({
          userCount: result.userCount || 0,
          propertyCount: result.propertyCount || 0,
          realtorCount: result.realtorCount || 0,
          mortgageBrokerCount: 0, // Add this field to the API response
          searchHistory: result.searchHistory || []
        });
        setUsingMockData(false);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to load real data: ${errorMessage}. Using demo data instead.`);
      setStats(mockStats);
      setUsingMockData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    // Start with mock data, then try to load real data
    setStats(mockStats);
    setUsingMockData(true);
    
    // Attempt to load real data
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    isLoading,
    error,
    usingMockData,
    handleRetry
  };
}
