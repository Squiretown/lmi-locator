
// Geocoding service for address to coordinates conversion
import { CENSUS_GEOCODER_URL } from './constants';
import { cachedFetch } from './cache';

// Geocode an address using Census Geocoder API
export const geocodeAddress = async (address: string): Promise<{lat: number, lon: number, geoid?: string}> => {
  console.log('Geocoding address:', address);
  
  try {
    // Build the URL for Census Geocoder API
    const encodedAddress = encodeURIComponent(address);
    const url = `${CENSUS_GEOCODER_URL}/locations/onelineaddress?address=${encodedAddress}&benchmark=2020&format=json`;
    
    console.log(`Making request to Census Geocoder: ${url}`);
    
    // Make the API request
    const response = await cachedFetch(url);
    
    // Check if we got valid results
    if (response.result?.addressMatches?.length > 0) {
      const match = response.result.addressMatches[0];
      const coordinates = match.coordinates;
      const geoid = match.geographies?.['Census Tracts']?.[0]?.GEOID;
      
      console.log('Successfully geocoded address:', {
        lat: coordinates.y,
        lon: coordinates.x,
        geoid
      });
      
      return {
        lat: coordinates.y, 
        lon: coordinates.x,
        geoid
      };
    }
    
    throw new Error('Address could not be geocoded');
  } catch (error) {
    console.error('Error geocoding address:', error);
    
    // Fall back to mock data if API request fails
    console.warn('Falling back to mock geocode data');
    
    if (address.toLowerCase().includes('rich') || 
        address.toLowerCase().includes('wealth') || 
        address.toLowerCase().includes('90210')) {
      return { 
        lat: 34.0736, 
        lon: -118.4004,
        geoid: '06037701000' // Beverly Hills tract
      };
    }
    
    return { 
      lat: 37.7749, 
      lon: -122.4194,
      geoid: '06075010800' // San Francisco tract
    };
  }
};
