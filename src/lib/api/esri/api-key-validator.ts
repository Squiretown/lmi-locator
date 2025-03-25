
/**
 * Utility functions for validating ESRI API keys
 */
import { ESRI_API_KEY } from './config';

/**
 * Test if the ESRI API key is valid and has appropriate privileges
 * @returns Promise resolving to validation result with details
 */
export const validateEsriApiKey = async (): Promise<{
  isValid: boolean;
  status?: number;
  version?: string;
  error?: string;
}> => {
  try {
    console.log('Testing ESRI API key validity');
    
    if (!ESRI_API_KEY) {
      console.error('No ESRI API key provided');
      return {
        isValid: false,
        error: 'No ESRI API key provided'
      };
    }
    
    // Build request with parameters
    const testUrl = 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer';
    const params = new URLSearchParams({
      f: 'json',
      token: ESRI_API_KEY
    });
    
    const requestUrl = `${testUrl}?${params.toString()}`;
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Check HTTP status
    if (!response.ok) {
      console.error(`API key validation failed with status: ${response.status}`);
      return {
        isValid: false,
        status: response.status,
        error: `HTTP error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    
    // Check for error in response
    if (data.error) {
      console.error(`API key error:`, data.error);
      return {
        isValid: false,
        status: response.status,
        error: `API error: ${JSON.stringify(data.error)}`
      };
    }
    
    // Check for service version as indication of success
    if (data.currentVersion) {
      console.log(`Service version: ${data.currentVersion}`);
      return {
        isValid: true,
        status: response.status,
        version: data.currentVersion
      };
    }
    
    // Unexpected response structure
    console.warn('Unexpected service response structure');
    return {
      isValid: false,
      status: response.status,
      error: 'Unexpected service response structure'
    };
    
  } catch (error) {
    console.error('Error validating API key:', error);
    
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error validating API key'
    };
  }
};
