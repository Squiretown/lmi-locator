
// Configuration constants for ESRI geocoding service

// ESRI API key - for frontend client usage only
// Note: This should ideally be an environment variable in production
// Since this is a browser/frontend key, it can be stored here temporarily
export const ESRI_API_KEY = "AAPKa240e26a09ac4ea4bef6a0c6cb25a81aK1fJt6b3QlT0_J3aCAZLBTEE5fZ5CaNoMGWCdp1qeRCjcl9U1uFi7-H8rOgTVPMd";

// ESRI Geocoding services URLs
export const ESRI_GEOCODE_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
export const ESRI_GEOCODING_URL = ESRI_GEOCODE_URL; // Alias for backward compatibility
export const ESRI_GEOCODING_API_URL = 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
export const ESRI_REVERSE_GEOCODING_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode';
