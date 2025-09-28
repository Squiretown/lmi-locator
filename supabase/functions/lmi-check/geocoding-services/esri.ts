
import { ESRI_GEOCODING_URL } from "../constants.ts";
import { getCensusTractFromCoordinates } from "./census.ts";

/**
 * Geocode an address using ESRI Geocoding API
 * 
 * @param address The address to geocode
 * @returns Geocoding result with coordinates and census tract information if available
 */
export async function geocodeWithEsri(address: string): Promise<{
  lat?: number;
  lon?: number;
  geoid?: string;
  geocoding_service?: string;
}> {
  console.log('Attempting to geocode with ESRI Geocoder API...');
  
  try {
    // Use ESRI API key from environment variables
    const esriApiKey = Deno.env.get("ESRI_API_KEY");
    
    if (!esriApiKey) {
      console.warn('ESRI API key not found in environment variables');
      return {};
    }
    
    const esriParams = new URLSearchParams({
      address: address,
      outFields: 'Addr_type,StAddr,City,Region,Postal',
      f: 'json',
      token: esriApiKey,
      maxLocations: '1'
    });
    
    console.log(`Making request to ESRI Geocoder with address: ${address}`);
    
    const esriResponse = await fetch(`${ESRI_GEOCODING_URL}?${esriParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!esriResponse.ok) {
      console.error(`ESRI API request failed: ${esriResponse.status} ${esriResponse.statusText}`);
      return {};
    }
    
    const esriData = await esriResponse.json();
    console.log('ESRI API raw response:', JSON.stringify(esriData, null, 2));
    
    if (!esriData.candidates || esriData.candidates.length === 0) {
      console.log('No candidates found in ESRI response');
      return {};
    }
    
    const bestMatch = esriData.candidates[0];
    console.log('ESRI best match:', bestMatch);
    
    const response = {
      lat: bestMatch.location.y,
      lon: bestMatch.location.x,
      geocoding_service: 'ESRI'
    };
    
    // Try to get census tract from coordinates
    console.log('Attempting to get census tract from coordinates...');
    
    try {
      const tractGeoid = await getCensusTractFromCoordinates(
        bestMatch.location.y, 
        bestMatch.location.x
      );
      
      if (tractGeoid) {
        console.log('Successfully obtained census tract from coordinates:', tractGeoid);
        return {
          ...response,
          geoid: tractGeoid
        };
      }
    } catch (tractError) {
      console.error('Error getting census tract for ESRI coordinates:', tractError);
      // Continue without tract ID if we can't get it
    }
    
    console.warn('No census tract found for these coordinates');
    return response;
  } catch (error) {
    console.error('Error with ESRI geocoding:', error);
    if (error instanceof Error && error.stack) {
      console.error('ESRI geocoding error stack:', error.stack);
    }
    // Return empty object instead of throwing
    return {};
  }
}
