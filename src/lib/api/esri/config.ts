
// Configuration constants for ESRI geocoding service
import { ESRI_GEOCODING_URL, ESRI_REVERSE_GEOCODING_URL, ESRI_GEOCODING_API_URL } from '../constants';

// ESRI API key - for frontend client usage only
// Note: This should ideally be an environment variable in production
// Since this is a browser/frontend key, it can be stored here temporarily
export const ESRI_API_KEY = "AAPKa240e26a09ac4ea4bef6a0c6cb25a81aK1fJt6b3QlT0_J3aCAZLBTEE5fZ5CaNoMGWCdp1qeRCjcl9U1uFi7-H8rOgTVPMd";

// Export the URLs for diagnostic purposes
export { ESRI_GEOCODING_URL, ESRI_REVERSE_GEOCODING_URL, ESRI_GEOCODING_API_URL };
