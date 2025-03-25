
import { ESRI_API_KEY, ESRI_GEOCODING_API_URL } from '../config';
import { EsriGeocodeResponse } from '../types';
import { parseAddressComponents } from '../utils';
import { GeocodeApproachResult } from './types';

/**
 * Approach 4: Using parsed address components
 * @param address Full address string to geocode
 * @returns Geocoding result with API response data
 */
export async function tryParsedComponents(address: string): Promise<GeocodeApproachResult | null> {
  try {
    console.log('[ESRI] Trying Approach 4: Using parsed address components');
    const components = parseAddressComponents(address);
    console.log('[ESRI] Parsed address components:', components);
    
    const params = new URLSearchParams({
      f: 'json',
      token: ESRI_API_KEY,
      maxLocations: '1',
      outFields: '*'
    });
    
    // Add address components if available
    if (components.street) params.append('address', components.street);
    if (components.city) params.append('city', components.city);
    if (components.state) params.append('region', components.state);
    if (components.zip) params.append('postal', components.zip);
    
    const requestUrl = `${ESRI_GEOCODING_API_URL}?${params.toString()}`;
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data: EsriGeocodeResponse = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        console.log('[ESRI] Approach 4 succeeded!');
        return { 
          response, 
          data,
          requestUrl
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 4 failed:', error);
    return null;
  }
}
