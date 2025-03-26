
// Constants for ESRI and HUD API endpoints

// HUD Low to Moderate Income data service endpoints
export const LMI_TRACT_URL = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Low_to_Moderate_Income_Population_by_Tract/FeatureServer/0/query';
export const LMI_BLOCK_GROUP_URL = 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Low_to_Moderate_Income_Population_by_Block_Group/FeatureServer/0/query';

// LMI threshold percentage
export const LMI_THRESHOLD = 51; // 51% threshold for LMI qualification

// These are also defined in config.ts, but included here for compatibility with existing imports
// Ideally we'd refactor to use only one source of truth, but maintaining backwards compatibility for now
export const ESRI_GEOCODE_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
export const ESRI_GEOCODING_URL = ESRI_GEOCODE_URL; // Alias for backward compatibility
export const ESRI_GEOCODING_API_URL = 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
export const ESRI_REVERSE_GEOCODING_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode';

// Census Bureau services
export const CENSUS_GEOCODER_ENDPOINT = 'https://geocoding.geo.census.gov/geocoder/locations/address';
