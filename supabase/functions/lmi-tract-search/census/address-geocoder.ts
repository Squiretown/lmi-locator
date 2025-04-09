
import { GeocodedAddress, GeocodingError } from "./geocoder-config.ts";

/**
 * Geocodes an address string to latitude/longitude coordinates
 * 
 * @param address The address to geocode
 * @returns Promise with geocoded address details
 */
export async function geocodeAddress(address: string): Promise<GeocodedAddress> {
  try {
    if (!address) {
      throw new GeocodingError('No address provided', 400, 'input');
    }
    
    console.log(`Geocoding address: ${address}`);
    
    // For implementation simplicity, we'll use a centralized geocoding service
    // In a production environment, you would implement full geocoding functionality here
    const geocodingUrl = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');
    geocodingUrl.searchParams.append('address', address);
    geocodingUrl.searchParams.append('benchmark', '2020');
    geocodingUrl.searchParams.append('format', 'json');
    
    const response = await fetch(geocodingUrl.toString());
    
    if (!response.ok) {
      throw new GeocodingError(
        `Geocoding service error: ${response.status} ${response.statusText}`,
        response.status,
        'census'
      );
    }
    
    const data = await response.json();
    
    if (!data.result?.addressMatches?.length) {
      return {
        address,
        lat: 0,
        lon: 0,
        score: 0,
        geocoding_service: 'census'
      };
    }
    
    const match = data.result.addressMatches[0];
    
    return {
      address: match.matchedAddress || address,
      lat: match.coordinates.y,
      lon: match.coordinates.x,
      score: match.tigerRecordNaaccrFipsCountyCode ? 100 : 90,
      geocoding_service: 'census'
    };
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error;
    }
    throw new GeocodingError(
      `Geocoding failed: ${error.message}`, 
      500, 
      'census'
    );
  }
}
