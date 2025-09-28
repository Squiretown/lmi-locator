
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user JWT from request
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new Error("No authorization token provided");
    }

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authorization token");
    }

    // Parse request body
    const { userId } = await req.json();
    const userIdToUse = userId || user.id;

    // First check if user is admin (admins have all permissions)
    const { data: isAdmin } = await supabase.rpc('user_is_admin');
    if (isAdmin) {
      // Return all possible permissions for admin
      const { data: allPermissions } = await supabase.rpc('get_all_permissions');
      return new Response(JSON.stringify(allPermissions), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user permissions
    const { data: permissions, error: permissionError } = await supabase.rpc(
      'get_user_permissions',
      { user_uuid: userIdToUse }
    );

    if (permissionError) {
      throw new Error(`Error fetching permissions: ${permissionError.message}`);
    }

    return new Response(JSON.stringify(permissions || []), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error) || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
