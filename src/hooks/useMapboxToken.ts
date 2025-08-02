
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type MapboxToken = {
  token: string | null;
  error: string | null;
  isLoading: boolean;
};

export function useMapboxToken() {
  const [mapboxToken, setMapboxToken] = useState<MapboxToken>({
    token: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const fetchMapboxToken = async () => {
      console.log('Starting Mapbox token fetch...');
      
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        console.log('Mapbox token response:', { data, error });
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          const errorMessage = error.message || 'Failed to fetch Mapbox token';
          console.error('Full error details:', error);
          
          setMapboxToken({
            token: null,
            error: errorMessage,
            isLoading: false,
          });
          return;
        }

        if (data?.token) {
          console.log('Mapbox token fetched successfully, length:', data.token.length);
          setMapboxToken({
            token: data.token,
            error: null,
            isLoading: false,
          });
        } else {
          console.error('No Mapbox token returned from edge function');
          console.error('Response data:', data);
          
          setMapboxToken({
            token: null,
            error: 'No token returned from server',
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Exception fetching Mapbox token:', error);
        console.error('Exception stack:', error instanceof Error ? error.stack : 'No stack available');
        
        setMapboxToken({
          token: null,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
          isLoading: false,
        });
      }
    };

    fetchMapboxToken();
  }, []);

  return mapboxToken;
}
