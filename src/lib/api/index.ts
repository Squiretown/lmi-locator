
// Main API module that consolidates all exports
import { createClient } from '@supabase/supabase-js';

// Re-export everything from the individual modules
export { cachedFetch, clearApiCache } from './cache';
export { geocodeAddress } from './geocode';
export { checkLmiStatus } from './lmi';

// Note: You can add any extra exports or functionality that doesn't fit neatly into other modules here
