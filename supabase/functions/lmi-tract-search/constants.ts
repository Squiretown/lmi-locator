
/**
 * Formats state, county, and tract codes into a standard Census GeoID format
 * 
 * @param state State FIPS code (2 digits)
 * @param county County FIPS code (3 digits)
 * @param tract Tract code (6 digits)
 * @returns Formatted GeoID string
 */
export function formatGeoId(state: string, county: string, tract: string): string {
  // Ensure consistent formatting with leading zeros
  const stateCode = state.padStart(2, '0');
  const countyCode = county.padStart(3, '0');
  const tractCode = tract.padStart(6, '0');
  
  return `${stateCode}${countyCode}${tractCode}`;
}
