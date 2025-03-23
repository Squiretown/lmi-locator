
/**
 * Generate mock geocoding data for testing purposes
 * 
 * @param address The address to geocode
 * @returns Mock geocoding result
 */
export function getMockGeocodeData(address: string): {
  lat: number;
  lon: number;
  geoid: string;
  geocoding_service: string;
} {
  console.log('Using mock geocode data for address:', address);
  
  // For testing purposes, determine mock data based on address content
  if (address.toLowerCase().includes('rich') || 
      address.toLowerCase().includes('wealth') || 
      address.toLowerCase().includes('90210')) {
    console.log('Using mock data for high-income address');
    return { 
      lat: 34.0736, 
      lon: -118.4004,
      geoid: '06037701000', // Beverly Hills tract - not LMI
      geocoding_service: 'Mock Data'
    };
  }
  
  // For testing purposes, any address containing "low" or "poor" will be marked as LMI eligible
  if (address.toLowerCase().includes('low') || 
      address.toLowerCase().includes('poor')) {
    console.log('Using mock data for low-income address');
    return { 
      lat: 37.7749, 
      lon: -122.4194,
      geoid: '06075010200', // Low income tract
      geocoding_service: 'Mock Data'
    };
  }
  
  console.log('Using default mock data for address');
  return { 
    lat: 37.7749, 
    lon: -122.4194,
    geoid: '06075010800', // San Francisco tract - moderate income
    geocoding_service: 'Mock Data'
  };
}
