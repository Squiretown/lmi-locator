
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
