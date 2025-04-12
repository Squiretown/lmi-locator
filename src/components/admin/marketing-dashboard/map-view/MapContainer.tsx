
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { CensusTract } from './hooks/types/census-tract';
import { createTractGeoJSON } from './components/map/GeoJSONBuilder';
import { useMapbox } from './components/map/hooks/useMapbox';
import { useMapLayers } from './components/map/hooks/useMapLayers';
import MapError from './components/map/MapError';
import MapLoading from './components/map/MapLoading';
import { useMapboxToken } from '@/hooks/useMapboxToken';

interface MapContainerProps {
  tracts: CensusTract[];
  onTractClick: (tract: CensusTract) => void;
  selectedTract: CensusTract | null;
  selectedTracts: CensusTract[];
  onSelectTract: (tract: CensusTract) => void;
}

export interface MapRef {
  fitBounds: (bounds: mapboxgl.LngLatBoundsLike) => void;
  flyTo: (options: mapboxgl.CameraOptions & mapboxgl.AnimationOptions) => void;
}

const MapContainer = forwardRef<MapRef, MapContainerProps>(
  ({ tracts, onTractClick, selectedTract, selectedTracts, onSelectTract }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const { token: mapboxToken, isLoading: isLoadingToken, error: tokenError } = useMapboxToken();
    
    const { 
      mapContainer, 
      map, 
      isLoaded, 
      error, 
      flyTo, 
      fitBounds 
    } = useMapbox({
      accessToken: mapboxToken,
      onMapError: (err) => console.error("Map error:", err)
    });
    
    const { 
      addTractLayers, 
      updateTractData, 
      setupTractSelection
    } = useMapLayers();

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      fitBounds: (bounds: mapboxgl.LngLatBoundsLike) => {
        if (map) {
          map.fitBounds(bounds as mapboxgl.LngLatBoundsLike);
        }
      },
      flyTo: (options) => {
        if (map) {
          map.flyTo(options);
        }
      }
    }));

    // Add tract data sources and layers when tracts or map changes
    useEffect(() => {
      if (!map || !isLoaded || tracts.length === 0) return;

      try {
        // Add map layers if they don't exist
        addTractLayers(map);
        
        // Update tract data
        updateTractData(map, tracts);
        
        // Set up click handler and selection
        setupTractSelection(map, (tract, selected) => {
          onTractClick(tract);
        });
        
        // Fit map to show all tracts
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
          map.fitBounds(bounds, {
            padding: 50,
            maxZoom: 12
          });
        }
      } catch (error) {
        console.error('Error adding tract data to map:', error);
      }
    }, [tracts, isLoaded, map, addTractLayers, updateTractData, setupTractSelection, onTractClick]);

    // Update source when selected tracts change
    useEffect(() => {
      if (!map || !isLoaded || tracts.length === 0) return;

      try {
        // Update the tract data to reflect selection state
        updateTractData(map, tracts.map(tract => ({
          ...tract,
          isSelected: selectedTracts.some(t => t.tractId === tract.tractId)
        })));
      } catch (error) {
        console.error('Error updating tract selection on map:', error);
      }
    }, [selectedTract, selectedTracts, isLoaded, tracts, map, updateTractData]);

    return (
      <div className="h-full w-full relative">
        <div ref={mapContainer} className="h-full w-full" />
        {(isLoadingToken || (!isLoaded && !error)) && <MapLoading />}
        {(error || tokenError) && <MapError errorMessage={error?.message || tokenError || 'Unknown map error'} />}
      </div>
    );
  }
);

MapContainer.displayName = 'MapContainer';
export default MapContainer;
