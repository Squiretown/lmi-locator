
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

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables for Supabase connection");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get user JWT from request to verify admin status
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.error("No authorization token provided");
      throw new Error("No authorization token provided");
    }

    // Create a regular client to verify the user's token
    const supabaseAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "");

    // Verify the JWT and get the user
    console.log("Verifying user authentication");
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Invalid or expired token:", userError);
      throw new Error("Invalid authorization token");
    }

    console.log(`User authenticated: ${user.id}`);

    // Check if user is admin by checking user metadata
    const isAdmin = user.user_metadata?.user_type === 'admin';
    
    if (!isAdmin) {
      console.error("User is not an admin");
      throw new Error("Administrative privileges required to perform this action");
    }

    console.log("Admin user verified, proceeding with sign out all users");

    // Use the admin client with service role to sign out all sessions
    const { error: signOutError } = await supabaseAdmin.auth.admin.signOut('global');
    
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
      error: error instanceof Error ? error.message : String(error) || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
