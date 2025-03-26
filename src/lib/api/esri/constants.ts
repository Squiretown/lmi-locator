
// Constants for ESRI and HUD API endpoints

// HUD Low to Moderate Income data service endpoints
export const LMI_TRACT_URL = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Low_to_Moderate_Income_Population_by_Tract/FeatureServer/0/query';
export const LMI_BLOCK_GROUP_URL = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Low_to_Moderate_Income_Population_by_Block_Group/FeatureServer/0/query';

// ESRI Geocoding services
export const ESRI_GEOCODE_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';

// Census Bureau services
export const CENSUS_GEOCODER_ENDPOINT = 'https://geocoding.geo.census.gov/geocoder/locations/address';

// LMI threshold percentage
export const LMI_THRESHOLD = 51; // 51% threshold for LMI qualification
