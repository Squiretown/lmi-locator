
import { useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { getTractFillColor, getTractLineColor, getTractLineWidth } from '../MapStyles';

export const useMapLayers = () => {
  const addMapLayers = useCallback((map: mapboxgl.Map, data: any) => {
    // Remove existing sources and layers if they exist
    if (map.getSource('census-tracts')) {
      map.removeLayer('tract-fills');
      map.removeLayer('tract-outlines');
      map.removeSource('census-tracts');
    }

    // Add the GeoJSON source with tract data
    map.addSource('census-tracts', {
      type: 'geojson',
      data
    });

    // Add fill layer
    map.addLayer({
      id: 'tract-fills',
      type: 'fill',
      source: 'census-tracts',
      paint: {
        'fill-color': getTractFillColor(),
        'fill-opacity': 0.5
      }
    });

    // Add outline layer
    map.addLayer({
      id: 'tract-outlines',
      type: 'line',
      source: 'census-tracts',
      paint: {
        'line-color': getTractLineColor(),
        'line-width': getTractLineWidth()
      }
    });
  }, []);

  const updateMapSource = useCallback((source: mapboxgl.GeoJSONSource, data: any) => {
    source.setData(data);
  }, []);

  const handleMapClick = useCallback((map: mapboxgl.Map, callback: (feature: any) => void) => {
    map.on('click', 'tract-fills', (e) => {
      if (e.features && e.features[0]) {
        callback(e.features[0]);
      }
    });
  }, []);

  const setupHoverEffects = useCallback((map: mapboxgl.Map) => {
    // Change cursor on hover
    map.on('mouseenter', 'tract-fills', () => {
      if (map) map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'tract-fills', () => {
      if (map) map.getCanvas().style.cursor = '';
    });
  }, []);

  const fitMapBounds = useCallback((map: mapboxgl.Map, features: any[]) => {
    if (features.length === 0) return;
    
    const bounds = new mapboxgl.LngLatBounds();
    
    features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) {
        feature.geometry.coordinates.forEach((ring: any) => {
          ring.forEach((coord: [number, number]) => {
            bounds.extend(coord as mapboxgl.LngLatLike);
          });
        });
      }
    });
    
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: 50,
        animate: true
      });
    }
  }, []);

  return {
    addMapLayers,
    updateMapSource,
    handleMapClick,
    setupHoverEffects,
    fitMapBounds
  };
};
