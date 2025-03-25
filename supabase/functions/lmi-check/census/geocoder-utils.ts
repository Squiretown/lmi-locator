
/**
 * Utility functions for Census geocoding 
 */

/**
 * Geocode an address using the U.S. Census Geocoding API.
 * 
 * @param address The address to geocode
 * @returns Object with coordinates, status and message
 */
export async function geocodeWithCensus(address: string): Promise<{
  lat: number | null;
  lon: number | null;
  status: 'success' | 'warning' | 'error';
  message: string;
}> {
  try {
    // Format and clean the address
    address = address.trim();
    
    // Census API endpoint
    const baseUrl = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
    
    // Set up parameters
    const params = new URLSearchParams({
      address: address,
      benchmark: "2020", // Use the Public_AR_Current benchmark
      format: "json"
    });
    
    console.log(`Making Census geocoding request with address: ${address}`);
    
    // Make the request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "LMI-Check/1.0"
        }
      });
      
      clearTimeout(timeoutId);
      
      // Log the response for debugging
      console.log(`Census API response status: ${response.status}`);
      
      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Log a sample of the response for debugging
      console.log(`Census API response sample: ${JSON.stringify(data).substring(0, 1000)}`);
      
      // Check for matches
      const result = data.result || {};
      const addresses = result.addressMatches || [];
      
      if (addresses && addresses.length > 0) {
        // Get the best match (first match)
        const match = addresses[0];
        
        // Extract coordinates
        const coordinates = match.coordinates || {};
        const lat = coordinates.y;
        const lon = coordinates.x;
        
        if (lat && lon) {
          // Get match information
          const matchedAddress = match.matchedAddress || '';
          
          console.log(`Successfully geocoded with Census API: ${lat}, ${lon}`);
          return { 
            lat, 
            lon, 
            status: "success", 
            message: `Matched address: ${matchedAddress}` 
          };
        } else {
          console.warn("No coordinates found in Census API response");
          return { 
            lat: null, 
            lon: null, 
            status: "warning", 
            message: "No coordinates in match data" 
          };
        }
      } else {
        console.warn(`No matches found in Census API for: ${address}`);
        return { 
          lat: null, 
          lon: null, 
          status: "error", 
          message: "No matching addresses found" 
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
      
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error(`Census geocoding request timed out for address: ${address}`);
      return { 
        lat: null, 
        lon: null, 
        status: "error", 
        message: "Request timed out" 
      };
    }
    
    console.error(`Error in Census geocoding: ${error}`);
    return { 
      lat: null, 
      lon: null, 
      status: "error", 
      message: `Error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}
