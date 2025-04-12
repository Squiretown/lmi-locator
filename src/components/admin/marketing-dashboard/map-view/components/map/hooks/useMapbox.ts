
import { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { useToast } from '@/hooks/use-toast';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import { MAP_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM } from '../MapStyles';

export const useMapbox = (containerRef: React.RefObject<HTMLDivElement>) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();
  const { token: mapboxToken, isLoading: isLoadingToken, error: tokenError } = useMapboxToken();

  useEffect(() => {
    if (!containerRef.current || map.current || !mapboxToken || isLoadingToken) return;
    
    try {
      // Set token before creating map
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        setMapLoaded(true);
      });
      
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map. Please check your internet connection.');
        toast({
          title: "Map Error",
          description: "There was an issue loading the map. Please try refreshing.",
          variant: "destructive",
        });
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, isLoadingToken, toast, containerRef]);

  // Handle token error
  useEffect(() => {
    if (tokenError) {
      setMapError(`Failed to load Mapbox token: ${tokenError}`);
    }
  }, [tokenError]);

  // Create functions to expose map functionality
  const flyToLocation = (options: mapboxgl.CameraOptions & mapboxgl.AnimationOptions) => {
    if (map.current) {
      map.current.flyTo(options);
    }
  };

  const fitBounds = (bounds: mapboxgl.LngLatBoundsLike) => {
    if (map.current) {
      map.current.fitBounds(bounds, {
        padding: 50,
        animate: true
      });
    }
  };

  return {
    map: map.current,
    mapLoaded,
    mapError,
    isLoadingToken,
    flyToLocation,
    fitBounds
  };
};
