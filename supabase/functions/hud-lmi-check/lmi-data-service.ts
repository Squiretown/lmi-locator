
// Service for querying HUD's Low to Moderate Income data through ArcGIS
// Main entry point module that re-exports all functionality

// Re-export types and interfaces
export {
  LMICoordinates,
  AddressComponents,
  CensusInfo,
  AddressInfo,
  LMIResult,
  GeocodingResult
} from './interfaces';

// Re-export constants
export {
  LMI_TRACT_ENDPOINT,
  LMI_BLOCK_GROUP_ENDPOINT,
  CENSUS_GEOCODER_ENDPOINT,
  LMI_ELIGIBILITY_THRESHOLD
} from './constants';

// Re-export geocoding functions
export {
  geocodeAddress,
  geocodePlace
} from './geocoding';

// Re-export HUD API functions
export {
  searchLMIByLocation,
  searchLMIByFIPS,
  searchLMIByPlaceName,
  searchLMIByAddress
} from './hud-api';

// Re-export data processing functions
export {
  processLMIData
} from './data-processing';

