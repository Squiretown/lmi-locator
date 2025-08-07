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

    // Check if user is admin using the correct role system
    // Check the user_profiles table for the user_type field
    const { data: userData, error: userRoleError } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('user_id', user.id)
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
    const isAdmin = userData?.user_type === 'admin';
    
    if (!isAdmin) {
      console.error(`Access denied: User ${user.id} has user_type '${userData?.user_type}', not 'admin'`);
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

    // Verify the target user exists and get their role
    const { data: targetUserProfile, error: targetUserError } = await supabase
      .from('user_profiles')
      .select('user_id, user_type')
      .eq('user_id', user_id)
      .single();

    if (targetUserError || !targetUserProfile) {
      console.error(`Target user profile not found: ${targetUserError?.message}`);
      return new Response(JSON.stringify({
        success: false,
        error: "User not found"
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Target user ${user_id} has user_type: ${targetUserProfile.user_type}`);

    // Clean up user references first using the database function
    try {
      console.log(`Calling delete_user_references for user: ${user_id}`);
      
      const { data: cleanupResult, error: cleanupError } = await supabase
        .rpc('delete_user_references', { p_user_id: user_id });

      if (cleanupError) {
        console.error(`Cleanup Error: ${JSON.stringify(cleanupError)}`);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to clean up user data: ${cleanupError.message}`
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      console.log(`Cleanup completed successfully:`, cleanupResult);

      // Now delete the user from auth.users
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user_id);

      if (deleteError) {
        console.error(`Failed to delete user from auth: ${deleteError.message}`);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to delete user from authentication: ${deleteError.message}`
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      console.log(`Successfully deleted user ${user_id} and all associated data`);
      
      return new Response(JSON.stringify({
        success: true,
        message: "User and all associated data deleted successfully",
        cleanup_summary: cleanupResult
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      console.error(`Exception during user deletion: ${err}`);
      return new Response(JSON.stringify({
        success: false,
        error: `Unexpected error during deletion: ${err instanceof Error ? err.message : 'Unknown error'}`
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

  } catch (err) {
    console.error("Global error in delete-user function:", err);
    return new Response(JSON.stringify({
      success: false,
      error: `Server error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});