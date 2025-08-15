
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
      throw new Error("Administrative privileges required to suspend users");
    }

    // Get userId, reason, and duration from request body
    const body = await req.json();
    console.log('Received request body:', body);
    
    const { userId, reason, duration } = body;
    
    // Detailed validation with specific error messages
    if (!userId) {
      console.error('Missing userId in request');
      throw new Error("User ID is required");
    }
    if (!reason || reason.trim() === '') {
      console.error('Missing or empty reason in request');
      throw new Error("Suspension reason is required");
    }
    if (!duration) {
      console.error('Missing duration in request');
      throw new Error("Suspension duration is required");
    }
    
    console.log('Validated suspension data:', { userId, reason, duration: duration });

    console.log(`Admin user ${user.id} attempting to suspend user ${userId} for ${duration} hours`);

    // Calculate suspension end time
    const suspensionEndTime = new Date();
    suspensionEndTime.setHours(suspensionEndTime.getHours() + parseInt(duration));

    // Update user metadata to include suspension info
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        suspended: true,
        suspension_reason: reason,
        suspension_end: suspensionEndTime.toISOString(),
        suspended_by: user.id,
        suspended_at: new Date().toISOString()
      }
    });
    
    if (updateError) {
      throw new Error(`Failed to suspend user: ${updateError.message}`);
    }

    console.log(`Successfully suspended user ${userId} until ${suspensionEndTime.toISOString()}`);

    return new Response(JSON.stringify({
      success: true,
      message: `User suspended until ${suspensionEndTime.toISOString()}`,
      suspension_end: suspensionEndTime.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error suspending user:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
