
import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { getTractFillColor, getTractLineColor, getTractLineWidth } from '../MapStyles';
import { CensusTract } from '../../../hooks/types/census-tract';

/**
 * Hook for managing map layers
 */
export function useMapLayers() {
  /**
   * Add census tract layers to the map
   */
  const addTractLayers = useCallback((map: mapboxgl.Map) => {
    if (!map.getSource('tracts')) {
      // Add the source first if it doesn't exist
      map.addSource('tracts', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });
    }

    // Add fill layer
    if (!map.getLayer('tract-fills')) {
      map.addLayer({
        id: 'tract-fills',
        type: 'fill',
        source: 'tracts',
        paint: {
          'fill-color': getTractFillColor(),
          'fill-opacity': 0.5
        }
      });
    }

    // Add line layer
    if (!map.getLayer('tract-lines')) {
      map.addLayer({
        id: 'tract-lines',
        type: 'line',
        source: 'tracts',
        paint: {
          'line-color': getTractLineColor(),
          'line-width': getTractLineWidth()
        }
      });
    }
  }, []);

  /**
   * Update the tracts source with new data
   */
  const updateTractData = useCallback((map: mapboxgl.Map, tracts: CensusTract[]) => {
    if (!map || !map.getSource('tracts')) return;

    const features = tracts.map(tract => ({
      type: 'Feature' as const,
      properties: {
        tractId: tract.tractId,
        isLmiEligible: tract.isLmiEligible,
        amiPercentage: tract.amiPercentage,
        medianIncome: tract.medianIncome,
        incomeCategory: tract.incomeCategory,
        propertyCount: tract.propertyCount,
        selected: false
      },
      geometry: tract.geometry
    }));

    (map.getSource('tracts') as mapboxgl.GeoJSONSource).setData({
      type: 'FeatureCollection',
      features
    });
  }, []);

  /**
   * Add a click handler to the map for tract selection
   */
  const setupTractSelection = useCallback((
    map: mapboxgl.Map, 
    onSelectTract: (tract: CensusTract, selected: boolean) => void
  ) => {
    // Store the selected feature id
    let selectedTractId: string | null = null;

    map.on('click', 'tract-fills', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties as any;
      
      // Deselect previous tract if there was one
      if (selectedTractId) {
        const prevFeatures = map.querySourceFeatures('tracts', {
          filter: ['==', ['get', 'tractId'], selectedTractId]
        });
        
        if (prevFeatures.length > 0) {
          const isDeselecting = selectedTractId === properties.tractId;
          
          // Update the 'selected' property to false for the previously selected tract
          prevFeatures.forEach(prevFeature => {
            if (prevFeature.properties) {
              prevFeature.properties.selected = false;
            }
          });
          
          // If we're deselecting the same tract, don't select a new one
          if (isDeselecting) {
            // Notify about deselection
            onSelectTract({
              tractId: properties.tractId,
              isLmiEligible: properties.isLmiEligible,
              amiPercentage: properties.amiPercentage,
              medianIncome: properties.medianIncome,
              incomeCategory: properties.incomeCategory,
              propertyCount: properties.propertyCount,
              geometry: feature.geometry
            }, false);
            
            selectedTractId = null;
            (map.getSource('tracts') as mapboxgl.GeoJSONSource).setData(
              map.getSource('tracts')._data as GeoJSON.FeatureCollection
            );
            return;
          }
        }
      }
      
      // Select the new tract
      selectedTractId = properties.tractId;
      
      // Update the 'selected' property to true for the newly selected tract
      if (feature.properties) {
        feature.properties.selected = true;
      }
      
      // Update the source data to reflect the selection state
      (map.getSource('tracts') as mapboxgl.GeoJSONSource).setData(
        map.getSource('tracts')._data as GeoJSON.FeatureCollection
      );
      
      // Notify about selection
      onSelectTract({
        tractId: properties.tractId,
        isLmiEligible: properties.isLmiEligible,
        amiPercentage: properties.amiPercentage,
        medianIncome: properties.medianIncome,
        incomeCategory: properties.incomeCategory,
        propertyCount: properties.propertyCount,
        geometry: feature.geometry
      }, true);
    });
    
    // Change cursor on hover
    map.on('mouseenter', 'tract-fills', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'tract-fills', () => {
      map.getCanvas().style.cursor = '';
    });
  }, []);

  return {
    addTractLayers,
    updateTractData,
    setupTractSelection
  };
}
