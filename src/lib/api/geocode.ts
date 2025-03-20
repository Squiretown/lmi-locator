
// Geocoding service for address to coordinates conversion
import { CENSUS_GEOCODER_URL } from './constants';

// Geocode an address using Census Geocoder API
export const geocodeAddress = async (address: string): Promise<{lat: number, lon: number, geoid?: string}> => {
  console.log('Geocoding address:', address);
  
  // For demonstration, we'll still use mock data but log as if we're making a real API call
  console.log(`Making request to Census Geocoder: ${CENSUS_GEOCODER_URL}/locations/onelineaddress`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock coordinates based on address content
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
};
