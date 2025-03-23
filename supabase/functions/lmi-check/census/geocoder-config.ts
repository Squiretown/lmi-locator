
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

/**
 * Geocoded address result
 */
export interface GeocodedAddress {
  coordinates: { 
    lat: number; 
    lon: number 
  } | null;
  tractId: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  matchScore?: number;
  source?: 'census' | 'arcgis' | 'fallback';
}

/**
 * Geographic region IDs
 */
export interface GeographicIds {
  state: string;
  county: string;
  tract: string;
  block?: string;
  blockGroup?: string;
}

/**
 * Format for parsed GeoID
 */
export interface ParsedGeoId {
  state: string;
  county: string;
  tract: string;
}

/**
 * Error related to geocoding
 */
export class GeocodingError extends Error {
  public statusCode?: number;
  public source?: string;
  
  constructor(message: string, statusCode?: number, source?: string) {
    super(message);
    this.name = 'GeocodingError';
    this.statusCode = statusCode;
    this.source = source;
  }
}
