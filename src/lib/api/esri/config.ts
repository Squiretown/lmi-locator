// Configuration constants for ESRI geocoding service

// ESRI Geocoding services URLs
export const ESRI_GEOCODE_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
export const ESRI_GEOCODING_URL = ESRI_GEOCODE_URL; // Alias for backward compatibility
export const ESRI_GEOCODING_API_URL = 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
export const ESRI_REVERSE_GEOCODING_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode';

// Note: ESRI API key is now stored securely in Supabase secrets
// and accessed via edge functions for security