
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';

// We'll update to use environment variable or a config instead of hardcoding
const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZWRldiIsImEiOiJjbHQwZHBtam4wbzI2MnFueGVrYTJhOTNrIn0.o49OpQnTnzw_51CEtbFmFQ';

interface MapContainerProps {
  tracts: any[];
  onTractClick: (tract: any) => void;
  selectedTract: any | null;
  selectedTracts: any[];
  onSelectTract: (tract: any) => void;
}

export interface MapRef {
  fitBounds: (bounds: mapboxgl.LngLatBoundsLike) => void;
  flyTo: (options: mapboxgl.CameraOptions & mapboxgl.AnimationOptions) => void;
}

const MapContainer = forwardRef<MapRef, MapContainerProps>(
  ({ tracts, onTractClick, selectedTract, selectedTracts, onSelectTract }, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);
    const { toast } = useToast();

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      fitBounds: (bounds: mapboxgl.LngLatBoundsLike) => {
        if (map.current) {
          map.current.fitBounds(bounds, {
            padding: 50,
            animate: true
          });
        }
      },
      flyTo: (options: mapboxgl.CameraOptions & mapboxgl.AnimationOptions) => {
        if (map.current) {
          map.current.flyTo(options);
        }
      }
    }));

    // Initialize map
    useEffect(() => {
      if (!mapContainer.current || map.current) return;
      
      try {
        // Set token before creating map
        mapboxgl.accessToken = MAPBOX_TOKEN;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-95.7129, 37.0902], // Center of US
          zoom: 3
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
    }, [toast]);

    // Add tract data sources and layers when tracts or map changes
    useEffect(() => {
      if (!map.current || !mapLoaded || tracts.length === 0) return;

      // First, check if source already exists and remove it if it does
      if (map.current.getSource('census-tracts')) {
        map.current.removeLayer('tract-fills');
        map.current.removeLayer('tract-outlines');
        map.current.removeSource('census-tracts');
      }

      // Create GeoJSON feature collection from tracts
      const geojson = {
        type: 'FeatureCollection' as const,
        features: tracts.map(tract => ({
          type: 'Feature' as const,
          geometry: tract.geometry,
          properties: {
            tractId: tract.tractId,
            isLmiEligible: tract.isLmiEligible,
            amiPercentage: tract.amiPercentage,
            incomeCategory: tract.incomeCategory,
            propertyCount: tract.propertyCount,
            selected: selectedTracts.some(t => t.tractId === tract.tractId)
          }
        }))
      };

      try {
        // Add source
        map.current.addSource('census-tracts', {
          type: 'geojson',
          data: geojson
        });

        // Add fill layer
        map.current.addLayer({
          id: 'tract-fills',
          type: 'fill',
          source: 'census-tracts',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'selected'], true], '#3b82f6', // blue for selected
              ['==', ['get', 'isLmiEligible'], true], '#22c55e', // green for LMI eligible
              '#ef4444' // red for non-eligible
            ],
            'fill-opacity': 0.5
          }
        });

        // Add outline layer
        map.current.addLayer({
          id: 'tract-outlines',
          type: 'line',
          source: 'census-tracts',
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'selected'], true], '#2563eb', // blue for selected
              ['==', ['get', 'isLmiEligible'], true], '#16a34a', // green for LMI eligible
              '#dc2626' // red for non-eligible
            ],
            'line-width': [
              'case',
              ['==', ['get', 'selected'], true], 2,
              1
            ]
          }
        });

        // Add click event
        map.current.on('click', 'tract-fills', (e) => {
          if (e.features && e.features[0]) {
            const tractId = e.features[0].properties?.tractId;
            const clickedTract = tracts.find(t => t.tractId === tractId);
            if (clickedTract) {
              onTractClick(clickedTract);
            }
          }
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'tract-fills', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current.on('mouseleave', 'tract-fills', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });

        // Fit bounds to all tracts if we have data
        if (tracts.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          
          tracts.forEach(tract => {
            if (tract.geometry && tract.geometry.coordinates) {
              tract.geometry.coordinates.forEach((ring: any) => {
                ring.forEach((coord: [number, number]) => {
                  bounds.extend(coord as mapboxgl.LngLatLike);
                });
              });
            }
          });
          
          if (!bounds.isEmpty()) {
            map.current.fitBounds(bounds, {
              padding: 50,
              animate: true
            });
          }
        }
      } catch (error) {
        console.error('Error adding tract data to map:', error);
        toast({
          title: "Data Display Error",
          description: "There was an issue displaying tract data on the map.",
          variant: "destructive",
        });
      }
    }, [tracts, mapLoaded, selectedTracts, onTractClick, toast]);

    // Update style when selected tract changes
    useEffect(() => {
      if (!map.current || !mapLoaded || !map.current.getSource('census-tracts')) return;

      try {
        // Update the 'selected' property in the GeoJSON source
        const source = map.current.getSource('census-tracts') as mapboxgl.GeoJSONSource;
        if (!source) return;

        // Create a new GeoJSON data object with updated selection states
        const updatedGeoJson = {
          type: 'FeatureCollection' as const,
          features: tracts.map(tract => ({
            type: 'Feature' as const,
            geometry: tract.geometry,
            properties: {
              tractId: tract.tractId,
              isLmiEligible: tract.isLmiEligible,
              amiPercentage: tract.amiPercentage,
              incomeCategory: tract.incomeCategory,
              propertyCount: tract.propertyCount,
              selected: selectedTracts.some(t => t.tractId === tract.tractId)
            }
          }))
        };

        source.setData(updatedGeoJson);
      } catch (error) {
        console.error('Error updating tract selection on map:', error);
      }
    }, [selectedTract, selectedTracts, mapLoaded, tracts]);

    return (
      <div className="h-full w-full relative">
        <div ref={mapContainer} className="h-full w-full" />
        {!mapLoaded && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="text-lg">Loading map...</div>
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/75">
            <Card className="p-4 max-w-md text-center">
              <p className="text-destructive font-medium mb-2">{mapError}</p>
              <p className="text-sm text-muted-foreground">
                Please check your internet connection or Mapbox API key.
              </p>
            </Card>
          </div>
        )}
      </div>
    );
  }
);

MapContainer.displayName = 'MapContainer';
export default MapContainer;
