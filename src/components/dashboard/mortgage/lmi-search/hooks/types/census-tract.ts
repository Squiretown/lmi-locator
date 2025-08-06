
// Define type for a census tract
export interface CensusTract {
  tractId: string;
  isLmiEligible: boolean;
  amiPercentage: number;
  medianIncome: number;
  propertyCount: number;
  // Additional FFIEC data fields
  tractName?: string;
  state?: string;
  county?: string;
  incomeCategory?: string;
  population?: number;
  geometry?: any;
  minorityPercentage?: number;
  ownerOccupiedUnits?: number;
  msaMedianIncome?: number;
  tractMedianFamilyIncome?: number;
  dataYear?: number;
}

// Search results type
export interface SearchResults {
  tracts: CensusTract[];
  summary: {
    totalTracts: number;
    lmiTracts: number;
    propertyCount: number;
    lmiPercentage?: number;
  };
}
