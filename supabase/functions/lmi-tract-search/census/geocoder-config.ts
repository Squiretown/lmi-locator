
// Configuration for Census geocoding API
export const CENSUS_CONFIG = {
  geocoderBaseUrl: "https://geocoding.geo.census.gov/geocoder",
  benchmark: "Public_AR_Current",
  vintage: "Current_Current",
  timeout: 10000,
};

// Result type definition for the Census geocoder API
export interface CensusGeocoderResult {
  result: {
    input: {
      address: any;
    };
    addressMatches: Array<{
      coordinates: {
        x: number;
        y: number;
      };
      geographies: {
        [key: string]: Array<{
          STATE: string;
          COUNTY: string;
          TRACT: string;
          BLOCK?: string;
          BLKGRP?: string;
          [key: string]: any;
        }>;
      };
    }> | [];
    geographies?: {
      [key: string]: Array<{
        STATE: string;
        COUNTY: string;
        TRACT: string;
        BLOCK?: string;
        BLKGRP?: string;
        [key: string]: any;
      }>;
    };
  };
}

// Geocoded address type definition
export interface GeocodedAddress {
  address: string;
  lat: number;
  lon: number;
  score?: number;
  geoid?: string;
  geocoding_service?: string;
}

// Custom error class for geocoding errors
export class GeocodingError extends Error {
  statusCode: number;
  source: string;

  constructor(message: string, statusCode: number = 500, source: string = 'unknown') {
    super(message);
    this.name = 'GeocodingError';
    this.statusCode = statusCode;
    this.source = source;
  }
}
