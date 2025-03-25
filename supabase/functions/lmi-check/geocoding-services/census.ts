
import { determineCensusTract, geocodeAddress as censusGeocode, GeocodedAddress, GeocodingError, geocodeWithCensus } from "../census/index.ts";

/**
 * Geocode an address using Census Geocoder API
 * 
 * @param address The address to geocode
 * @returns Geocoding result with coordinates and census tract information
 */
export async function geocodeWithCensus(address: string): Promise<{
  lat?: number;
  lon?: number;
  geoid?: string;
  geocoding_service?: string;
}> {
  console.log('Attempting to geocode with Census Geocoder...');
  
  try {
    // Use the improved Census geocoding implementation
    const result = await censusGeocode(address);
    
    if (!result.coordinates) {
      // Try the alternative Census geocoding implementation if the main one failed
      console.log('Primary Census geocoder returned no coordinates, trying alternative implementation...');
      const altResult = await geocodeWithCensus(address);
      
      if (altResult.status !== 'success' || !altResult.lat || !altResult.lon) {
        console.log('Alternative Census geocoder also failed');
        return {};
      }
      
      console.log('Successfully geocoded with alternative Census implementation');
      
      const response = {
        lat: altResult.lat,
        lon: altResult.lon,
        geocoding_service: 'Census (Alternative)'
      };
      
      // Try to get census tract from coordinates
      console.log('Got coordinates from alternative geocoder, attempting tract lookup');
      
      const tractId = await determineCensusTract(
        altResult.lat,
        altResult.lon
      );
      
      if (tractId) {
        console.log('Successfully determined census tract:', tractId);
        return {
          ...response,
          geoid: tractId
        };
      }
      
      return response;
    }
    
    const response = {
      lat: result.coordinates.lat,
      lon: result.coordinates.lon,
      geocoding_service: 'Census'
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
    if (error instanceof GeocodingError) {
      console.error(`Census geocoding error: ${error.message} (${error.source}, status: ${error.statusCode})`);
    } else {
      console.error('Error with Census geocoding:', error);
      console.error('Census geocoding error stack:', error.stack);
    }
    throw error;
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
    if (error instanceof GeocodingError) {
      console.error(`Census tract lookup error: ${error.message} (${error.source}, status: ${error.statusCode})`);
    } else {
      console.error('Error getting census tract from coordinates:', error);
      console.error('Census tract lookup error stack:', error.stack);
    }
    return null;
  }
}
