
import { ESRI_API_KEY, ESRI_GEOCODING_API_URL } from '../config';
import { EsriGeocodeResponse } from '../types';
import { GeocodeApproachResult } from './types';

/**
 * Approach 3: Using SingleLine parameter
 * @param address Full address string to geocode
 * @returns Geocoding result with API response data
 */
export async function trySingleLine(address: string): Promise<GeocodeApproachResult | null> {
  try {
    console.log('[ESRI] Trying Approach 3: Using SingleLine parameter');
    const params = new URLSearchParams({
      SingleLine: address,
      outFields: 'Addr_type,StAddr,City,Region,Postal',
      f: 'json',
      token: ESRI_API_KEY,
      maxLocations: '1'
    });
    
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
        console.log('[ESRI] Approach 3 succeeded!');
        return { 
          response, 
          data,
          requestUrl
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 3 failed:', error);
    return null;
  }
}
