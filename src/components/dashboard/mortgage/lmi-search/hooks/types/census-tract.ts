
// Define type for a census tract
export interface CensusTract {
  tractId: string;
  isLmiEligible: boolean;
  amiPercentage: number;
  medianIncome: number;
  propertyCount: number;
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
