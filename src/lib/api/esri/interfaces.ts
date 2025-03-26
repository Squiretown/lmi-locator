
// Interfaces for ESRI and LMI data services

/**
 * Geographic coordinates
 */
export interface LMICoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Address components for geocoding
 */
export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip?: string;
}

/**
 * Result from LMI data processing
 */
export interface LMIResult {
  isLMI: boolean;
  lowModPercent: number;
  lowModPopulation: number;
  geographyType: string;
  geographyId: string;
  state: string;
  county: string;
  geometry?: any; // GeoJSON geometry object
  addressInfo?: any;
  message?: string;
}

/**
 * Area search parameters
 */
export type AreaType = 'city' | 'county' | 'zip' | 'state';
