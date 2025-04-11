
// Define type for a census tract
export interface CensusTract {
  tractId: string;
  isLmiEligible: boolean;
  amiPercentage: number;
  medianIncome: number;
  incomeCategory: string;
  propertyCount: number;
  geometry: any;
}

// Define search parameters
export interface SearchParams {
  state?: string;
  county?: string;
  zipCode?: string;
  radius?: number;
}

// State option type
export interface StateOption {
  code: string;
  name: string;
}

// County option type
export interface CountyOption {
  fips: string;
  name: string;
}

// Stats data interface
export interface StatsData {
  totalTracts: number;
  lmiTracts: number;
  propertyCount: number;
  lmiPercentage: number;
}

// Search results type
export interface SearchResults {
  params: SearchParams;
  resultCount: number;
  dataSource?: string;
}
