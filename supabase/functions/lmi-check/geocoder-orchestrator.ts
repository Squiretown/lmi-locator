
import { geocodeWithCensus } from "./geocoding-services/census.ts";
import { geocodeWithEsri } from "./geocoding-services/esri.ts";
import { getMockGeocodeData } from "./geocoding-services/mock.ts";

/**
 * Result from geocoding process
 */
export interface GeocodingResult {
  lat: number;
  lon: number;
  geoid?: string;
  geocoding_service?: string;
}

/**
 * Orchestrates the geocoding process using multiple services
 * Implements a fallback strategy going from Census → ESRI → Mock data
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
    
    // Step 1: Try Census Geocoder
    console.log('Attempting Census geocoding service...');
    const censusResult = await tryCensusGeocoding(address);
    if (censusResult) {
      console.log('Successfully geocoded with Census service');
      return censusResult;
    }
    
    // Step 2: Try ESRI Geocoder
    console.log('Census geocoding failed or returned no results, trying ESRI...');
    const esriResult = await tryEsriGeocoding(address);
    if (esriResult) {
      console.log('Successfully geocoded with ESRI service');
      return esriResult;
    }
    
    // Step 3: Fall back to mock data
    console.log('All geocoding services failed, falling back to mock data');
    return getMockGeocodeData(address);
  } catch (error) {
    console.error('Fatal error in geocoding orchestration:', error);
    console.error('Orchestration error stack:', error.stack);
    
    // Absolute fallback to mock data
    console.warn('Falling back to mock geocode data after critical error');
    return getMockGeocodeData(address);
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
        geoid: result.geoid,
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
 * Try to geocode using ESRI service
 * 
 * @param address The address to geocode
 * @returns GeocodingResult or null if failed
 */
async function tryEsriGeocoding(address: string): Promise<GeocodingResult | null> {
  try {
    const result = await geocodeWithEsri(address);
    
    if (result.lat && result.lon) {
      return {
        lat: result.lat,
        lon: result.lon,
        geoid: result.geoid,
        geocoding_service: result.geocoding_service || 'ESRI'
      };
    }
    
    return null;
  } catch (error) {
    console.error('ESRI geocoding failed:', error);
    return null;
  }
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
