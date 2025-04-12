
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get the Mapbox token from environment variables
    const mapboxToken = Deno.env.get("MAPBOX_TOKEN");
    
    if (!mapboxToken) {
      console.error("MAPBOX_TOKEN is not configured in Supabase Edge Function Secrets");
      throw new Error("MAPBOX_TOKEN is not configured in Supabase Edge Function Secrets");
    }
    
    // Return the token
    return new Response(JSON.stringify({ 
      token: mapboxToken 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error retrieving Mapbox token:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to retrieve Mapbox token",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
