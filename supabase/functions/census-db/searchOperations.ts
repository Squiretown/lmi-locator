
// Functions related to storing and retrieving search data

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
