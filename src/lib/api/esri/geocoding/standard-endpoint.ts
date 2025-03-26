
import { ESRI_API_KEY } from '../config';
import { ESRI_GEOCODING_URL } from '../constants';
import { EsriGeocodeResponse } from '../types';
import { GeocodeApproachResult } from './types';

/**
 * Approach 1: Standard endpoint with token parameter
 * @param address Full address string to geocode
 * @returns Geocoding result with API response data
 */
export async function tryStandardEndpoint(address: string): Promise<GeocodeApproachResult | null> {
  try {
    console.log('[ESRI] Trying Approach 1: Standard endpoint with token parameter');
    const params = new URLSearchParams({
      address: address,
      outFields: 'Addr_type,StAddr,City,Region,Postal',
      f: 'json',
      token: ESRI_API_KEY,
      maxLocations: '1'
    });
    
    const requestUrl = `${ESRI_GEOCODING_URL}?${params.toString()}`;
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data: EsriGeocodeResponse = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        console.log('[ESRI] Approach 1 succeeded!');
        return { 
          response, 
          data,
          requestUrl
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 1 failed:', error);
    return null;
  }
}
