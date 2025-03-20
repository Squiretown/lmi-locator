
// Helper functions for working with Census data

// Helper functions for working with Census data
export const parseGeoId = (geoid: string): { state: string, county: string, tract: string } => {
  // GEOID format: SSCCCTTTTTT (2-digit state, 3-digit county, 6-digit tract)
  const state = geoid.substring(0, 2);
  const county = geoid.substring(2, 5);
  const tract = geoid.substring(5);
  
  return { state, county, tract };
};

export const formatTractId = (geoid: string): string => {
  const { state, county, tract } = parseGeoId(geoid);
  // Format as SS (state) + CCC (county) + TTTTTT (tract)
  return `${state}${county}${tract}`;
};

// Determine income category based on percentage of AMI
export const getIncomeCategory = (percentageOfAmi: number): string => {
  if (percentageOfAmi <= 30) return "Extremely Low Income";
  if (percentageOfAmi <= 50) return "Very Low Income";
  if (percentageOfAmi <= 80) return "Low Income";
  if (percentageOfAmi <= 120) return "Moderate Income";
  return "Above Moderate Income";
};
