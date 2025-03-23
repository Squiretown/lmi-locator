
/**
 * Configuration for Census Geocoder API
 */
export const CENSUS_CONFIG = {
  geocoderBaseUrl: "https://geocoding.geo.census.gov/geocoder",
  benchmark: "Public_AR_Current", 
  vintage: "Current_Current",
  timeout: 5000
};

/**
 * Result from Census Geocoder
 */
export interface CensusGeocoderResult {
  result: {
    addressMatches?: Array<{
      coordinates: {
        x: number; // longitude
        y: number; // latitude
      };
      matchedAddress?: string;
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
