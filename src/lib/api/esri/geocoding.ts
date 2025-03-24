
import { ESRI_API_KEY, ESRI_GEOCODING_URL, ESRI_GEOCODING_API_URL } from './config';
import { parseAddressComponents } from './utils';
import { EsriGeocodeResponse, GeocodeResult } from './types';

/**
 * Geocode an address using the ESRI geocoding API with multiple fallback approaches
 * @param address Full address string to geocode
 * @returns Geocoding result with coordinates and address info
 */
export const geocodeAddressWithEsri = async (address: string): Promise<GeocodeResult> => {
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
    result = await tryApproach1(address);
    if (result) {
      approach = "approach1";
    }
    
    // Approach 2: API endpoint with token parameter
    if (!result) {
      result = await tryApproach2(address);
      if (result) {
        approach = "approach2";
      }
    }
    
    // Approach 3: Using SingleLine parameter
    if (!result) {
      result = await tryApproach3(address);
      if (result) {
        approach = "approach3";
      }
    }
    
    // Approach 4: Using parsed address components
    if (!result) {
      result = await tryApproach4(address);
      if (result) {
        approach = "approach4";
      }
    }
    
    // Approach 5: Authorization header instead of token parameter
    if (!result) {
      result = await tryApproach5(address);
      if (result) {
        approach = "approach5";
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

// Approach 1: Standard endpoint with token parameter
async function tryApproach1(address: string) {
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
          requestUrl,
          approach: "Standard endpoint with token parameter"
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 1 failed:', error);
    return null;
  }
}

// Approach 2: API endpoint with token parameter
async function tryApproach2(address: string) {
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
        return { 
          response, 
          data,
          requestUrl,
          approach: "API endpoint with token parameter"
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 2 failed:', error);
    return null;
  }
}

// Approach 3: Using SingleLine parameter
async function tryApproach3(address: string) {
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
          requestUrl,
          approach: "SingleLine parameter"
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 3 failed:', error);
    return null;
  }
}

// Approach 4: Using parsed address components
async function tryApproach4(address: string) {
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
          requestUrl,
          approach: "Parsed address components"
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 4 failed:', error);
    return null;
  }
}

// Approach 5: Authorization header instead of token parameter
async function tryApproach5(address: string) {
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
          requestUrl,
          approach: "Authorization header"
        };
      }
    }
    return null;
  } catch (error) {
    console.error('[ESRI] Approach 5 failed:', error);
    return null;
  }
}
