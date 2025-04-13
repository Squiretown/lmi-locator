
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapStatus from './MapStatus';

interface MapDisplayProps {
  lat: number;
  lon: number;
  isEligible: boolean;
  tractId?: string;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ lat, lon, isEligible, tractId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [tractBoundaryError, setTractBoundaryError] = useState<string | null>(null);
  const { token: mapboxToken, isLoading: isLoadingToken, error: tokenError } = useMapboxToken();
  const [hasLoadedTractBoundaries, setHasLoadedTractBoundaries] = useState(false);

  useEffect(() => {
    if (tokenError) {
      setMapError(`Failed to load map configuration: ${tokenError}`);
      return;
    }

    if (!mapRef.current || !mapboxToken || isLoadingToken) return;

    try {
      // Clean up previous map if it exists
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
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
        if (tractId) {
          loadTractBoundary(tractId, mapInstance.current);
        }
      });
      
      // Handle map errors
      mapInstance.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map components. Please try again later.');
      });
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please try again later.');
    }
    
    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lon, isEligible, mapboxToken, isLoadingToken, tokenError, tractId]);
  
  // Function to load census tract boundary
  const loadTractBoundary = async (tractId: string, map: mapboxgl.Map) => {
    if (hasLoadedTractBoundaries) return;
    
    try {
      setTractBoundaryError(null);
      console.log(`Attempting to load boundary for tract: ${tractId}`);
      
      // Try first API endpoint for tract boundary
      let response = await fetch(`https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2/query?where=GEOID='${tractId}'&outFields=*&outSR=4326&f=geojson`);
      
      // If that fails, try the secondary API
      if (!response.ok) {
        console.log(`Primary API failed, trying secondary API for tract: ${tractId}`);
        response = await fetch(`https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2019/MapServer/8/query?where=GEOID='${tractId}'&outFields=*&outSR=4326&f=geojson`);
      }
      
      // If both fail, try the third option
      if (!response.ok) {
        console.log(`Secondary API failed, trying third API for tract: ${tractId}`);
        response = await fetch(`https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Census2020/MapServer/10/query?where=GEOID='${tractId}'&outFields=*&outSR=4326&f=geojson`);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tract boundary data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        throw new Error('No boundary data found for this tract ID');
      }
      
      console.log('Successfully loaded tract boundary data:', data);
      
      // Add source and layer for census tract boundary
      map.addSource('tract-boundary', {
        type: 'geojson',
        data: data
      });
      
      map.addLayer({
        id: 'tract-boundary-line',
        type: 'line',
        source: 'tract-boundary',
        layout: {},
        paint: {
          'line-color': isEligible ? '#22c55e' : '#ef4444',
          'line-width': 2
        }
      });
      
      map.addLayer({
        id: 'tract-boundary-fill',
        type: 'fill',
        source: 'tract-boundary',
        layout: {},
        paint: {
          'fill-color': isEligible ? '#22c55e' : '#ef4444',
          'fill-opacity': 0.2
        }
      });
      
      setHasLoadedTractBoundaries(true);
      
      // Fit map to the tract boundary
      try {
        const bounds = new mapboxgl.LngLatBounds();
        
        // Handle potential different geometry structures
        data.features.forEach((feature: any) => {
          if (feature.geometry && feature.geometry.coordinates) {
            if (feature.geometry.type === 'Polygon') {
              feature.geometry.coordinates[0].forEach((coord: number[]) => {
                bounds.extend([coord[0], coord[1]]);
              });
            } else if (feature.geometry.type === 'MultiPolygon') {
              feature.geometry.coordinates.forEach((polygon: number[][][]) => {
                polygon[0].forEach((coord: number[]) => {
                  bounds.extend([coord[0], coord[1]]);
                });
              });
            }
          }
        });
        
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 40 });
        }
      } catch (fitError) {
        console.error('Error fitting bounds to tract:', fitError);
      }
      
    } catch (error) {
      console.error('Error loading tract boundary:', error);
      setTractBoundaryError(`Unable to load tract boundary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[350px] md:h-[450px] bg-secondary/50 relative"
    >
      <MapStatus 
        isLoadingToken={isLoadingToken} 
        mapError={mapError || tractBoundaryError} 
        lat={lat}
        lon={lon}
        tractId={tractId}
      />
    </div>
  );
};

export default MapDisplay;
