
// Export all Census geocoding functionality
export { determineCensusTract } from "./tract-finder.ts";
export { geocodeAddress } from "./address-geocoder.ts";
export { geocodeWithCensus } from "./geocoder-utils.ts";
export type { GeocodedAddress } from "./geocoder-config.ts";
export { GeocodingError } from "./geocoder-config.ts";

// Re-export the CensusGeocoderResult type from the config file for use in other modules
import { CensusGeocoderResult } from "./geocoder-config.ts";
export type { CensusGeocoderResult };
