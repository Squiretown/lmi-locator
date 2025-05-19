
import { useState, useCallback, useEffect } from 'react';
import { toast } from "sonner";
import { getDashboardStats } from "@/lib/supabase/dashboard";

interface DashboardStats {
  userCount: number;
  propertyCount: number;
  realtorCount: number;
  searchHistory: any[];
  timestamp?: string;
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    userCount: 0,
    propertyCount: 0,
    realtorCount: 0,
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
      
      // Mock data for fallback
      const mockData = {
        userCount: 156,
        propertyCount: 2874,
        realtorCount: 42,
        searchHistory: [
          { id: '1', user_id: 'user1', address: '123 Main St', timestamp: new Date().toISOString(), result: 'Eligible' },
          { id: '2', user_id: 'user2', address: '456 Elm St', timestamp: new Date().toISOString(), result: 'Not eligible' },
          { id: '3', user_id: 'user3', address: '789 Oak Ave', timestamp: new Date().toISOString(), result: 'Eligible' }
        ],
        timestamp: new Date().toISOString()
      };
      
      console.log("Attempting to load dashboard data");
      
      try {
        const apiData = await getDashboardStats();
        
        if (apiData && apiData.success !== false) {
          console.log('Dashboard stats loaded successfully:', apiData);
          setStats(apiData);
          setUsingMockData(false);
          setHasInitiallyLoaded(true);
        } else {
          console.log('API returned error, using mock data');
          setStats(mockData);
          setUsingMockData(true);
          setHasInitiallyLoaded(true);
          if (apiData?.error) {
            setError(`API Error: ${apiData.error}`);
          }
        }
      } catch (apiError) {
        console.error('API call failed, using mock data', apiError);
        setStats(mockData);
        setUsingMockData(true);
        setHasInitiallyLoaded(true);
        setError(`Failed to fetch dashboard data: ${apiError.message}`);
      }
    } catch (err) {
      console.error('Error in dashboard data loading:', err);
      setError('Failed to load dashboard data. Using default values instead.');
      setUsingMockData(true);
      setHasInitiallyLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]); // Dependency on retryCount to enable manual refresh

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
