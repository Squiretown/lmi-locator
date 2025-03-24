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

// Alternative ESRI endpoints to try
const ESRI_GEOCODING_API_URL = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";

// Export the URLs for diagnostic purposes
export { ESRI_GEOCODING_URL, ESRI_REVERSE_GEOCODING_URL, ESRI_GEOCODING_API_URL };

/**
 * Parse an address string into components (basic implementation)
 * This is a simple implementation and may not work for all address formats
 * @param address Full address string to parse
 */
const parseAddressComponents = (address: string): {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
} => {
  // Very basic parsing - this could be improved with a library
  const parts = address.split(',').map(part => part.trim());
  
  // Simple logic: first part is street, last part might contain zip, second to last might be state
  const result: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  } = {};
  
  if (parts.length >= 1) {
    result.street = parts[0];
  }
  
  if (parts.length >= 2) {
    result.city = parts[1];
  }
  
  if (parts.length >= 3) {
    // Last part might have zip code
    const lastPart = parts[parts.length - 1];
    const zipMatch = lastPart.match(/\d{5}(-\d{4})?/);
    
    if (zipMatch) {
      result.zip = zipMatch[0];
      // State might be before the zip
      const statePart = lastPart.replace(zipMatch[0], '').trim();
      if (statePart) {
        result.state = statePart;
      } else if (parts.length >= 4) {
        // If no state in last part, check second to last
        result.state = parts[parts.length - 2];
      }
    } else {
      // No zip found, assume last part is state
      result.state = lastPart;
    }
  }
  
  return result;
};

/**
 * Geocode an address using the ESRI geocoding API with multiple fallback approaches
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
    approach?: string;
  };
}> => {
  try {
    console.log(`[ESRI] Geocoding address: "${address}"`);
    
    if (!ESRI_API_KEY) {
      console.error('[ESRI] API key not found');
      throw new Error('ESRI API key not found');
    }
    
    // Try multiple approaches to find a working one
    let result = null;
    let approach = "";
    
    // Approach 1: Standard endpoint with token parameter (original approach)
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
          result = { 
            response, 
            data,
            requestUrl,
            approach: "Standard endpoint with token parameter"
          };
          approach = "approach1";
        }
      }
    } catch (error) {
      console.error('[ESRI] Approach 1 failed:', error);
    }
    
    // Approach 2: API endpoint with token parameter
    if (!result) {
      try {
        console.log('[ESRI] Trying Approach 2: API endpoint with token parameter');
        const params = new URLSearchParams({
          address: address,
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
            console.log('[ESRI] Approach 2 succeeded!');
            result = { 
              response, 
              data,
              requestUrl,
              approach: "API endpoint with token parameter"
            };
            approach = "approach2";
          }
        }
      } catch (error) {
        console.error('[ESRI] Approach 2 failed:', error);
      }
    }
    
    // Approach 3: Using SingleLine parameter
    if (!result) {
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
            result = { 
              response, 
              data,
              requestUrl,
              approach: "SingleLine parameter"
            };
            approach = "approach3";
          }
        }
      } catch (error) {
        console.error('[ESRI] Approach 3 failed:', error);
      }
    }
    
    // Approach 4: Using parsed address components
    if (!result) {
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
            result = { 
              response, 
              data,
              requestUrl,
              approach: "Parsed address components"
            };
            approach = "approach4";
          }
        }
      } catch (error) {
        console.error('[ESRI] Approach 4 failed:', error);
      }
    }
    
    // Approach 5: Authorization header instead of token parameter
    if (!result) {
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
            result = { 
              response, 
              data,
              requestUrl,
              approach: "Authorization header"
            };
            approach = "approach5";
          }
        }
      } catch (error) {
        console.error('[ESRI] Approach 5 failed:', error);
      }
    }
    
    // If all approaches failed, throw an error
    if (!result) {
      console.error('[ESRI] All geocoding approaches failed');
      throw new Error('All ESRI geocoding approaches failed');
    }
    
    // Extract result data
    const { response, data, requestUrl } = result;
    console.log('[ESRI] Successful approach:', approach);
    console.log('[ESRI] API response candidates count:', data.candidates?.length || 0);
    console.log('[ESRI] Full API response:', JSON.stringify(data, null, 2));
    
    // Get headers for diagnostic info
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
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
        headers,
        approach
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
