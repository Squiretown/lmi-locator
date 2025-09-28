
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
    const { profileId } = await req.json();

    // First check if user is admin
    const { data: isAdmin } = await supabase.rpc('user_is_admin');
    if (isAdmin) {
      return new Response(JSON.stringify({ type_name: 'admin' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If profileId is provided, use it to get user type
    if (profileId) {
      const { data: userData, error: typeError } = await supabase.rpc(
        'get_user_type_name',
        { profile_id: profileId }
      );
      
      if (typeError) {
        throw new Error(`Error fetching user type: ${typeError.message}`);
      }
      
      return new Response(JSON.stringify(userData?.[0] || { type_name: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // If no profileId provided, get current user's profile
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError || !userProfile) {
        // If no profile found, try to use metadata from auth
        if (user.user_metadata?.user_type) {
          return new Response(JSON.stringify({ type_name: user.user_metadata.user_type }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        throw new Error(`Error fetching user profile: ${profileError?.message || 'Profile not found'}`);
      }
      
      // Get user type name using profile id
      const { data: userData, error: typeError } = await supabase.rpc(
        'get_user_type_name',
        { profile_id: userProfile.id }
      );
      
      if (typeError) {
        throw new Error(`Error fetching user type: ${typeError.message}`);
      }
      
      return new Response(JSON.stringify(userData?.[0] || { type_name: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Error fetching user type:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error) || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
