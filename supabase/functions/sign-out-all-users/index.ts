
// This function allows authorized admins to sign out all users at once
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
    // Initialize Supabase client with admin privileges
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

    // Check if user is admin
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('user_is_admin');
    
    if (adminCheckError || !isAdmin) {
      throw new Error("Administrative privileges required to perform this action");
    }

    console.log("Admin user initiated sign out all users");

    // Call Supabase auth API to sign out all sessions
    const { error: signOutError } = await supabase.auth.admin.signOut('*');
    
    if (signOutError) {
      throw new Error(`Error signing out all users: ${signOutError.message}`);
    }
    
    console.log("Successfully signed out all users");
    
    return new Response(JSON.stringify({
      success: true,
      message: "All users have been signed out successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error signing out users:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
