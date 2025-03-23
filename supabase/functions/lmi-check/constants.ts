
// Configuration constants for Census API

// Census API URL constants
export const CENSUS_GEOCODER_URL = "https://geocoding.geo.census.gov/geocoder";
export const CENSUS_API_BASE_URL = "https://api.census.gov/data";
export const ACS_DATASET = "2019/acs/acs5"; // Using 2019 ACS 5-year estimates
export const MEDIAN_INCOME_VARIABLE = "B19013_001E"; // Median household income variable

// ESRI Geocoding URLs and constants
export const ESRI_GEOCODING_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";
export const ESRI_REVERSE_GEOCODING_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode";

/**
 * Parses a Census Geographic Identifier (GeoID) into its component parts
 * 
 * GeoIDs for census tracts typically follow this format:
 * - First 2 digits: State FIPS code
 * - Next 3 digits: County FIPS code
 * - Remaining digits: Tract code (usually 6 digits, may include decimal)
 * 
 * @param geoId The geographic identifier string to parse
 * @returns Object containing state, county, and tract components
 */
export function parseGeoId(geoId: string): { state: string; county: string; tract: string } {
  if (!geoId) {
    throw new Error('GeoID is required');
  }
  
  // Clean up the GeoID - remove any non-alphanumeric characters except decimal points
  const cleanGeoId = geoId.replace(/[^\w\.]/g, '');
  
  // Different formats handling
  if (cleanGeoId.length >= 11) {
    // Standard 11+ character format (SSCCCTTTTTT)
    return {
      state: cleanGeoId.substring(0, 2),
      county: cleanGeoId.substring(2, 5),
      tract: cleanGeoId.substring(5)
    };
  } else if (cleanGeoId.includes('.')) {
    // Format with explicit decimal separator
    const parts = cleanGeoId.split('.');
    
    if (parts[0].length >= 5) {
      // If first part has state+county
      return {
        state: parts[0].substring(0, 2),
        county: parts[0].substring(2, 5),
        tract: parts[0].substring(5) + '.' + parts[1]
      };
    } else {
      // Format might be different, do our best
      return {
        state: parts[0].substring(0, 2),
        county: parts[0].substring(2),
        tract: parts[1]
      };
    }
  } else {
    // Attempt to parse shorter formats
    if (cleanGeoId.length >= 5) {
      return {
        state: cleanGeoId.substring(0, 2),
        county: cleanGeoId.substring(2, Math.min(5, cleanGeoId.length)),
        tract: cleanGeoId.length > 5 ? cleanGeoId.substring(5) : ''
      };
    } else {
      throw new Error(`Invalid GeoID format: ${geoId}`);
    }
  }
}

/**
 * Creates a standard format GeoID from components
 * 
 * @param state State FIPS code (2 digits)
 * @param county County FIPS code (3 digits)
 * @param tract Tract code
 * @returns Properly formatted GeoID string
 */
export function formatGeoId(state: string, county: string, tract: string): string {
  // Ensure state is 2 digits
  const paddedState = state.padStart(2, '0');
  
  // Ensure county is 3 digits
  const paddedCounty = county.padStart(3, '0');
  
  // Format tract according to Census standards
  // Census tracts typically use a decimal format (e.g., 1234.56)
  let formattedTract = tract;
  
  // If tract doesn't have a decimal but is 6 digits, add one after the 4th digit
  if (!tract.includes('.') && tract.length === 6) {
    formattedTract = tract.substring(0, 4) + '.' + tract.substring(4);
  }
  
  return `${paddedState}${paddedCounty}${formattedTract}`;
}

// Determine income category based on percentage of AMI
export const getIncomeCategory = (percentageOfAmi: number): string => {
  if (percentageOfAmi <= 30) return "Extremely Low Income";
  if (percentageOfAmi <= 50) return "Very Low Income";
  if (percentageOfAmi <= 80) return "Low Income";
  if (percentageOfAmi <= 120) return "Moderate Income";
  return "Above Moderate Income";
};
