
import { CENSUS_CONFIG, CensusGeocoderResult } from "./geocoder-config.ts";
import { formatGeoId } from "../constants.ts";

/**
 * Determines the Census tract for a geocoded address using coordinates
 * 
 * @param lat Latitude of the address
 * @param lon Longitude of the address
 * @returns Promise with tract ID or null if not found
 */
export async function determineCensusTract(lat: number, lon: number): Promise<string | null> {
  try {
    if (!lat || !lon) {
      console.error("Missing coordinates for Census tract lookup");
      return null;
    }

    console.log(`Requesting Census tract for coordinates: ${lat}, ${lon}`);
    
    const result = await fetchCensusTractFromCoordinates(lat, lon);
    
    if (result) {
      console.log(`Found Census tract: ${result}`);
      return result;
    }
    
    console.warn("No Census tract information found in response");
    return null;
  } catch (error) {
    console.error("Error determining Census tract:", error);
    return null;
  }
}

/**
 * Raw API call to fetch Census tract information from coordinates
 * 
 * @param lat Latitude coordinate
 * @param lon Longitude coordinate
 * @returns Census tract ID or null if not found
 */
async function fetchCensusTractFromCoordinates(lat: number, lon: number): Promise<string | null> {
  // Create URL for census geocoder coordinates endpoint
  const url = new URL(`${CENSUS_CONFIG.geocoderBaseUrl}/geographies/coordinates`);
  
  // Add parameters
  url.searchParams.append("x", lon.toString());
  url.searchParams.append("y", lat.toString());
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
      console.error(`Census API error: ${response.status} - ${response.statusText}`);
      return null;
    }
    
    const data = await response.json() as CensusGeocoderResult;
    
    // Parse the response to extract the Census tract ID
    if (data.result && 
        data.result.geographies && 
        data.result.geographies["Census Tracts"] && 
        data.result.geographies["Census Tracts"].length > 0) {
      
      const tract = data.result.geographies["Census Tracts"][0];
      
      // Create the standard Census tract GeoID format
      return formatGeoId(
        tract.STATE, 
        tract.COUNTY, 
        tract.TRACT
      );
    }
    
    return null;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
