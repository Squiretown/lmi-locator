import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { getTractFillColor, getTractLineColor, getTractLineWidth } from '../MapStyles';
import { CensusTract } from '../../../hooks/types/census-tract';

interface TractWithSelection extends CensusTract {
  isSelected?: boolean;
}

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

    // Add fill layer if it doesn't exist
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

    // Add line layer if it doesn't exist
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
  const updateTractData = useCallback((map: mapboxgl.Map, tracts: TractWithSelection[]) => {
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
        selected: tract.isSelected || selectedTracts.has(tract.tractId)
      },
      geometry: tract.geometry
    }));

    const source = map.getSource('tracts') as mapboxgl.GeoJSONSource;
    source.setData({
      type: 'FeatureCollection',
      features
    });
  }, []);

  // Keep track of selected tracts
  const selectedTracts = new Set<string>();

  /**
   * Add a click handler to the map for tract selection
   */
  const setupTractSelection = useCallback((
    map: mapboxgl.Map, 
    onSelectTract: (tract: CensusTract, selected: boolean) => void
  ) => {
    map.on('click', 'tract-fills', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties as any;
      const tractId = properties.tractId;
      
      // Toggle selection
      const isSelected = !selectedTracts.has(tractId);
      
      if (isSelected) {
        selectedTracts.add(tractId);
      } else {
        selectedTracts.delete(tractId);
      }
      
      // Update the source data with new selection state
      const source = map.getSource('tracts') as mapboxgl.GeoJSONSource;
      const currentData = (source as any)._data || { features: [] };
      
      // Update the 'selected' property for the clicked feature
      const updatedFeatures = currentData.features.map((f: any) => {
        if (f.properties.tractId === tractId) {
          return {
            ...f,
            properties: {
              ...f.properties,
              selected: isSelected
            }
          };
        }
        return f;
      });
      
      // Set the updated data
      source.setData({
        type: 'FeatureCollection',
        features: updatedFeatures
      });
      
      // Notify about selection change
      const tractData: CensusTract = {
        tractId: properties.tractId,
        isLmiEligible: properties.isLmiEligible,
        amiPercentage: properties.amiPercentage,
        medianIncome: properties.medianIncome,
        incomeCategory: properties.incomeCategory,
        propertyCount: properties.propertyCount,
        geometry: feature.geometry
      };
      
      onSelectTract(tractData, isSelected);
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
