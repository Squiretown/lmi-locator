
import { SupabaseClient } from '@supabase/supabase-js';
import { corsHeaders } from './index';
import {
  handleCacheQuery,
  handleCacheSave,
  handleCacheStatus
} from './cacheOperations';
import {
  handleSearchBatch,
  handleSearchCreate,
  handleSearchResults,
  handleSearchStatus
} from './searchOperations';
import {
  handleQueryAddress,
  handleQueryCoordinates,
  handleQueryTract
} from './queryOperations';

/**
 * Get dashboard statistics for the admin dashboard
 */
async function handleGetDashboardStats(
  supabase: SupabaseClient,
  params: any
) {
  try {
    // Get user count
    const { count: userCount, error: userError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (userError) throw userError;

    // Get property count
    const { count: propertyCount, error: propertyError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });

    if (propertyError) throw propertyError;

    // Get realtor count
    const { count: realtorCount, error: realtorError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'realtor');

    if (realtorError) throw realtorError;

    // Get recent search history
    const { data: searchHistory, error: searchError } = await supabase
      .from('search_history')
      .select('*')
      .order('searched_at', { ascending: false })
      .limit(10);

    if (searchError) throw searchError;

    return {
      userCount: userCount || 0,
      propertyCount: propertyCount || 0,
      realtorCount: realtorCount || 0,
      searchHistory: searchHistory || []
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch dashboard statistics' 
    };
  }
}

/**
 * Handle API requests for the census-db edge function
 */
export async function handleApiRequest(
  supabase: SupabaseClient,
  action: string,
  params: any
) {
  // Query operations
  if (action === 'queryTract') {
    return await handleQueryTract(supabase, params);
  } else if (action === 'queryAddress') {
    return await handleQueryAddress(supabase, params);
  } else if (action === 'queryCoordinates') {
    return await handleQueryCoordinates(supabase, params);
  }
  
  // Cache operations
  else if (action === 'cacheQuery') {
    return await handleCacheQuery(supabase, params);
  } else if (action === 'cacheSave') {
    return await handleCacheSave(supabase, params);
  } else if (action === 'cacheStatus') {
    return await handleCacheStatus(supabase, params);
  } 
  
  // Search operations
  else if (action === 'searchCreate') {
    return await handleSearchCreate(supabase, params);
  } else if (action === 'searchStatus') {
    return await handleSearchStatus(supabase, params);
  } else if (action === 'searchResults') {
    return await handleSearchResults(supabase, params);
  } else if (action === 'searchBatch') {
    return await handleSearchBatch(supabase, params);
  }
  
  // Dashboard operations
  else if (action === 'getDashboardStats') {
    return await handleGetDashboardStats(supabase, params);
  }
  
  // Unknown action
  else {
    throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Build a response with the appropriate CORS headers
 */
export function buildResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}
