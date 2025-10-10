// supabase/functions/delete-user/index.ts
// Deploy with: supabase functions deploy delete-user

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Missing required environment variables");
    }

    // Initialize clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey);

    // Get and verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User ${user.id} requesting deletion of user ${user_id}`);

    // Verify admin privileges
    const isAdminMetadata = user.user_metadata?.user_type === 'admin';
    const { data: profileData } = await supabaseAdmin
      .from('user_profiles')
      .select('user_type')
      .eq('user_id', user.id)
      .single();
    const isAdminDB = profileData?.user_type === 'admin';

    if (!isAdminMetadata && !isAdminDB) {
      console.error(`User ${user.id} lacks admin privileges`);
      return new Response(
        JSON.stringify({ success: false, error: "Administrative privileges required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent self-deletion
    if (user_id === user.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Cannot delete your own admin account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Call database cleanup function
    console.log(`Calling delete_user_references for user ${user_id}`);
    const { data: cleanupData, error: cleanupError } = await supabaseAdmin
      .rpc('delete_user_references', { p_target_user_id: user_id });

    if (cleanupError) {
      console.error('Cleanup function error:', cleanupError);
      console.warn('Warning: cleanup had errors, continuing with deletion');
    } else {
      console.log('Cleanup completed:', cleanupData);
    }

    // Step 2: Delete from user_profiles
    console.log(`Deleting user profile for ${user_id}`);
    const { error: profileDeleteError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('user_id', user_id);

    if (profileDeleteError && !profileDeleteError.message.includes('0 rows')) {
      console.warn('Profile deletion had issues but continuing:', profileDeleteError);
    }

    // Step 3: Delete from auth.users
    console.log(`Deleting user from auth.users: ${user_id}`);
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (authDeleteError) {
      console.error('Auth deletion error:', authDeleteError);
      
      if (authDeleteError.message?.includes('User not found') || 
          authDeleteError.message?.includes('404')) {
        return new Response(
          JSON.stringify({ success: true, message: "User was already deleted" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to delete user from authentication: ${authDeleteError.message}`,
          details: authDeleteError
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully deleted user ${user_id}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "User deleted successfully",
        cleanup: cleanupData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error in delete-user function:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error occurred",
        details: err
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});