
import { parseGeoId, formatGeoId } from "./constants.ts";

/**
 * Census API configuration
 */
const CENSUS_CONFIG = {
  geocoderBaseUrl: "https://geocoding.geo.census.gov/geocoder",
  benchmark: "Public_AR_Current",
  vintage: "Current_Current",
  timeout: 5000
};

/**
 * Result from Census Geocoder
 */
interface CensusGeocoderResult {
  result: {
    addressMatches?: Array<{
      coordinates: {
        x: number; // longitude
        y: number; // latitude
      };
      geographies?: Record<string, any>;
    }>;
    geographies?: {
      "Census Tracts"?: Array<{
        GEOID: string;
        STATE: string;
        COUNTY: string;
        TRACT: string;
        NAME: string;
      }>;
    };
  };
  input?: {
    location?: {
      x: number;
      y: number;
    };
  };
}

/**
 * Determines the Census tract for a geocoded address
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
        const tractId = formatGeoId(
          tract.STATE, 
          tract.COUNTY, 
          tract.TRACT
        );
        
        console.log(`Found Census tract: ${tractId}`);
        return tractId;
      }
      
      console.warn("No Census tract information found in response");
      return null;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Error determining Census tract:", error);
    return null;
  }
}

/**
 * Geocodes an address to get coordinates and Census geography information
 * 
 * @param address The address to geocode
 * @returns Promise with geocoded result or null if not found
 */
export async function geocodeAddress(address: string): Promise<{ 
  coordinates: { lat: number; lon: number } | null;
  tractId: string | null;
}> {
  try {
    if (!address) {
      console.error("No address provided for geocoding");
      return { coordinates: null, tractId: null };
    }

    console.log(`Geocoding address: ${address}`);
    
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
          tractId 
        };
      }
      
      console.warn("No address matches found in geocoding response");
      return { coordinates: null, tractId: null };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    return { coordinates: null, tractId: null };
  }
}
