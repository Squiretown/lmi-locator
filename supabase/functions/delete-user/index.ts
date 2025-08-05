
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

    // Verify the requesting user is an admin via database query
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid authorization token"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if user is admin using database query with proper user context
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = userProfile?.user_type === 'admin' || user.user_metadata?.user_type === 'admin';
    
    if (profileError || !isAdmin) {
      console.error(`Access denied: User ${user.id} is not an admin`);
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

    // Clean up user references first
    const { data: cleanupResult, error: cleanupError } = await supabase.rpc("delete_user_references", {
      user_id: user_id,
    });

    if (cleanupError) {
      console.error("Cleanup Error:", cleanupError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Cleanup failed: ${cleanupError.message}` 
      }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Delete user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user_id);

    if (deleteError) {
      console.error("Auth deletion error:", deleteError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Auth deletion failed: ${deleteError.message}` 
      }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Successfully deleted user ${user_id}. Cleanup result:`, cleanupResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "User successfully deleted",
      cleanup_result: cleanupResult 
    }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message || "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
