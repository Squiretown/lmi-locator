
import { geocodeWithCensus } from "./geocoding-services/census.ts";
import { geocodeWithEsri } from "./geocoding-services/esri.ts";
import { getMockGeocodeData } from "./geocoding-services/mock.ts";

/**
 * Geocode an address using multiple geocoding services
 * First tries Census, then ESRI, then falls back to mock data if needed
 * 
 * @param address The address to geocode
 * @returns Geocoding result with coordinates and census tract info if available
 */
export async function geocodeAddress(address: string): Promise<{
  lat: number; 
  lon: number; 
  geoid?: string;
  geocoding_service?: string;
}> {
  console.log('========== GEOCODING START ==========');
  console.log('Geocoding address:', address);
  
  try {
    // Step 1: Try Census Geocoder
    try {
      console.log('Attempting geocoding with Census service');
      const censusResult = await geocodeWithCensus(address);
      
      if (censusResult.lat && censusResult.lon) {
        console.log('Successfully geocoded with Census service');
        return {
          lat: censusResult.lat,
          lon: censusResult.lon,
          geoid: censusResult.geoid,
          geocoding_service: censusResult.geocoding_service
        };
      }
      
      console.log('Census geocoding returned no results, trying ESRI');
    } catch (error) {
      console.error('Error with Census geocoding:', error);
      console.log('Falling back to ESRI geocoder due to Census API error');
    }
    
    // Step 2: Try ESRI Geocoder
    try {
      console.log('Attempting geocoding with ESRI service');
      const esriResult = await geocodeWithEsri(address);
      
      if (esriResult.lat && esriResult.lon) {
        console.log('Successfully geocoded with ESRI service');
        return {
          lat: esriResult.lat,
          lon: esriResult.lon,
          geoid: esriResult.geoid,
          geocoding_service: esriResult.geocoding_service
        };
      }
      
      console.log('ESRI geocoding returned no results, falling back to mock data');
    } catch (error) {
      console.error('Error with ESRI geocoding:', error);
      console.log('Falling back to mock data due to ESRI API error');
    }
    
    // Step 3: Fall back to mock data as a last resort
    console.warn('Falling back to mock geocode data after all services failed');
    const mockResult = getMockGeocodeData(address);
    
    console.log('========== GEOCODING END (MOCK) ==========');
    return mockResult;
  } catch (error) {
    console.error('Error geocoding address with all services:', error);
    console.error('Geocoding error stack:', error.stack);
    
    // Absolute fallback to mock data
    console.warn('Falling back to mock geocode data after critical error');
    const mockResult = getMockGeocodeData(address);
    
    console.log('========== GEOCODING END (ERROR + MOCK) ==========');
    return mockResult;
  }
}
