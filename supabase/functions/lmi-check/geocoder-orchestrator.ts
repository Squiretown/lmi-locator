
import { geocodeWithCensus } from "./geocoding-services/census.ts";
import { geocodeWithMapbox } from "./geocoding-services/mapbox.ts";


/**
 * Result from geocoding process
 */
export interface GeocodingResult {
  lat: number;
  lon: number;
  tractId?: string;
  geocoding_service?: string;
}

/**
 * Orchestrates the geocoding process using multiple services
 * Implements a fallback strategy going from Mapbox → Census → Mock
 * 
 * @param address The address to geocode
 * @returns Promise with geocoding result including coordinates and census tract
 */
export async function orchestrateGeocoding(address: string): Promise<GeocodingResult> {
  console.log('Starting geocoding orchestration for address:', address);
  
  try {
    // Validate address before attempting geocoding
    if (!validateAddress(address)) {
      console.warn(`Invalid address format: ${address}`);
      throw new Error("Invalid address format. Please provide a complete street address.");
    }
    
    // Step 1: Try Mapbox Geocoder (most reliable)
    console.log('Attempting Mapbox geocoding service...');
    const mapboxResult = await tryMapboxGeocoding(address);
    if (mapboxResult) {
      console.log('Successfully geocoded with Mapbox service');
      return mapboxResult;
    }
    
    // Step 2: Try Census Geocoder as backup
    console.log('Mapbox geocoding failed, trying Census...');
    const censusResult = await tryCensusGeocoding(address);
    if (censusResult) {
      console.log('Successfully geocoded with Census service');
      return censusResult;
    }
    
    // Step 3: All services failed - throw error
    console.error('All geocoding services failed for address:', address);
    const mockResult = getMockGeocodeData(address);
    if (!mockResult) {
      throw new Error('Unable to geocode address. Please verify the address is correct and try again.');
    }
    return mockResult;
  } catch (error) {
    console.error('Fatal error in geocoding orchestration:', error);
    if (error instanceof Error && error.stack) {
      console.error('Orchestration error stack:', error.stack);
    }
    
    // No fallback - rethrow the error
    console.error('Critical error in geocoding orchestration - no fallback available');
    throw new Error('Unable to geocode address. Please verify the address is correct and try again.');
  }
}

/**
 * Try to geocode using Mapbox service
 * 
 * @param address The address to geocode
 * @returns GeocodingResult or null if failed
 */
async function tryMapboxGeocoding(address: string): Promise<GeocodingResult | null> {
  try {
    const result = await geocodeWithMapbox(address);
    
    if (result.lat && result.lon) {
      return {
        lat: result.lat,
        lon: result.lon,
        tractId: result.tractId,
        geocoding_service: result.geocoding_service || 'Mapbox'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Mapbox geocoding failed:', error);
    return null;
  }
}

/**
 * Try to geocode using Census service
 * 
 * @param address The address to geocode
 * @returns GeocodingResult or null if failed
 */
async function tryCensusGeocoding(address: string): Promise<GeocodingResult | null> {
  try {
    const result = await geocodeWithCensus(address);
    
    if (result.lat && result.lon) {
      return {
        lat: result.lat,
        lon: result.lon,
        tractId: (result as any).tractId || result.geoid,
        geocoding_service: result.geocoding_service || 'Census'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Census geocoding failed:', error);
    return null;
  }
}

/**
 * Generate mock geocoding data as final fallback
 */
function getMockGeocodeData(address: string): GeocodingResult | null {
  console.error(`All geocoding services failed for address: ${address}`);
  console.error('Unable to geocode address - no mock data will be returned');
  return null;
}

/**
 * Validates an address to ensure it's in a proper format before attempting geocoding
 * 
 * @param address The address to validate
 * @returns boolean indicating whether the address is valid
 */
function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Remove extra whitespace
  address = address.replace(/\s+/g, ' ').trim();

  // Basic address validation
  const requiredComponents = [
    // At least one number (street number)
    (x: string) => /\d/.test(x),
    // Minimum length for a reasonable address
    (x: string) => x.trim().length >= 10,
    // Contains street identifier
    (x: string) => /street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|place|pl|court|ct|circle|cir|terrace|ter|highway|hwy/i.test(x)
  ];

  return requiredComponents.every(check => check(address));
}
