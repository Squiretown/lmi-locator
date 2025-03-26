
// Type definitions for the HUD LMI data service

export interface LMICoordinates {
  latitude: number;
  longitude: number;
}

export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip?: string;
}

export interface CensusInfo {
  tract: string;
  blockGroup: string;
  state: {
    fips: string;
    name: string;
  };
  county: {
    fips: string;
    name: string;
  };
}

export interface AddressInfo {
  matchedAddress: string;
  coordinates: LMICoordinates;
  censusInfo: CensusInfo;
}

export interface LMIResult {
  isLMI: boolean;
  lowModPercent: number;
  lowModPopulation: number;
  geographyType: string;
  geographyId: string;
  state: string;
  county: string;
  geometry?: any; // GeoJSON geometry object
  addressInfo?: AddressInfo;
  message?: string;
}

export interface GeocodingResult {
  features: any[];
  addressInfo?: AddressInfo;
  placeQuery?: string;
}

