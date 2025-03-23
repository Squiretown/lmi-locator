
// Use stable versions of imports with exact version numbers
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// Import a specific version without any semver ranges
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { handleApiRequest } from "./handlers.ts";

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

// Supabase client setup - using the direct createClient approach
const supabaseClient = (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: req.headers.get("Authorization") || "",
      },
    },
    // No need to specify fetch, Deno will use its native fetch
  });
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client
    const supabase = supabaseClient(req);
    
    // For GET requests, extract query parameters
    let action, params;
    if (req.method === "GET") {
      const url = new URL(req.url);
      action = url.searchParams.get("action");
      const paramsStr = url.searchParams.get("params");
      params = paramsStr ? JSON.parse(paramsStr) : {};
    } else {
      // Parse request body for POST requests
      const body = await req.json();
      action = body.action;
      params = body.params || {};
    }
    
    if (!action) {
      throw new Error("Action parameter is required");
    }
    
    // Process the request using the appropriate handler
    const result = await handleApiRequest(supabase, action, params);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
