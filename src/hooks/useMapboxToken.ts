
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
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.token) {
          setToken(data.token);
        } else {
          throw new Error('No token received from server');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch Mapbox token');
        toast({
          title: "Error",
          description: "Failed to load map configuration. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMapboxToken();
  }, [toast]);

  return { token, isLoading, error };
}
