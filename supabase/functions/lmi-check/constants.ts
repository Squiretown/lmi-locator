
// Configuration constants for Census API

// Census API URL constants
export const CENSUS_GEOCODER_URL = "https://geocoding.geo.census.gov/geocoder";
export const CENSUS_API_BASE_URL = "https://api.census.gov/data";
export const ACS_DATASET = "2019/acs/acs5"; // Using 2019 ACS 5-year estimates
export const MEDIAN_INCOME_VARIABLE = "B19013_001E"; // Median household income variable

// ESRI Geocoding URLs and constants
export const ESRI_GEOCODING_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates";
export const ESRI_REVERSE_GEOCODING_URL = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode";

// Determine income category based on percentage of AMI
export const getIncomeCategory = (percentageOfAmi: number): string => {
  if (percentageOfAmi <= 30) return "Extremely Low Income";
  if (percentageOfAmi <= 50) return "Very Low Income";
  if (percentageOfAmi <= 80) return "Low Income";
  if (percentageOfAmi <= 120) return "Moderate Income";
  return "Above Moderate Income";
};
