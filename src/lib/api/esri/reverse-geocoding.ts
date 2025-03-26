
import { ESRI_API_KEY } from './config';
import { ESRI_REVERSE_GEOCODING_URL } from './constants';
import { EsriReverseGeocodeResponse } from './types';

/**
 * Perform reverse geocoding using ESRI API
 * @param lat Latitude coordinate
 * @param lon Longitude coordinate
 * @returns Address information
 */
export const reverseGeocodeWithEsri = async (lat: number, lon: number): Promise<{
  address: string;
  city?: string;
  state?: string;
  zip?: string;
}> => {
  try {
    if (!ESRI_API_KEY) {
      throw new Error('ESRI API key not found');
    }
    
    const params = new URLSearchParams({
      location: `${lon},${lat}`,
      f: 'json',
      token: ESRI_API_KEY,
      outFields: '*'
    });
    
    console.log(`Making reverse geocode request to ESRI for coordinates: ${lat}, ${lon}`);
    
    // IMPORTANT: Not using cache to ensure fresh results
    const response = await fetch(`${ESRI_REVERSE_GEOCODING_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`ESRI reverse geocode request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: EsriReverseGeocodeResponse = await response.json();
    console.log('ESRI Reverse Geocode API response:', JSON.stringify(data, null, 2));
    
    return {
      address: data.address.Match_addr,
      city: data.address.City,
      state: data.address.RegionAbbr,
      zip: data.address.Postal
    };
  } catch (error) {
    console.error('Error reverse geocoding with ESRI:', error);
    throw error;
  }
};
