
/**
 * Type definitions for Census API responses
 */

/**
 * Census Geocoder API response structure
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
    address?: {
      address: string;
    };
  };
}

/**
 * Result of geocoding an address
 */
export interface GeocodedAddress {
  coordinates: {
    lat: number;
    lon: number;
  } | null;
  tractId: string | null;
  formattedAddress?: string;
  source?: string;
}

/**
 * Custom error class for geocoding errors
 */
export class GeocodingError extends Error {
  statusCode?: number;
  source: string;

  constructor(message: string, statusCode?: number, source: string = 'unknown') {
    super(message);
    this.name = 'GeocodingError';
    this.statusCode = statusCode;
    this.source = source;
  }
}
