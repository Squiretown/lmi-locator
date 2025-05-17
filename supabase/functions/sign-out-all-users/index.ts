
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
    console.log("Processing sign out all users request");

    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables for Supabase connection");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user JWT from request
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.error("No authorization token provided");
      throw new Error("No authorization token provided");
    }

    // Verify the JWT and get the user
    console.log("Verifying user authentication");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid or expired token:", userError);
      throw new Error("Invalid authorization token");
    }

    console.log(`User authenticated: ${user.id}`);

    // Check if user is admin
    console.log("Checking admin privileges");
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('user_is_admin');
    
    if (adminCheckError) {
      console.error("Error checking admin status:", adminCheckError);
      throw new Error(`Admin check failed: ${adminCheckError.message}`);
    }
    
    if (!isAdmin) {
      console.error("User is not an admin");
      throw new Error("Administrative privileges required to perform this action");
    }

    console.log("Admin user verified, proceeding with sign out all users");

    // Call Supabase auth API to sign out all sessions
    const { error: signOutError } = await supabase.auth.admin.signOut('*');
    
    if (signOutError) {
      console.error("Error signing out all users:", signOutError);
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
