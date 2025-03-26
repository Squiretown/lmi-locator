
import { ESRI_API_KEY } from '../config';
import { ESRI_GEOCODING_API_URL } from '../constants';
import { EsriGeocodeResponse } from '../types';
import { GeocodeApproachResult } from './types';

/**
 * Approach 5: Authorization header instead of token parameter
 * @param address Full address string to geocode
 * @returns Geocoding result with API response data
 */
export async function tryAuthHeader(address: string): Promise<GeocodeApproachResult | null> {
  try {
    console.log('[ESRI] Trying Approach 5: Authorization header');
    const params = new URLSearchParams({
      address: address,
      outFields: 'Addr_type,StAddr,City,Region,Postal',
      f: 'json',
      maxLocations: '1'
    });
    
    const requestUrl = `${ESRI_GEOCODING_API_URL}?${params.toString()}`;
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ESRI_API_KEY}`
      },
    });
    
    if (response.ok) {
      const data: EsriGeocodeResponse = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        console.log('[ESRI] Approach 5 succeeded!');
        return { 
          response, 
          data,
          requestUrl
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 5 failed:', error);
    return null;
  }
}
