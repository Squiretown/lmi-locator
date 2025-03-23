
// Import types from the new types file
import { CensusGeocoderResult, GeocodedAddress, GeocodingError } from "./types.ts";

// Re-export types for backward compatibility
export { CensusGeocoderResult, GeocodedAddress, GeocodingError };

// Census API configuration
export const CENSUS_CONFIG = {
  geocoderBaseUrl: "https://geocoding.geo.census.gov/geocoder",
  benchmark: "Public_AR_Current",
  vintage: "Current_Current",
  timeout: 10000, // 10 seconds
};
