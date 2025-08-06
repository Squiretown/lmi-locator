
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Handle API requests and route to the appropriate function
export async function handleApiRequest(supabase: SupabaseClient, action: string, params: any = {}) {
  console.log(`Handling API request: action=${action}`);
  
  try {
    switch (action) {
      case 'getDashboardStats':
        return await handleGetDashboardStats(supabase);
      case 'searchByAddress':
        return await handleSearchByAddress(supabase, params);
      case 'searchBatch':
        return await handleSearchBatch(supabase, params);
      case 'searchTracts':
        return await handleSearchTracts(supabase, params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error handling API request for action ${action}:`, error);
    return {
      success: false,
      error: error.message || `Unknown error processing ${action} action`,
      timestamp: new Date().toISOString()
    };
  }
}

// Handle dashboard stats request
async function handleGetDashboardStats(supabase: SupabaseClient) {
  console.log("Fetching dashboard statistics");
  
  // Initialize response object with default values
  const response = {
    userCount: 0,
    propertyCount: 0,
    realtorCount: 0,
    searchHistory: [],
    success: true,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Get user count
    try {
      const { count: userCount, error: userError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userError) {
        console.error("Error fetching user count:", userError);
        // Continue execution, set default value
        response.userCount = 0;
      } else {
        response.userCount = userCount || 0;
      }
    } catch (userCountError) {
      console.error("Exception fetching user count:", userCountError);
      response.userCount = 0;
    }
    
    // Get property count 
    try {
      const { count: propertyCount, error: propertyError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      
      if (propertyError) {
        if (propertyError.code === 'PGRST116') {
          console.log("Properties table doesn't exist yet, using default value");
        } else {
          console.error("Error fetching property count:", propertyError);
        }
        response.propertyCount = 0;
      } else {
        response.propertyCount = propertyCount || 0;
      }
    } catch (propError) {
      console.error("Exception fetching property count:", propError);
      response.propertyCount = 0;
    }
    
    // Get realtor count
    try {
      const { count: realtorCount, error: realtorError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'realtor');
      
      if (realtorError) {
        console.error("Error fetching realtor count:", realtorError);
        response.realtorCount = 0;
      } else {
        response.realtorCount = realtorCount || 0;
      }
    } catch (realtorCountError) {
      console.error("Exception fetching realtor count:", realtorCountError);
      response.realtorCount = 0;
    }
    
    // Get search history
    try {
      const { data: searchHistory, error: searchError } = await supabase
        .from('search_history')
        .select('*')
        .order('searched_at', { ascending: false })
        .limit(10);
      
      if (searchError) {
        if (searchError.code === 'PGRST116') {
          console.log("Search history table doesn't exist yet, using default value");
        } else {
          console.error("Error fetching search history:", searchError);
        }
        response.searchHistory = [];
      } else {
        response.searchHistory = searchHistory || [];
      }
    } catch (searchHistoryError) {
      console.error("Exception fetching search history:", searchHistoryError);
      response.searchHistory = [];
    }
    
    // Return the dashboard stats
    return response;
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return {
      userCount: 0,
      propertyCount: 0,
      realtorCount: 0,
      searchHistory: [],
      success: false,
      error: error.message || "Unknown error in getDashboardStats",
      timestamp: new Date().toISOString()
    };
  }
}

// Handle search by address
async function handleSearchByAddress(supabase: SupabaseClient, params: any) {
  try {
    const { address } = params;
    
    if (!address) {
      throw new Error("Address is required");
    }
    
    console.log(`Searching for address: ${address}`);
    
    // Implement your search logic here
    // For now, we'll return a placeholder response
    return {
      success: true,
      results: [],
      message: "Search function is being implemented"
    };
  } catch (error) {
    console.error("Error in searchByAddress:", error);
    return {
      success: false,
      error: error.message || "Unknown error in searchByAddress"
    };
  }
}

// Handle batch search for census tracts
async function handleSearchBatch(supabase: SupabaseClient, params: any) {
  try {
    console.log('Handling searchBatch request with params:', params);
    
    const { state, county, zipCode, tractId, radius = 25 } = params;
    
    // Build the query based on provided parameters
    let query = supabase
      .from('census_tracts')
      .select(`
        tract_id,
        state,
        county,
        tract_name,
        income_level,
        ami_percentage,
        median_income,
        is_lmi_eligible,
        tract_population,
        minority_population_pct,
        owner_occupied_units,
        total_households,
        total_population,
        msa_md_median_income,
        tract_median_family_income,
        ffiec_data_year,
        geometry,
        centroid_lat,
        centroid_lng
      `);

    // Apply filters based on search parameters
    if (tractId) {
      // Direct tract ID search
      query = query.eq('tract_id', tractId.trim());
    } else if (state && county) {
      // State + county search
      query = query.eq('state', state.toUpperCase()).eq('county', county);
    } else if (state) {
      // State-only search (limit to avoid too many results)
      query = query.eq('state', state.toUpperCase()).limit(500);
    } else if (zipCode) {
      // For ZIP code search, we need to use geographic lookup
      // This is a simplified approach - in production you'd use proper geocoding
      console.log(`ZIP code search not fully implemented yet: ${zipCode}`);
      return {
        success: false,
        error: "ZIP code search requires geographic lookup service",
        tracts: [],
        summary: { totalTracts: 0, lmiTracts: 0, propertyCount: 0, lmiPercentage: 0 }
      };
    } else {
      throw new Error("Please provide either tractId, state, or zipCode");
    }

    // Execute the query
    const { data: tracts, error } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Found ${tracts?.length || 0} census tracts`);

    // Transform data to match expected format
    const transformedTracts = (tracts || []).map(tract => ({
      tractId: tract.tract_id,
      isLmiEligible: tract.is_lmi_eligible || false,
      amiPercentage: tract.ami_percentage || 0,
      medianIncome: tract.median_income || 0,
      incomeCategory: tract.income_level || 'Unknown',
      propertyCount: tract.total_households || 0,
      geometry: tract.geometry || null,
      tractName: tract.tract_name,
      state: tract.state,
      county: tract.county,
      population: tract.tract_population,
      minorityPercentage: tract.minority_population_pct,
      ownerOccupiedUnits: tract.owner_occupied_units,
      msaMedianIncome: tract.msa_md_median_income,
      tractMedianFamilyIncome: tract.tract_median_family_income,
      dataYear: tract.ffiec_data_year || 2025
    }));

    // Calculate summary statistics
    const totalTracts = transformedTracts.length;
    const lmiTracts = transformedTracts.filter(t => t.isLmiEligible).length;
    const propertyCount = transformedTracts.reduce((sum, t) => sum + (t.propertyCount || 0), 0);
    const lmiPercentage = totalTracts > 0 ? Math.round((lmiTracts / totalTracts) * 100) : 0;

    const summary = {
      totalTracts,
      lmiTracts,
      propertyCount,
      lmiPercentage
    };

    console.log('Search summary:', summary);

    return {
      success: true,
      tracts: transformedTracts,
      summary,
      searchParams: params,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error in searchBatch:", error);
    return {
      success: false,
      error: error.message || "Unknown error in searchBatch",
      tracts: [],
      summary: { totalTracts: 0, lmiTracts: 0, propertyCount: 0, lmiPercentage: 0 }
    };
  }
}

// Handle census tract search by various criteria
async function handleSearchTracts(supabase: SupabaseClient, params: any) {
  try {
    console.log('Handling searchTracts request with params:', params);
    
    const { searchType, searchValue, state, limit = 100 } = params;
    
    if (!searchType || !searchValue) {
      throw new Error("searchType and searchValue are required");
    }

    let query = supabase
      .from('census_tracts')
      .select(`
        tract_id,
        state,
        county,
        tract_name,
        income_level,
        ami_percentage,
        median_income,
        is_lmi_eligible,
        tract_population,
        total_households,
        ffiec_data_year
      `)
      .limit(limit);

    // Apply search criteria based on type
    switch (searchType) {
      case 'tract':
        query = query.eq('tract_id', searchValue.trim());
        break;
      case 'county':
        if (state) {
          query = query.eq('state', state.toUpperCase()).ilike('county', `%${searchValue}%`);
        } else {
          query = query.ilike('county', `%${searchValue}%`);
        }
        break;
      case 'zip':
        // ZIP code search would require geocoding service
        // For now, return error message
        throw new Error("ZIP code search requires external geocoding service");
      default:
        throw new Error(`Unsupported search type: ${searchType}`);
    }

    const { data: tracts, error } = await query;
    
    if (error) {
      console.error('Database query error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Found ${tracts?.length || 0} census tracts for ${searchType}: ${searchValue}`);

    // Transform and return results
    const results = (tracts || []).map(tract => ({
      tract_id: tract.tract_id,
      state: tract.state,
      county: tract.county,
      tract_name: tract.tract_name,
      income_level: tract.income_level,
      ami_percentage: tract.ami_percentage,
      median_income: tract.median_income,
      is_lmi_eligible: tract.is_lmi_eligible,
      population: tract.tract_population,
      households: tract.total_households,
      data_year: tract.ffiec_data_year
    }));

    return {
      success: true,
      results,
      count: results.length,
      searchType,
      searchValue,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error in searchTracts:", error);
    return {
      success: false,
      error: error.message || "Unknown error in searchTracts",
      results: []
    };
  }
}
