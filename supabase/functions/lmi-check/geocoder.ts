
import { orchestrateGeocoding, GeocodingResult } from "./geocoder-orchestrator.ts";

/**
 * Geocode an address using multiple geocoding services
 * First tries Census, then ESRI, then falls back to mock data if needed
 * 
 * @param address The address to geocode
 * @returns Geocoding result with coordinates and census tract info if available
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  console.log('========== GEOCODING START ==========');
  console.log('Geocoding address:', address);
  
  try {
    // Delegate to the orchestrator
    const result = await orchestrateGeocoding(address);
    
    console.log('========== GEOCODING END ==========');
    return result;
  } catch (error) {
    console.error('Unhandled error in geocoding process:', error);
    console.error('Geocoding error stack:', error.stack);
    
    // If for some reason the orchestrator fails, we have one last fallback here
    console.error('========== GEOCODING END (ERROR) ==========');
    throw error;
  }
}
