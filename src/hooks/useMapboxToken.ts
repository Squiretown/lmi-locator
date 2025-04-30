
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
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setMapboxToken({
            token: null,
            error: error.message || 'Failed to fetch Mapbox token',
            isLoading: false,
          });
          toast.error("Map Error", {
            description: "Failed to load map resources. Please try again later."
          });
          return;
        }

        if (data?.token) {
          setMapboxToken({
            token: data.token,
            error: null,
            isLoading: false,
          });
          console.log('Mapbox token fetched successfully');
        } else {
          console.error('No Mapbox token returned');
          setMapboxToken({
            token: null,
            error: 'No token returned',
            isLoading: false,
          });
          toast.error("Map Configuration Error", {
            description: "Map token is missing. Please contact support."
          });
        }
      } catch (error) {
        console.error('Exception fetching Mapbox token:', error);
        setMapboxToken({
          token: null,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
          isLoading: false,
        });
        toast.error("Map Service Error", {
          description: "Unable to connect to map services. Please try again later."
        });
      }
    };

    fetchMapboxToken();
  }, []);

  return mapboxToken;
}
