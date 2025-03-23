
// Functions for caching and retrieving Census API results

// Cache Census API results
export async function cacheCensusResult(supabase: any, tractId: string, data: any, expiresInDays: number = 30) {
  try {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(now.getDate() + expiresInDays);

    const cacheData = {
      tract_id: tractId,
      data,
      expires_at: expiresAt.toISOString(),
    };

    // Check if entry already exists
    const { data: existingData, error: selectError } = await supabase
      .from("census_cache")
      .select("id")
      .eq("tract_id", tractId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw selectError;
    }

    if (existingData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("census_cache")
        .update(cacheData)
        .eq("id", existingData.id);

      if (updateError) throw updateError;
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from("census_cache")
        .insert(cacheData);

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error("Error caching Census result:", error);
    return { success: false, error: error.message };
  }
}

// Get cached Census API result
export async function getCachedCensusResult(supabase: any, tractId: string) {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("census_cache")
      .select("*")
      .eq("tract_id", tractId)
      .maybeSingle();  // Use maybeSingle instead of single to avoid errors when no record is found

    if (error) throw error;
    
    // Return null if no data found
    if (!data) return { success: true, data: null };

    // Check if cache is expired
    if (now > data.expires_at) {
      return { success: true, data: null, expired: true };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error retrieving cached Census result:", error);
    return { success: false, error: error.message };
  }
}
