
// Functions for retrieving different types of data from the database

// Get search history for a user
export async function getSearchHistory(supabase: any, userId?: string, limit: number = 10) {
  try {
    let query = supabase
      .from("search_history")
      .select("*")
      .order("searched_at", { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error retrieving search history:", error);
    return { success: false, error: error.message };
  }
}

// Get popular searches
export async function getPopularSearches(supabase: any, limit: number = 5) {
  try {
    const { data, error } = await supabase
      .rpc("get_popular_searches", { result_limit: limit });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error retrieving popular searches:", error);
    return { success: false, error: error.message };
  }
}

// Get analytics summary for dashboard
export async function getDashboardStats(supabase: any) {
  try {
    // Get total searches
    const { count: totalSearches, error: searchError } = await supabase
      .from("search_history")
      .select("*", { count: "exact", head: true });
    
    if (searchError) throw searchError;
    
    // Get LMI eligible properties
    const { count: lmiProperties, error: lmiError } = await supabase
      .from("search_history")
      .select("*", { count: "exact", head: true })
      .eq("is_eligible", true);
    
    if (lmiError) throw lmiError;
    
    // Get recent searches
    const { data: recentSearches, error: recentError } = await supabase
      .from("search_history")
      .select("*")
      .order("searched_at", { ascending: false })
      .limit(5);
    
    if (recentError) throw recentError;
    
    const lmiPercentage = totalSearches ? Math.round((lmiProperties / totalSearches) * 100) : 0;
    
    return { 
      success: true, 
      data: {
        totalSearches,
        lmiProperties,
        lmiPercentage,
        recentSearches
      }
    };
  } catch (error) {
    console.error("Error retrieving dashboard stats:", error);
    return { success: false, error: error.message };
  }
}
