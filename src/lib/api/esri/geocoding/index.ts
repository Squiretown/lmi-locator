
import { ESRI_API_KEY } from '../config';
import { EsriGeocodeResponse, GeocodeResult } from '../types';
import { tryStandardEndpoint } from './standard-endpoint';
import { tryApiEndpoint } from './api-endpoint';
import { trySingleLine } from './single-line';
import { tryParsedComponents } from './parsed-components';
import { tryAuthHeader } from './auth-header';

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
    result = await tryStandardEndpoint(address);
    if (result) {
      approach = "approach1";
    }
    
    // Approach 2: API endpoint with token parameter
    if (!result) {
      result = await tryApiEndpoint(address);
      if (result) {
        approach = "approach2";
      }
    }
    
    // Approach 3: Using SingleLine parameter
    if (!result) {
      result = await trySingleLine(address);
      if (result) {
        approach = "approach3";
      }
    }
    
    // Approach 4: Using parsed address components
    if (!result) {
      result = await tryParsedComponents(address);
      if (result) {
        approach = "approach4";
      }
    }
    
    // Approach 5: Authorization header instead of token parameter
    if (!result) {
      result = await tryAuthHeader(address);
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
