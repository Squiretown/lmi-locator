
import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAP_STYLE } from '../MapStyles';
import { CensusTract } from '../../../hooks/types/census-tract';

export interface UseMapboxOptions {
  onMapLoaded?: (map: mapboxgl.Map) => void;
  onMapError?: (error: Error) => void;
  accessToken?: string;
}

/**
 * Hook for initializing and managing a Mapbox map
 */
export function useMapbox({ 
  onMapLoaded, 
  onMapError,
  accessToken 
}: UseMapboxOptions = {}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !accessToken) return;
    
    try {
      // Set the access token when available
      const token = accessToken as string;
      setError(null);
      
      mapboxgl.accessToken = token;
      
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_STYLE,
        center: DEFAULT_CENTER as mapboxgl.LngLatLike,
        zoom: DEFAULT_ZOOM
      });
      
      map.current = mapInstance;
      
      mapInstance.on('load', () => {
        setIsLoaded(true);
        if (onMapLoaded) onMapLoaded(mapInstance);
      });
      
      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e);
        const mapError = new Error(e.error?.message || 'An error occurred with the map');
        setError(mapError);
        if (onMapError) onMapError(mapError);
      });
      
      // Add navigation controls
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Cleanup
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing map:', err);
      const initError = err instanceof Error ? err : new Error('Failed to initialize map');
      setError(initError);
      if (onMapError) onMapError(initError);
    }
  }, [accessToken, onMapLoaded, onMapError]);

  // Fly to given coordinates
  const flyTo = useCallback((coordinates: [number, number], zoom = DEFAULT_ZOOM) => {
    if (map.current) {
      map.current.flyTo({ center: coordinates, zoom, essential: true });
    }
  }, []);

  // Fit map to bounds of features
  const fitBounds = useCallback((tracts: CensusTract[]) => {
    if (!map.current || tracts.length === 0) return;
    
    try {
      // Create a bounding box that includes all tracts
      const bounds = new mapboxgl.LngLatBounds();
      
      tracts.forEach(tract => {
        if (tract.geometry.type === 'Polygon') {
          tract.geometry.coordinates[0].forEach((coord: [number, number]) => {
            bounds.extend(coord as mapboxgl.LngLatLike);
          });
        } else if (tract.geometry.type === 'MultiPolygon') {
          tract.geometry.coordinates.forEach((polygon: [number, number][][]) => {
            polygon[0].forEach((coord: [number, number]) => {
              bounds.extend(coord as mapboxgl.LngLatLike);
            });
          });
        }
      });
      
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12
        });
      }
    } catch (error) {
      console.error('Error fitting bounds:', error);
    }
  }, []);

  return {
    mapContainer,
    map: map.current,
    isLoaded,
    error,
    flyTo,
    fitBounds
  };
}
