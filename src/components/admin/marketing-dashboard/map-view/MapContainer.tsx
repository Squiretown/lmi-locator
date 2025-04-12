
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CensusTract } from './hooks/types/census-tract';
import { createTractGeoJSON } from './components/map/GeoJSONBuilder';
import { useMapbox } from './components/map/hooks/useMapbox';
import { useMapLayers } from './components/map/hooks/useMapLayers';
import MapError from './components/map/MapError';
import MapLoading from './components/map/MapLoading';

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
    const mapContainer = useRef<HTMLDivElement>(null);
    const { 
      map, 
      mapLoaded, 
      mapError, 
      isLoadingToken, 
      flyToLocation, 
      fitBounds 
    } = useMapbox(mapContainer);
    
    const { 
      addMapLayers, 
      updateMapSource, 
      handleMapClick, 
      setupHoverEffects,
      fitMapBounds 
    } = useMapLayers();

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      fitBounds,
      flyTo: flyToLocation
    }));

    // Add tract data sources and layers when tracts or map changes
    useEffect(() => {
      if (!map || !mapLoaded || tracts.length === 0) return;

      const geoJson = createTractGeoJSON(tracts, selectedTracts);
      
      try {
        addMapLayers(map, geoJson);
        
        // Set up click handler
        handleMapClick(map, (feature) => {
          const tractId = feature.properties?.tractId;
          const clickedTract = tracts.find(t => t.tractId === tractId);
          if (clickedTract) {
            onTractClick(clickedTract);
          }
        });
        
        // Set up hover effects
        setupHoverEffects(map);
        
        // Fit bounds to all tracts
        fitMapBounds(map, geoJson.features);
        
      } catch (error) {
        console.error('Error adding tract data to map:', error);
      }
    }, [tracts, mapLoaded, addMapLayers, handleMapClick, setupHoverEffects, fitMapBounds, map, selectedTracts, onTractClick]);

    // Update source when selected tracts change
    useEffect(() => {
      if (!map || !mapLoaded || !map.getSource('census-tracts')) return;

      try {
        // Update the 'selected' property in the GeoJSON source
        const source = map.getSource('census-tracts') as mapboxgl.GeoJSONSource;
        if (!source) return;

        const updatedGeoJson = createTractGeoJSON(tracts, selectedTracts);
        updateMapSource(source, updatedGeoJson);
      } catch (error) {
        console.error('Error updating tract selection on map:', error);
      }
    }, [selectedTract, selectedTracts, mapLoaded, tracts, map, updateMapSource]);

    return (
      <div className="h-full w-full relative">
        <div ref={mapContainer} className="h-full w-full" />
        {(isLoadingToken || (!mapLoaded && !mapError)) && <MapLoading />}
        {mapError && <MapError errorMessage={mapError} />}
      </div>
    );
  }
);

MapContainer.displayName = 'MapContainer';
export default MapContainer;
