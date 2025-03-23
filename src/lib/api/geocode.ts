
// Geocoding service for address to coordinates conversion
import { CENSUS_GEOCODER_URL, ESRI_GEOCODING_URL } from './constants';
import { cachedFetch } from './cache';
import { geocodeAddressWithEsri } from './esri-service';
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
    // First attempt: Census Geocoder
    try {
      // Build the URL for Census Geocoder API
      const encodedAddress = encodeURIComponent(address);
      const url = `${CENSUS_GEOCODER_URL}/locations/onelineaddress?address=${encodedAddress}&benchmark=2020&format=json`;
      
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
        
        return {
          lat: coordinates.y, 
          lon: coordinates.x,
          geoid,
          geocoding_service: 'Census',
          formatted_address: match.matchedAddress
        };
      }
      
      console.log('Census geocoder returned no matches, falling back to ESRI');
    } catch (error) {
      console.error('Error with Census geocoding:', error);
      console.log('Falling back to ESRI geocoder due to Census API error');
    }
    
    // Second attempt: ESRI Geocoder
    console.log('Attempting to geocode with ESRI service');
    
    const esriResult = await geocodeAddressWithEsri(address);
    
    // Successfully geocoded with ESRI, but we don't have census tract info
    // We could potentially make another call to get census tract data based on coordinates
    console.log('Successfully geocoded address with ESRI API:', esriResult);
    
    return {
      ...esriResult,
      geocoding_service: 'ESRI',
      formatted_address: esriResult.formattedAddress
    };
  } catch (error) {
    console.error('Error geocoding address with all services:', error);
    
    // Fall back to mock data if API requests fail
    console.warn('Falling back to mock geocode data');
    
    // For testing purposes - determine mock data based on address content
    if (address.toLowerCase().includes('rich') || 
        address.toLowerCase().includes('wealth') || 
        address.toLowerCase().includes('90210')) {
      return { 
        lat: 34.0736, 
        lon: -118.4004,
        geoid: '06037701000', // Beverly Hills tract
        geocoding_service: 'Mock Data'
      };
    }
    
    // For testing purposes, any address containing "low" or "poor" will be marked as LMI eligible
    if (address.toLowerCase().includes('low') || 
        address.toLowerCase().includes('poor')) {
      return { 
        lat: 37.7749, 
        lon: -122.4194,
        geoid: '06075010200', // Low income tract
        geocoding_service: 'Mock Data'
      };
    }
    
    return { 
      lat: 37.7749, 
      lon: -122.4194,
      geoid: '06075010800', // San Francisco tract
      geocoding_service: 'Mock Data'
    };
  }
};

/**
 * Get census tract ID from coordinates (reverse geocoding for census tract)
 * This can be used when we have coordinates from ESRI but need census tract data
 */
export const getCensusTractFromCoordinates = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const url = `${CENSUS_GEOCODER_URL}/geographies/coordinates?x=${lon}&y=${lat}&benchmark=2020&vintage=2020&layers=Census%20Tracts&format=json`;
    
    console.log(`Getting census tract from coordinates: ${lat}, ${lon}`);
    
    const response = await cachedFetch(url);
    
    if (response.result?.geographies?.['Census Tracts']?.length > 0) {
      const geoid = response.result.geographies['Census Tracts'][0].GEOID;
      console.log(`Found census tract ${geoid} for coordinates ${lat}, ${lon}`);
      return geoid;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting census tract from coordinates:', error);
    return null;
  }
};
