
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMapboxToken() {
      try {
        setIsLoading(true);
        
        // Try to get token from Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.warn('Error from Supabase Edge Function:', error.message);
          throw new Error(error.message);
        }
        
        if (data && data.token) {
          console.log('Successfully received Mapbox token');
          setToken(data.token);
        } else {
          throw new Error('No token received from server');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch Mapbox token');
        
        // Fallback to a temporary public token for development only
        // This is a restricted token that will only work for this demo
        const fallbackToken = 'pk.eyJ1IjoibG1pLWNoZWNrIiwiYSI6ImNsMGU5czFxazBteWsza28zYzZwamp6a2EifQ.onw-vuJvmfJJiLl5hernXw';
        console.warn('Using fallback token for development');
        setToken(fallbackToken);
        
        toast({
          title: "Map Loading Warning",
          description: "Using fallback map configuration. Some features might be limited.",
          variant: "warning",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMapboxToken();
  }, [toast]);

  return { token, isLoading, error };
}
