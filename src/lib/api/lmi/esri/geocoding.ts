
import { GeocodeResponse, GeocodeCandidate, GeocodeLocation } from './types';

const ESRI_API_KEY = import.meta.env.VITE_ESRI_API_KEY || '';
const GEOCODE_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';

/**
 * Geocode an address using the ESRI geocoding service
 * 
 * @param address The address to geocode
 * @returns A promise that resolves to the location (lat/lon) or null if geocoding failed
 */
export async function geocodeAddressWithEsri(address: string): Promise<GeocodeLocation | null> {
  try {
    // Input validation
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      console.error('Invalid address provided for geocoding');
      return null;
    }

    // Prepare request parameters
    const params = new URLSearchParams({
      SingleLine: address,
      f: 'json',
      outFields: 'Match_addr,Addr_type,Score',
      maxLocations: '1',
      forStorage: 'false',
    });

    // Add API key if available
    if (ESRI_API_KEY) {
      params.append('token', ESRI_API_KEY);
    }

    // Make the geocoding request
    console.debug(`Making geocoding request for address: ${address}`);
    const response = await fetch(`${GEOCODE_URL}?${params}`);
    
    if (!response.ok) {
      console.error(`Geocoding API HTTP error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data: GeocodeResponse = await response.json();

    // Check for errors in the response
    if (data.error) {
      console.error(`Geocoding API error: ${JSON.stringify(data.error)}`);
      return null;
    }

    // Process candidates
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      // Check for minimum match score
      if ((candidate.score || 0) < 80) {
        console.warn(`Low match score (${candidate.score}) for address: ${address}`);
        // Still continue with the result, just log the warning
      }

      const location = candidate.location;
      console.info(`Found location: lat=${location.y}, lon=${location.x}, score=${candidate.score}`);
      
      return {
        lat: location.y,
        lon: location.x,
        score: candidate.score || 0,
        formattedAddress: candidate.address || address
      };
    } else {
      console.warn(`No location candidates found for address: ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`Error in geocoding request: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}
