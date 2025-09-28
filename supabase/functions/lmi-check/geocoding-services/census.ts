
import { 
  determineCensusTract, 
  geocodeAddress as censusGeocodeAddress, 
  GeocodedAddress
} from "../census/index.ts";

// Define proper interfaces for return types
interface GeocodingResult {
  lat?: number;
  lon?: number;
  geoid?: string;
  geocoding_service?: string;
  status?: 'success' | 'error';
  error?: string;
}

// Create a proper error class that can be used as a value
class CensusGeocodingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'CensusGeocodingError';
  }
}

// Type guard function for error checking
function isCensusGeocodingError(error: unknown): error is CensusGeocodingError {
  return error instanceof CensusGeocodingError;
}

// Proper error type checking
function isErrorWithStack(error: unknown): error is Error {
  return error instanceof Error && 'stack' in error;
}

/**
 * Geocode an address using Census Geocoder API
 * 
 * @param address The address to geocode
 * @returns Geocoding result with coordinates and census tract information
 */
export async function geocodeWithCensus(address: string): Promise<GeocodingResult> {
  console.log('Attempting to geocode with Census Geocoder...');
  
  try {
    // Use the improved Census geocoding implementation
    const result = await censusGeocodeAddress(address);
    
    if (!result || !result.coordinates) {
      console.log('Primary Census geocoder returned no coordinates');
      return {
        status: 'error',
        error: 'No coordinates returned from Census geocoder',
        geocoding_service: 'Census'
      };
    }
    
    const response: GeocodingResult = {
      lat: result.coordinates.lat,
      lon: result.coordinates.lon,
      geocoding_service: 'Census',
      status: 'success'
    };
    
    // If we have a tract ID, include it
    if (result.tractId) {
      console.log('Census geocoder returned tract ID:', result.tractId);
      return {
        ...response,
        geoid: result.tractId
      };
    }
    
    // If we have coordinates but no tract, try separate tract lookup
    console.log('Got coordinates but no tract ID, attempting separate tract lookup');
    
    const tractId = await determineCensusTract(
      result.coordinates.lat,
      result.coordinates.lon
    );
    
    if (tractId) {
      console.log('Successfully determined census tract in second step:', tractId);
      return {
        ...response,
        geoid: tractId
      };
    }
    
    // Return coordinates without tract ID if we couldn't determine it
    console.log('Failed to determine census tract from coordinates');
    return response;
  } catch (error) {
    console.error('Error with Census geocoding:', error);
    
    // Proper error type checking and handling
    if (isCensusGeocodingError(error)) {
      console.error('Census geocoding error details:', error.message);
      if (isErrorWithStack(error)) {
        console.error('Census geocoding error stack:', error.stack);
      }
    } else if (isErrorWithStack(error)) {
      console.error('Unexpected error in census geocoding:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error in census geocoding:', String(error));
    }
    
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown census geocoding error',
      geocoding_service: 'Census'
    };
  }
}

/**
 * Get census tract ID from coordinates (reverse geocoding)
 * 
 * @param lat Latitude coordinate
 * @param lon Longitude coordinate
 * @returns Promise with census tract ID or null if not found
 */
export async function getCensusTractFromCoordinates(lat: number, lon: number): Promise<string | null> {
  console.log(`Getting census tract from coordinates: ${lat}, ${lon}`);
  
  try {
    // Use the determineCensusTract function from census module
    return await determineCensusTract(lat, lon);
  } catch (error) {
    console.error('Error getting census tract from coordinates:', error);
    
    // Proper error handling for tract lookup
    if (isCensusGeocodingError(error)) {
      console.error('Census tract lookup error details:', error.message);
      if (isErrorWithStack(error)) {
        console.error('Census tract lookup error stack:', error.stack);
      }
    } else if (isErrorWithStack(error)) {
      console.error('Unexpected error in tract lookup:', error.message);
    } else {
      console.error('Unknown error in tract lookup:', String(error));
    }
    return null;
  }
}
