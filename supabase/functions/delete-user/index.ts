
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "User ID is required" 
      }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user JWT from request for admin verification
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: "Authorization token required"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify the requesting user is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid authorization token"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if user is admin using the NEW role system
    // First check the users table for the role field
    const { data: userData, error: userRoleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (userRoleError) {
      console.error(`Error fetching user role: ${userRoleError.message}`);
      return new Response(JSON.stringify({
        success: false,
        error: "Failed to verify admin privileges"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if user is admin using the standardized role system
    const isAdmin = userData?.role === 'admin';
    
    if (!isAdmin) {
      console.error(`Access denied: User ${user.id} has role '${userData?.role}', not 'admin'`);
      return new Response(JSON.stringify({
        success: false,
        error: "Administrative privileges required"
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Prevent admin from deleting themselves
    if (user_id === user.id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Cannot delete your own admin account"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Admin user ${user.id} attempting to delete user ${user_id}`);

    // Verify the target user exists before attempting deletion
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user_id)
      .single();

    if (targetUserError || !targetUser) {
      console.error(`Target user not found: ${targetUserError?.message}`);
      return new Response(JSON.stringify({
        success: false,
        error: "User not found"
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Target user ${user_id} has role: ${targetUser.role}`);

    // Clean up user references first - this needs to handle the new role system
    try {
      // Manual cleanup since the RPC might not exist or be updated
      const cleanupPromises = [];

      // Clean up user_profiles
      cleanupPromises.push(
        supabase.from('user_profiles').delete().eq('user_id', user_id)
      );

      // Clean up role-specific tables based on user's role
      if (targetUser.role === 'realtor') {
        cleanupPromises.push(
          supabase.from('realtors').delete().eq('user_id', user_id)
        );
      } else if (targetUser.role === 'mortgage_professional') {
        cleanupPromises.push(
          supabase.from('mortgage_professionals').delete().eq('user_id', user_id)
        );
      }

      // Add other cleanup operations as needed
      // cleanupPromises.push(
      //   supabase.from('user_preferences').delete().eq('user_id', user_id)
      // );
      // cleanupPromises.push(
      //   supabase.from('user_sessions').delete().eq('user_id