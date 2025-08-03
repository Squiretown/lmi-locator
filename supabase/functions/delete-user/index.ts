
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    // Check if user is admin from JWT metadata
    const userType = user.user_metadata?.user_type;
    console.log(`User ${user.id} has user_type: ${userType}`);
    
    if (userType !== 'admin') {
      console.error(`Access denied: User ${user.id} is not an admin (user_type: ${userType})`);
      throw new Error("Administrative privileges required to delete users");
    }

    // Get userId from request body
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Don't allow admin to delete themselves
    if (userId === user.id) {
      throw new Error("Cannot delete your own admin account");
    }

    console.log(`Admin user ${user.id} attempting to delete user ${userId}`);

    // Use the new modular deletion function that handles all foreign key dependencies
    const { data, error: deleteError } = await supabase.rpc('delete_user_safely_v2', {
      target_user_id: userId
    });

    if (deleteError) {
      console.error('Failed to delete user:', deleteError);
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    // Check if the deletion was successful
    if (!data?.success) {
      console.error('User deletion function returned failure:', data);
      throw new Error(data?.error || 'Failed to delete user');
    }

    console.log(`Successfully deleted user ${userId}:`, data);

    return new Response(JSON.stringify({
      success: true,
      message: data.message,
      deleted_records: data.deleted_records
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error deleting user:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
