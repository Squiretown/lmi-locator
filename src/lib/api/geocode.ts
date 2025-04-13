
// Geocoding service for address to coordinates conversion
import { CENSUS_GEOCODER_URL } from './constants';
import { cachedFetch } from './cache';
import { geocodeAddressWithEsri } from './lmi/esri/geocoding';
import { parseGeoId, formatTractId } from './census-helpers';

/**
 * Geocode an address using Census Geocoder API with ESRI as backup
 * @param address Full address string to geocode
 * @returns Geocoding result with coordinates and census tract info if available
 */
export const geocodeAddress = async (address: string): Promise<{
  lat: number; 
  lon: number; 
  geoid?: string;
  geocoding_service?: string;
  formatted_address?: string;
}> => {
  console.log('Geocoding address:', address);
  
  try {
    // First attempt: Census Geocoder (more accurate for tract boundaries)
    try {
      // Build the URL for Census Geocoder API - use addressiOnelineAddressWithBenchmarkAndVintage for better accuracy
      const encodedAddress = encodeURIComponent(address);
      const url = `${CENSUS_GEOCODER_URL}/addressiOnelineAddressWithBenchmarkAndVintage?address=${encodedAddress}&benchmark=Public_AR_Current&vintage=Current_Current&format=json`;
      
      console.log(`Making request to Census Geocoder: ${url}`);
      
      // Make the API request using cache wrapper
      const response = await cachedFetch(url);
      
      // Check if we got valid results
      if (response.result?.addressMatches?.length > 0) {
        const match = response.result.addressMatches[0];
        const coordinates = match.coordinates;
        const geoid = match.geographies?.['Census Tracts']?.[0]?.GEOID;
        
        console.log('Successfully geocoded address with Census API:', {
          lat: coordinates.y,
          lon: coordinates.x,
          geoid
        });
        
        // If we have a match with a high match score, return it
        if (match.tigerRecordNaaccrFipsCountyCode) {
          return {
            lat: coordinates.y, 
            lon: coordinates.x,
            geoid,
            geocoding_service: 'Census',
            formatted_address: match.matchedAddress
          };
        }
      }
      
      console.log('Census geocoder returned no matches or low confidence match, falling back to ESRI');
    } catch (error) {
      console.error('Error with Census geocoding:', error);
      console.log('Falling back to ESRI geocoder due to Census API error');
    }
    
    // Second attempt: ESRI Geocoder (generally better at address geocoding)
    console.log('Attempting to geocode with ESRI service');
    
    const esriResult = await geocodeAddressWithEsri(address);
    
    if (!esriResult.lat || !esriResult.lon) {
      throw new Error('Unable to geocode address with available services');
    }
    
    // Successfully geocoded with ESRI, but we may not have census tract info
    console.log('Successfully geocoded address with ESRI API:', esriResult);
    
    // Try to get tract ID from the coordinates using Census API
    try {
      const tractId = await getCensusTractFromCoordinates(esriResult.lat, esriResult.lon);
      if (tractId) {
        return {
          ...esriResult,
          geoid: tractId,
          geocoding_service: 'ESRI+Census'
        };
      }
    } catch (tractError) {
      console.error('Error getting census tract from coordinates:', tractError);
    }
    
    return {
      ...esriResult,
      geocoding_service: 'ESRI',
      formatted_address: esriResult.formattedAddress
    };
  } catch (error) {
    console.error('Error geocoding address with all services:', error);
    throw new Error(`Unable to geocode address: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get census tract ID from coordinates (reverse geocoding for census tract)
 * This can be used when we have coordinates from ESRI but need census tract data
 */
export const getCensusTractFromCoordinates = async (lat: number, lon: number): Promise<string | null> => {
  try {
    // First try the current vintage
    const currentUrl = `${CENSUS_GEOCODER_URL}/geographies/coordinates?x=${lon}&y=${lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Census%20Tracts&format=json`;
    
    console.log(`Getting census tract from coordinates using current vintage: ${lat}, ${lon}`);
    
    const response = await cachedFetch(currentUrl);
    
    if (response.result?.geographies?.['Census Tracts']?.length > 0) {
      const geoid = response.result.geographies['Census Tracts'][0].GEOID;
      console.log(`Found census tract ${geoid} for coordinates ${lat}, ${lon}`);
      return geoid;
    }
    
    // If that fails, try the 2020 vintage
    console.log('Current vintage lookup failed, trying 2020 vintage');
    const url2020 = `${CENSUS_GEOCODER_URL}/geographies/coordinates?x=${lon}&y=${lat}&benchmark=2020&vintage=2020&layers=Census%20Tracts&format=json`;
    
    const response2020 = await cachedFetch(url2020);
    
    if (response2020.result?.geographies?.['Census Tracts']?.length > 0) {
      const geoid = response2020.result.geographies['Census Tracts'][0].GEOID;
      console.log(`Found census tract ${geoid} from 2020 vintage for coordinates ${lat}, ${lon}`);
      return geoid;
    }
    
    console.log('Could not find census tract for coordinates');
    return null;
  } catch (error) {
    console.error('Error getting census tract from coordinates:', error);
    return null;
  }
};
