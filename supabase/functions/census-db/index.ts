
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
};

// Supabase client setup
const supabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") || "",
      },
    },
  });
};

// Save a search to the database
const saveSearch = async (supabase: any, address: string, result: any, userId?: string) => {
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
};

// Get search history for a user
const getSearchHistory = async (supabase: any, userId?: string, limit: number = 10) => {
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
};

// Cache Census API results
const cacheCensusResult = async (supabase: any, tractId: string, data: any, expiresInDays: number = 30) => {
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
};

// Get cached Census API result
const getCachedCensusResult = async (supabase: any, tractId: string) => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from("census_cache")
      .select("*")
      .eq("tract_id", tractId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No data found
        return { success: true, data: null };
      }
      throw error;
    }

    // Check if cache is expired
    if (now > data.expires_at) {
      return { success: true, data: null, expired: true };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Error retrieving cached Census result:", error);
    return { success: false, error: error.message };
  }
};

// Get popular searches
const getPopularSearches = async (supabase: any, limit: number = 5) => {
  try {
    const { data, error } = await supabase
      .rpc("get_popular_searches", { result_limit: limit });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error retrieving popular searches:", error);
    return { success: false, error: error.message };
  }
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client
    const supabase = supabaseClient(req);
    
    // Parse request body
    const { action, params } = await req.json();
    
    let result;
    
    switch (action) {
      case "saveSearch":
        result = await saveSearch(supabase, params.address, params.result, params.userId);
        break;
      case "getSearchHistory":
        result = await getSearchHistory(supabase, params.userId, params.limit);
        break;
      case "cacheCensusResult":
        result = await cacheCensusResult(supabase, params.tractId, params.data, params.expiresInDays);
        break;
      case "getCachedCensusResult":
        result = await getCachedCensusResult(supabase, params.tractId);
        break;
      case "getPopularSearches":
        result = await getPopularSearches(supabase, params.limit);
        break;
      default:
        result = { success: false, error: "Invalid action" };
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
