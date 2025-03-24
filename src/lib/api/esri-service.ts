
import { ESRI_GEOCODING_URL, ESRI_REVERSE_GEOCODING_URL } from './constants';

// Type definitions for ESRI API responses
interface EsriGeocodeResponse {
  candidates: {
    address: string;
    location: {
      x: number;  // longitude
      y: number;  // latitude
    };
    score: number;
    attributes: Record<string, any>;
  }[];
  spatialReference?: {
    wkid: number;
    latestWkid: number;
  };
}

interface EsriReverseGeocodeResponse {
  address: {
    Match_addr: string;
    LongLabel: string;
    ShortLabel: string;
    Addr_type: string;
    Type: string;
    PlaceName: string;
    AddNum: string;
    Address: string;
    Block: string;
    Sector: string;
    Neighborhood: string;
    District: string;
    City: string;
    MetroArea: string;
    Subregion: string;
    Region: string;
    RegionAbbr: string;
    Territory: string;
    Postal: string;
    PostalExt: string;
    CountryCode: string;
  };
  location: {
    x: number;  // longitude
    y: number;  // latitude
  };
}

// ESRI API key - for frontend client usage only
// Note: This should ideally be an environment variable in production
// Since this is a browser/frontend key, it can be stored here temporarily
const ESRI_API_KEY = "AAPKa240e26a09ac4ea4bef6a0c6cb25a81aK1fJt6b3QlT0_J3aCAZLBTEE5fZ5CaNoMGWCdp1qeRCjcl9U1uFi7-H8rOgTVPMd";

// Export the URLs for diagnostic purposes
export { ESRI_GEOCODING_URL, ESRI_REVERSE_GEOCODING_URL };

/**
 * Geocode an address using the ESRI geocoding API
 * @param address Full address string to geocode
 * @returns Geocoding result with coordinates and address info
 */
export const geocodeAddressWithEsri = async (address: string): Promise<{
  lat: number;
  lon: number;
  formattedAddress?: string;
  score?: number;
  request_info?: {
    url: string;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
  };
}> => {
  try {
    console.log(`[ESRI] Geocoding address: "${address}"`);
    
    if (!ESRI_API_KEY) {
      console.error('[ESRI] API key not found');
      throw new Error('ESRI API key not found');
    }
    
    const params = new URLSearchParams({
      address: address,
      outFields: 'Addr_type,StAddr,City,Region,Postal',
      f: 'json',
      token: ESRI_API_KEY,
      maxLocations: '1'
    });
    
    const requestUrl = `${ESRI_GEOCODING_URL}?${params.toString()}`;
    console.log(`[ESRI] Making request to: ${ESRI_GEOCODING_URL}`);
    console.log(`[ESRI] Request parameters:`, Object.fromEntries(params.entries()));
    
    // IMPORTANT: Not using cache to ensure fresh results
    const startTime = Date.now();
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const endTime = Date.now();
    
    console.log(`[ESRI] Response received in ${endTime - startTime}ms. Status: ${response.status} ${response.statusText}`);
    
    // Get headers for diagnostic info
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    if (!response.ok) {
      console.error(`[ESRI] API request failed: ${response.status} ${response.statusText}`);
      throw new Error(`ESRI API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: EsriGeocodeResponse = await response.json();
    console.log('[ESRI] API response candidates count:', data.candidates?.length || 0);
    console.log('[ESRI] Full API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('[ESRI] No geocoding candidates found for the address');
      throw new Error('No geocoding candidates found for the address');
    }
    
    const bestMatch = data.candidates[0];
    console.log('[ESRI] Best match:', bestMatch);
    
    return {
      lat: bestMatch.location.y,
      lon: bestMatch.location.x,
      formattedAddress: bestMatch.address,
      score: bestMatch.score,
      request_info: {
        url: requestUrl,
        status: response.status,
        statusText: response.statusText,
        headers
      }
    };
  } catch (error) {
    console.error('[ESRI] Error geocoding with ESRI:', error);
    if (error instanceof Error) {
      console.error('[ESRI] Error stack:', error.stack);
    }
    throw error;
  }
};

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
