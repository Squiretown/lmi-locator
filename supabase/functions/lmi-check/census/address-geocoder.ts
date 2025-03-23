
import { CENSUS_CONFIG, CensusGeocoderResult } from "./geocoder-config.ts";
import { formatGeoId } from "../constants.ts";

/**
 * Geocodes an address to get coordinates and Census geography information
 * 
 * @param address The address to geocode
 * @returns Promise with geocoded result or null if not found
 */
export async function geocodeAddress(address: string): Promise<{ 
  coordinates: { lat: number; lon: number } | null;
  tractId: string | null;
  formattedAddress?: string;
}> {
  try {
    if (!address) {
      console.error("No address provided for geocoding");
      return { coordinates: null, tractId: null };
    }

    console.log(`Geocoding address with Census API: ${address}`);
    
    // Create URL for census geocoder address endpoint
    const url = new URL(`${CENSUS_CONFIG.geocoderBaseUrl}/geographies/onelineaddress`);
    
    // Add parameters
    url.searchParams.append("address", address);
    url.searchParams.append("benchmark", CENSUS_CONFIG.benchmark);
    url.searchParams.append("vintage", CENSUS_CONFIG.vintage);
    url.searchParams.append("format", "json");
    url.searchParams.append("layers", "all");

    // Fetch the data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CENSUS_CONFIG.timeout);
    
    try {
      const response = await fetch(url.toString(), { 
        signal: controller.signal,
        headers: {
          "User-Agent": "LMI-Check/1.0"
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Census geocoding API error: ${response.status} - ${response.statusText}`);
        return { coordinates: null, tractId: null };
      }
      
      const data = await response.json() as CensusGeocoderResult;
      
      return processGeocodeResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Error geocoding address with Census API:", error);
    return { coordinates: null, tractId: null };
  }
}

/**
 * Process the Census geocoder response to extract coordinates and tract information
 * 
 * @param data The Census geocoder API response
 * @returns Processed geocoding result with coordinates and tract ID
 */
function processGeocodeResponse(data: CensusGeocoderResult): { 
  coordinates: { lat: number; lon: number } | null;
  tractId: string | null;
  formattedAddress?: string;
} {
  // Check if we got a match
  if (data.result && 
      data.result.addressMatches && 
      data.result.addressMatches.length > 0) {
    
    const match = data.result.addressMatches[0];
    const coordinates = {
      lat: match.coordinates.y,
      lon: match.coordinates.x
    };
    
    let tractId = null;
    
    // Try to extract tract ID if geography information is available
    if (match.geographies && 
        match.geographies["Census Tracts"] && 
        match.geographies["Census Tracts"].length > 0) {
      
      const tract = match.geographies["Census Tracts"][0];
      tractId = formatGeoId(
        tract.STATE, 
        tract.COUNTY, 
        tract.TRACT
      );
      
      console.log(`Found Census tract: ${tractId}`);
    }
    
    return { 
      coordinates, 
      tractId,
      formattedAddress: match.matchedAddress 
    };
  }
  
  console.warn("No address matches found in Census geocoding response");
  return { coordinates: null, tractId: null };
}
