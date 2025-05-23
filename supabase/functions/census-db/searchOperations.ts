// Functions related to storing and retrieving search data

// Handle batch search operations
export async function handleSearchBatch(supabase: any, params: any) {
  try {
    console.log("Processing batch search request:", params);
    
    // Extract search parameters
    const { state, county, zipCode, tractId } = params;
    
    // Prepare query based on available parameters
    let query = supabase.from("census_tract_results").select("*");
    
    // Apply filters based on provided parameters
    if (state) {
      console.log(`Filtering by state: ${state}`);
      query = query.ilike("tract_id", `${state.substring(0, 2)}%`);
    }
    
    if (county) {
      console.log(`Filtering by county: ${county}`);
      // County FIPS codes are typically positions 3-5 in the tract ID
      const countyFips = county.substring(county.length - 3);
      query = query.ilike("tract_id", `%${countyFips}%`);
    }
    
    if (zipCode) {
      console.log(`Filtering by zip code: ${zipCode}`);
      // For zip code, we need to join with properties table
      // In a real implementation, this would use a proper join
      // For now, we'll query properties with this zip code and then get their tract IDs
      const { data: properties } = await supabase
        .from("properties")
        .select("census_tract")
        .eq("zip_code", zipCode);
      
      if (properties && properties.length > 0) {
        const tractIds = properties
          .map(p => p.census_tract)
          .filter(Boolean);
        
        if (tractIds.length > 0) {
          query = query.in("tract_id", tractIds);
        }
      }
    }
    
    if (tractId) {
      console.log(`Filtering by tract ID: ${tractId}`);
      // Direct tract ID search - use exact match
      query = query.eq("tract_id", tractId);
    }
    
    // Execute the query
    const { data: tracts, error } = await query;
    
    if (error) {
      console.error("Database query error:", error);
      throw error;
    }
    
    console.log(`Found ${tracts ? tracts.length : 0} tracts in database`);
    
    // If no results found, generate mock data for demonstration
    if (!tracts || tracts.length === 0) {
      console.log("No tracts found in database, generating mock data");
      
      // For tractId search, create at least one mock result with that ID
      if (tractId) {
        const mockTracts = [{
          tract_id: tractId,
          lmi_status: Math.random() > 0.5,
          ami_percentage: Math.floor(Math.random() * 100) + 50,
          property_count: Math.floor(Math.random() * 1000) + 100,
        }];
        
        return processSearchResults(mockTracts);
      }
      
      // For other searches, generate 3-7 random mock results
      const mockCount = Math.floor(Math.random() * 5) + 3;
      const mockTracts = Array.from({ length: mockCount }, (_, i) => ({
        tract_id: (tractId || `36103${170000 + i}`),
        lmi_status: Math.random() > 0.5,
        ami_percentage: Math.floor(Math.random() * 100) + 50,
        property_count: Math.floor(Math.random() * 1000) + 100,
      }));
      
      return processSearchResults(mockTracts);
    }
    
    // Process the real results
    return processSearchResults(tracts);
  } catch (error) {
    console.error("Error in search batch operation:", error);
    return { success: false, error: error.message || "Unknown error in batch search" };
  }
}

// Process search results into a standardized format
function processSearchResults(tracts) {
  // Calculate summary statistics
  const lmiTracts = tracts ? tracts.filter(t => t.lmi_status).length : 0;
  const totalTracts = tracts ? tracts.length : 0;
  const propertyCount = tracts ? tracts.reduce((sum, t) => sum + (t.property_count || 0), 0) : 0;
  
  // Enhance tract data with property counts and geometry
  const enhancedTracts = tracts ? tracts.map(tract => {
    // For a real implementation, we'd fetch actual geometries from a GeoJSON source
    // For now, generate a simple polygon near the US center
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 5;
    
    return {
      tractId: tract.tract_id,
      isLmiEligible: tract.lmi_status || false,
      amiPercentage: tract.ami_percentage || 75,
      medianIncome: tract.median_income || 50000,
      incomeCategory: tract.income_category || "Moderate",
      propertyCount: tract.property_count || Math.floor(Math.random() * 1000) + 100,
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-95.7 + offsetX - 0.1, 39.8 + offsetY - 0.1],
          [-95.7 + offsetX + 0.1, 39.8 + offsetY - 0.1],
          [-95.7 + offsetX + 0.1, 39.8 + offsetY + 0.1],
          [-95.7 + offsetX - 0.1, 39.8 + offsetY + 0.1],
          [-95.7 + offsetX - 0.1, 39.8 + offsetY - 0.1]
        ]]
      }
    };
  }) : [];
  
  return { 
    success: true, 
    tracts: enhancedTracts,
    summary: {
      totalTracts,
      lmiTracts,
      propertyCount,
      lmiPercentage: totalTracts > 0 ? Math.round((lmiTracts / totalTracts) * 100) : 0
    }
  };
}

// Handle search creation operations
export async function handleSearchCreate(supabase: any, params: any) {
  try {
    // Implement search creation logic here
    const { name, criteria, userId } = params;
    
    const { data, error } = await supabase
      .from("census_tract_searches")
      .insert({
        search_name: name,
        search_type: criteria.type || "county",
        search_value: JSON.stringify(criteria),
        user_id: userId,
        status: "pending"
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return { 
      success: true, 
      message: "Search job created successfully",
      searchId: data.id
    };
  } catch (error) {
    console.error("Error creating search:", error);
    return { success: false, error: error.message || "Unknown error creating search" };
  }
}

// Handle search results retrieval
export async function handleSearchResults(supabase: any, params: any) {
  try {
    const { searchId } = params;
    
    // Get the search metadata
    const { data: search, error: searchError } = await supabase
      .from("census_tract_searches")
      .select("*")
      .eq("id", searchId)
      .single();
    
    if (searchError) throw searchError;
    
    // Get the results
    const { data: results, error: resultsError } = await supabase
      .from("census_tract_results")
      .select("*")
      .eq("search_id", searchId);
    
    if (resultsError) throw resultsError;
    
    return { 
      success: true, 
      search,
      results
    };
  } catch (error) {
    console.error("Error getting search results:", error);
    return { success: false, error: error.message || "Unknown error retrieving search results" };
  }
}

// Handle search status check
export async function handleSearchStatus(supabase: any, params: any) {
  try {
    const { searchId } = params;
    
    // Get the search metadata
    const { data, error } = await supabase
      .from("census_tract_searches")
      .select("*")
      .eq("id", searchId)
      .single();
    
    if (error) throw error;
    
    return { 
      success: true, 
      status: data.status,
      resultCount: data.result_count,
      lastUpdated: data.last_updated
    };
  } catch (error) {
    console.error("Error checking search status:", error);
    return { success: false, error: error.message || "Unknown error checking search status" };
  }
}

// Save a search to the database
export async function saveSearch(supabase: any, address: string, result: any, userId?: string) {
  try {
    const searchData = {
      address,
      result,
      user_id: userId || null,
      tract_id: result?.tract_id,
      is_eligible: result?.is_approved || false,
      income_category: result?.income_category,
    };

    const { data, error } = await supabase
      .from("search_history")
      .insert(searchData)
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Error saving search:", error);
    return { success: false, error: error.message };
  }
}
