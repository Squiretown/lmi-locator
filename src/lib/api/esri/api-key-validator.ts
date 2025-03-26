
// Utility to validate ESRI API keys
import { ESRI_API_KEY } from './config';
import { ESRI_GEOCODE_URL } from './constants';

/**
 * Validates an ESRI API key by making a test request
 * @param apiKey The API key to validate
 * @returns Result of validation with status and details
 */
export async function validateEsriApiKey(apiKey: string): Promise<{
  isValid: boolean;
  status: 'valid' | 'invalid' | 'error';
  message: string;
  details?: any;
}> {
  try {
    // Use a simple test address to validate the API key
    const testAddress = "1600 Pennsylvania Ave, Washington DC";
    
    // Form the request URL with the API key
    const params = new URLSearchParams({
      singleLine: testAddress,
      outFields: 'Match_addr',
      outSR: '4326',
      f: 'json',
      token: apiKey
    });
    
    // Make a test request to the geocoding service
    const response = await fetch(`${ESRI_GEOCODE_URL}?${params}`);
    
    if (!response.ok) {
      return {
        isValid: false,
        status: 'error',
        message: `HTTP error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    // Check for error responses that indicate an invalid key
    if (data.error) {
      return {
        isValid: false,
        status: 'invalid',
        message: data.error.message || 'API key rejected',
        details: data.error
      };
    }
    
    // Check if we got valid candidates
    if (data.candidates && data.candidates.length > 0) {
      return {
        isValid: true,
        status: 'valid',
        message: 'API key is valid',
        details: {
          candidatesCount: data.candidates.length
        }
      };
    }
    
    // If we got here, something unexpected happened
    return {
      isValid: false,
      status: 'error',
      message: 'Unexpected API response format',
      details: data
    };
  } catch (error) {
    return {
      isValid: false,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    };
  }
}
