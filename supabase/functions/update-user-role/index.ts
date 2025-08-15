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

    // Check if user is admin
    const isAdmin = user.user_metadata?.user_type === 'admin';
    
    if (!isAdmin) {
      throw new Error("Administrative privileges required to update user role");
    }

    // Get userId and newRole from request body (matching frontend payload)
    const { userId, newRole } = await req.json();
    
    if (!userId || !newRole) {
      throw new Error("User ID and new role are required");
    }

    // Validate role - support UI role names
    const validRoles = ['admin', 'mortgage_professional', 'realtor', 'user'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}. Valid roles are: ${validRoles.join(', ')}`);
    }

    console.log(`Admin user ${user.id} attempting to update role for user ${userId} to ${newRole}`);

    // Update the user's role in metadata using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { user_type: newRole }
    });
    
    if (updateError) {
      throw new Error(`Failed to update user role: ${updateError.message}`);
    }

    console.log(`Successfully updated role for user ${userId} to ${newRole}`);

    return new Response(JSON.stringify({
      success: true,
      message: `User role updated to ${newRole} successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error updating user role:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});