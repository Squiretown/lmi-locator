
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
        
        // For development, you can fallback to a hardcoded token or env var
        const fallbackToken = process.env.MAPBOX_TOKEN;
        
        // Try to get token from Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.warn('Error from Supabase:', error.message);
          
          if (fallbackToken) {
            console.log('Using fallback token');
            setToken(fallbackToken);
            return;
          }
          
          throw new Error(error.message);
        }
        
        if (data && data.token) {
          setToken(data.token);
        } else if (fallbackToken) {
          setToken(fallbackToken);
        } else {
          throw new Error('No token received from server');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch Mapbox token');
        toast({
          title: "Map Loading Error",
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
