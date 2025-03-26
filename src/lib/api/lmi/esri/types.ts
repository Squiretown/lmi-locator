
/**
 * Types for ESRI geocoding responses
 */

export interface GeocodeLocation {
  lat: number;
  lon: number;
  score?: number;
  formattedAddress?: string;
}

export interface GeocodeCandidate {
  address?: string;
  location: {
    x: number;  // longitude
    y: number;  // latitude
  };
  score?: number;
  attributes?: Record<string, any>;
}

export interface GeocodeResponse {
  candidates?: GeocodeCandidate[];
  error?: {
    code?: number;
    message?: string;
    details?: string[];
  };
}

export interface ReverseGeocodeResponse {
  address?: Record<string, any>;
  location?: {
    x: number;
    y: number;
  };
  error?: {
    code?: number;
    message?: string;
    details?: string[];
  };
}
