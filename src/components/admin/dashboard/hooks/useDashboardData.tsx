
import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  userCount: number;
  propertyCount: number;
  realtorCount: number;
  mortgageBrokerCount: number;
  searchHistory: any[];
  timestamp?: string;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    propertyCount: 0,
    realtorCount: 0,
    mortgageBrokerCount: 0,
    searchHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [usingMockData, setUsingMockData] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Attempting to load dashboard data from database");
      
      // Fetch users count
      const { count: userCount, error: userError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (userError) {
        console.error('Error fetching user count:', userError);
        throw new Error(`Failed to fetch user count: ${userError.message}`);
      }

      // Fetch realtors count from professionals table
      const { count: realtorCount, error: realtorError } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'realtor');

      if (realtorError) {
        console.error('Error fetching realtor count:', realtorError);
        throw new Error(`Failed to fetch realtor count: ${realtorError.message}`);
      }

      // Fetch mortgage brokers count from professionals table
      const { count: mortgageBrokerCount, error: brokerError } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'mortgage_broker');

      if (brokerError) {
        console.error('Error fetching mortgage broker count:', brokerError);
        throw new Error(`Failed to fetch mortgage broker count: ${brokerError.message}`);
      }

      // Fetch properties count
      const { count: propertyCount, error: propertyError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      if (propertyError) {
        console.error('Error fetching property count:', propertyError);
        throw new Error(`Failed to fetch property count: ${propertyError.message}`);
      }

      // Fetch recent search history
      const { data: searchHistory, error: searchError } = await supabase
        .from('search_history')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(10);

      if (searchError) {
        console.error('Error fetching search history:', searchError);
        throw new Error(`Failed to fetch search history: ${searchError.message}`);
      }

      const realData = {
        userCount: userCount || 0,
        propertyCount: propertyCount || 0,
        realtorCount: realtorCount || 0,
        mortgageBrokerCount: mortgageBrokerCount || 0,
        searchHistory: searchHistory || [],
        timestamp: new Date().toISOString()
      };

      console.log('Dashboard stats loaded successfully:', realData);
      setStats(realData);
      setUsingMockData(false);
      setHasInitiallyLoaded(true);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      
      // Use mock data as fallback
      const mockData = {
        userCount: 156,
        propertyCount: 2874,
        realtorCount: 42,
        mortgageBrokerCount: 28,
        searchHistory: [
          { id: '1', user_id: 'user1', address: '123 Main St', searched_at: new Date().toISOString(), result: 'Eligible' },
          { id: '2', user_id: 'user2', address: '456 Elm St', searched_at: new Date().toISOString(), result: 'Not eligible' },
          { id: '3', user_id: 'user3', address: '789 Oak Ave', searched_at: new Date().toISOString(), result: 'Eligible' }
        ],
        timestamp: new Date().toISOString()
      };
      
      setStats(mockData);
      setUsingMockData(true);
      setHasInitiallyLoaded(true);
      setError(`Failed to fetch dashboard data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  // Initial data load
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      loadDashboardData();
    }
  }, [loadDashboardData, hasInitiallyLoaded]);

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    toast.info("Refreshing dashboard data...");
  };

  return {
    stats,
    isLoading,
    error,
    usingMockData,
    handleRetry
  };
};
