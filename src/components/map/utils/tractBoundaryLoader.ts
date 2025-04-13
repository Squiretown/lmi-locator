
import mapboxgl from 'mapbox-gl';

/**
 * Loads census tract boundary data to a Mapbox map instance
 * 
 * @param tractId Census tract ID
 * @param map Mapbox GL map instance
 * @param isEligible Whether the tract is eligible
 * @returns Promise that resolves when boundary is loaded
 */
export async function loadTractBoundary(
  tractId: string, 
  map: mapboxgl.Map, 
  isEligible: boolean
): Promise<void> {
  try {
    console.log(`Attempting to load boundary for tract: ${tractId}`);
    
    // Convert tractId to correct format if needed (some APIs expect slightly different formats)
    const formattedTractId = tractId.padStart(11, '0');
    console.log(`Using formatted tract ID: ${formattedTractId} (original: ${tractId})`);
    
    // Try multiple sources for tract boundary data - this improves our chances of finding the right data
    const apiEndpoints = [
      // Try the original API with the original tract ID
      `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2/query?where=GEOID='${tractId}'&outFields=*&outSR=4326&f=geojson`,
      // Try with formatted tract ID
      `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Current/MapServer/2/query?where=GEOID='${formattedTractId}'&outFields=*&outSR=4326&f=geojson`,
      // Try the ACS2019 service
      `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2019/MapServer/8/query?where=GEOID='${tractId}'&outFields=*&outSR=4326&f=geojson`,
      // Try the Census2020 service
      `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Census2020/MapServer/10/query?where=GEOID='${tractId}'&outFields=*&outSR=4326&f=geojson`,
      // Try with a different parameter - using TRACT instead of GEOID
      `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_Census2020/MapServer/10/query?where=TRACT='${tractId.slice(-6)}'&outFields=*&outSR=4326&f=geojson`,
      // Try the FedGIS service which might have more comprehensive data
      `https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services/USA_Census_Tract_Boundaries_Current/FeatureServer/0/query?where=GEOID='${tractId}'&outFields=*&outSR=4326&f=geojson`,
    ];
    
    let data;
    let boundaryFound = false;
    
    // Try each API endpoint until we find data
    for (const endpoint of apiEndpoints) {
      try {
        console.log(`Trying to fetch tract boundary from: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          console.log(`API endpoint failed with status: ${response.status}`);
          continue; // Try the next endpoint
        }
        
        const responseData = await response.json();
        
        if (responseData.features && responseData.features.length > 0) {
          console.log(`Successfully loaded tract boundary from: ${endpoint}`);
          data = responseData;
          boundaryFound = true;
          break; // We found data, exit the loop
        } else {
          console.log(`No features found in response from: ${endpoint}`);
        }
      } catch (endpointError) {
        console.error(`Error with endpoint ${endpoint}:`, endpointError);
        // Continue to next endpoint
      }
    }
    
    if (!boundaryFound || !data) {
      throw new Error('No boundary data found for this tract ID after trying multiple sources');
    }
    
    console.log('Successfully loaded tract boundary data');
    
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
    
    // Fit map to the tract boundary
    fitMapToBoundary(map, data);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error loading tract boundary:', error);
    return Promise.reject(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Helper function to fit map view to the boundary
 */
function fitMapToBoundary(map: mapboxgl.Map, data: any): void {
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
}
