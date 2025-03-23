
// Handler functions for different API actions

// Database operations
import { saveSearch } from './searchOperations.ts';
import { cacheCensusResult, getCachedCensusResult } from './cacheOperations.ts';
import { getSearchHistory, getPopularSearches, getDashboardStats } from './queryOperations.ts';

// Process different types of API requests
export async function handleApiRequest(supabase: any, action: string, params: any) {
  switch (action) {
    case "saveSearch":
      return await saveSearch(supabase, params.address, params.result, params.userId);
    case "getSearchHistory":
      return await getSearchHistory(supabase, params.userId, params.limit);
    case "cacheCensusResult":
      return await cacheCensusResult(supabase, params.tractId, params.data, params.expiresInDays);
    case "getCachedCensusResult":
      return await getCachedCensusResult(supabase, params.tractId);
    case "getPopularSearches":
      return await getPopularSearches(supabase, params.limit);
    case "getDashboardStats":
      return await getDashboardStats(supabase);
    default:
      return { success: false, error: "Invalid action" };
  }
}
