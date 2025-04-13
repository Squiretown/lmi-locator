
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MapboxTokenResponse {
  token: string;
  source: 'edge-function' | 'fallback';
}

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  
  // Maximum number of retries
  const MAX_RETRIES = 2;

  // Dedicated function to fetch the token
  const fetchMapboxToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting to fetch Mapbox token from Supabase Edge Function...');
      
      // Try to get token from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) {
        console.warn('Error from Supabase Edge Function:', error.message);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (data?.token) {
        console.log('Successfully received Mapbox token from edge function');
        setToken(data.token);
        return;
      } else {
        throw new Error('No token received from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching Mapbox token:', errorMessage);
      
      // Set the error state
      setError(`Failed to fetch Mapbox token: ${errorMessage}`);
      
      // Use fallback token as last resort
      if (retryCount >= MAX_RETRIES) {
        console.warn('Using fallback token after exhausting retries');
        const fallbackToken = 'pk.eyJ1IjoibG1pLWNoZWNrIiwiYSI6ImNsMGU5czFxazBteWsza28zYzZwamp6a2EifQ.onw-vuJvmfJJiLl5hernXw';
        setToken(fallbackToken);
        
        toast({
          title: "Map Loading Warning",
          description: "Using fallback map configuration. Some features might be limited.",
          variant: "default",
        });
      } else {
        // Increment retry count for next attempt
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount, toast]);

  // Effect for initial token fetch and retries
  useEffect(() => {
    fetchMapboxToken();
    
    // Set up retry logic with exponential backoff
    if (error && retryCount < MAX_RETRIES) {
      const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
      const retryTimer = setTimeout(() => {
        console.log(`Retrying Mapbox token fetch (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
        fetchMapboxToken();
      }, retryDelay);
      
      return () => clearTimeout(retryTimer);
    }
  }, [fetchMapboxToken, error, retryCount]);

  // Function to manually retry fetching the token
  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
    fetchMapboxToken();
  }, [fetchMapboxToken]);

  return { 
    token, 
    isLoading, 
    error, 
    retry, 
    isUsingFallback: !!error && !!token 
  };
}
