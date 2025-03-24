// Define the interface directly in this file
interface CensusGeocoderResult {
  result?: {
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
    address?: {
      address: string;
    };
  };
}

// Other interfaces from types.ts that we need to keep
interface GeocodedAddress {
  coordinates: {
    lat: number;
    lon: number;
  } | null;
  tractId: string | null;
  formattedAddress?: string;
  source?: string;
}

class GeocodingError extends Error {
  statusCode?: number;
  source: string;

  constructor(message: string, statusCode?: number, source: string = 'unknown') {
    super(message);
    this.name = 'GeocodingError';
    this.statusCode = statusCode;
    this.source = source;
  }
}

// Export the interfaces for other files to use
export { CensusGeocoderResult, GeocodedAddress, GeocodingError };

// Census API configuration
export const CENSUS_CONFIG = {
  geocoderBaseUrl: "https://geocoding.geo.census.gov/geocoder",
  benchmark: "Public_AR_Current",
  vintage: "Current_Current",
  timeout: 5000, // 5 seconds
};
