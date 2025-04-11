
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { InfoIcon, MapPin, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapProps {
  lat: number;
  lon: number;
  isEligible: boolean;
  tractId?: string;
}

const ResultsMap: React.FC<MapProps> = ({ lat, lon, isEligible, tractId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
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
      // Try to fetch tract boundary from Supabase or public API
      const response = await fetch(`https://api.census.gov/data/reference/tigerweb/v1/tract?fips=${tractId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.features && data.features.length > 0) {
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
          const bounds = new mapboxgl.LngLatBounds();
          data.features[0].geometry.coordinates[0].forEach((coord: number[]) => {
            bounds.extend([coord[0], coord[1]]);
          });
          
          map.fitBounds(bounds, { padding: 40 });
        } else {
          console.log('No boundary data found for tract ID:', tractId);
        }
      } else {
        console.log('Failed to fetch tract boundary:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading tract boundary:', error);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full mt-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="rounded-lg overflow-hidden border shadow-lg bg-card">
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-medium">Census Tract Map</h2>
            <div className="flex items-center text-xs text-muted-foreground">
              <InfoIcon className="h-3.5 w-3.5 mr-1" />
              <span>Data from U.S. Census Bureau ACS 5-Year Estimates</span>
            </div>
          </div>
          
          <div 
            ref={mapRef} 
            className="w-full h-[350px] md:h-[450px] bg-secondary/50 relative"
          >
            {isLoadingToken && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6">
                  <p className="text-muted-foreground mb-2">Loading map...</p>
                </div>
              </div>
            )}
            
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="m-4 p-4 max-w-md text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-muted-foreground mb-2">{mapError}</p>
                  <p className="text-sm text-muted-foreground">
                    Coordinates: {lat.toFixed(6)}, {lon.toFixed(6)}
                    {tractId && <><br />Tract ID: {tractId}</>}
                  </p>
                </Card>
              </div>
            )}
          </div>
          
          <div className="p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isEligible ? 'bg-eligible' : 'bg-ineligible'}`}></div>
              <span>
                {isEligible ? 'LMI Eligible' : 'Not LMI Eligible'} Census Tract
                {tractId && <> ({tractId})</>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsMap;
