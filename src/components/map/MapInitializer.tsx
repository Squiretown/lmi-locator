
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { loadTractBoundary } from './utils/tractBoundaryLoader';

interface MapInitializerProps {
  mapboxToken: string;
  lat: number;
  lon: number;
  isEligible: boolean;
  tractId?: string;
  onMapError: (error: string) => void;
  onTractBoundaryError: (error: string) => void;
}

const MapInitializer: React.FC<MapInitializerProps> = ({
  mapboxToken,
  lat,
  lon,
  isEligible,
  tractId,
  onMapError,
  onTractBoundaryError
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const hasLoadedTractBoundaries = useRef<boolean>(false);

  useEffect(() => {
    if (!mapRef.current || !mapboxToken) return;

    try {
      // Clean up previous map if it exists
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        hasLoadedTractBoundaries.current = false;
      }

      // Initialize the map
      mapboxgl.accessToken = mapboxToken;
      
      mapInstance.current = new mapboxgl.Map({
        container: mapRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lon, lat],
        zoom: 12
      });
      
      // Add navigation controls
      mapInstance.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );
      
      // Wait for map to load before adding markers
      mapInstance.current.on('load', () => {
        if (!mapInstance.current) return;
        
        // Add a marker at the location
        new mapboxgl.Marker({
          color: isEligible ? '#22c55e' : '#ef4444' // Green if eligible, red if not
        })
          .setLngLat([lon, lat])
          .addTo(mapInstance.current);
          
        // Try to load tract boundaries if we have a tract ID
        if (tractId && !hasLoadedTractBoundaries.current) {
          loadTractBoundary(tractId, mapInstance.current, isEligible)
            .then(() => {
              hasLoadedTractBoundaries.current = true;
            })
            .catch((error) => {
              console.error('Error loading tract boundary in effect:', error);
              onTractBoundaryError(error instanceof Error ? error.message : String(error));
            });
        }
      });
      
      // Handle map errors
      mapInstance.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        onMapError('Failed to load map components. Please try again later.');
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      onMapError('Failed to initialize map. Please try again later.');
    }
    
    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lon, isEligible, mapboxToken, tractId, onMapError, onTractBoundaryError]);

  return <div ref={mapRef} className="w-full h-full" />;
};

export default MapInitializer;
