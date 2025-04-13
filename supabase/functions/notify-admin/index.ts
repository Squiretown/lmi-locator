
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

serve(async (req) => {
  console.log('Notify admin function called');
  
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }
  
  try {
    // Parse request body
    const { errorId, errorType, severity } = await req.json();
    
    if (!errorId) {
      throw new Error("Error ID is required");
    }
    
    console.log(`Processing notification for error ${errorId} of type ${errorType} with severity ${severity}`);
    
    // Get error details from the database
    let errorDetails;
    if (errorType === 'lmi_search') {
      const { data, error } = await supabase
        .from('lmi_search_error_logs')
        .select('*')
        .eq('id', errorId)
        .single();
      
      if (error) {
        throw new Error(`Failed to retrieve error details: ${error.message}`);
      }
      
      errorDetails = data;
    } else if (errorType === 'edge_function') {
      const { data, error } = await supabase
        .from('edge_function_error_logs')
        .select('*')
        .eq('id', errorId)
        .single();
      
      if (error) {
        throw new Error(`Failed to retrieve error details: ${error.message}`);
      }
      
      errorDetails = data;
    } else {
      throw new Error(`Unknown error type: ${errorType}`);
    }
    
    // Get admin users to notify
    const { data: adminUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('user_id, email')
      .eq('user_type', 'admin');
    
    if (usersError) {
      throw new Error(`Failed to retrieve admin users: ${usersError.message}`);
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.warn("No admin users found to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No admin users found to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create notifications for each admin
    const notifications = adminUsers.map((admin) => ({
      user_id: admin.user_id,
      notification_type: 'system_error',
      title: `System Error (${severity}): ${errorType}`,
      message: `A ${severity} severity error occurred in ${errorType}. See error ID: ${errorId}`,
      data: { errorId, errorType, severity, details: errorDetails },
      is_read: false,
      created_at: new Date().toISOString()
    }));
    
    // Insert notifications
    const { error: notifyError } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (notifyError) {
      throw new Error(`Failed to create notifications: ${notifyError.message}`);
    }
    
    // In a real-world scenario, you might also send emails or Slack messages here
    // This would require additional configuration and dependencies
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notify-admin function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
