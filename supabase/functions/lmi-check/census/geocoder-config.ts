// Define smaller, focused interfaces for better readability
interface GeoCoordinates {
  x: number; // longitude
  y: number; // latitude
}

interface AddressMatch {
  coordinates: GeoCoordinates;
  matchedAddress?: string;
  geographies?: Record<string, any>;
}

interface CensusTract {
  GEOID: string;
  STATE: string;
  COUNTY: string;
  TRACT: string;
  NAME: string;
}

interface Geographies {
  "Census Tracts"?: Array<CensusTract>;
}

interface LocationInput {
  x: number; // longitude
  y: number; // latitude
}

interface AddressInput {
  address: string;
}

// Main Census Geocoder Result interface composed of smaller interfaces
interface CensusGeocoderResult {
  result?: {
    addressMatches?: Array<AddressMatch>;
    geographies?: Geographies;
  };
  input?: {
    location?: LocationInput;
    address?: AddressInput;
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
