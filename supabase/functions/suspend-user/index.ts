
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
      return new Response(JSON.stringify({ success: false, error: 'Authorization token is required' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check if user is admin
    const isAdmin = user.user_metadata?.user_type === 'admin';

    if (!isAdmin) {
      return new Response(JSON.stringify({ success: false, error: 'Administrative privileges required to suspend users' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get userId, reason, and duration from request body
    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid request body' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    console.log('Received request body:', body);

    const { userId, reason, duration } = body;

    // Detailed validation with specific error messages
    if (!userId) {
      console.error('Missing userId in request');
      return new Response(JSON.stringify({ success: false, error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!reason || reason.trim() === '') {
      console.error('Missing or empty reason in request');
      return new Response(JSON.stringify({ success: false, error: 'Suspension reason is required' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!duration) {
      console.error('Missing duration in request');
      return new Response(JSON.stringify({ success: false, error: 'Suspension duration is required' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fetch target user to check role
    const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    if (getUserError || !targetUser.user) {
      return new Response(JSON.stringify({ success: false, error: 'Target user not found' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const targetRole = targetUser.user.user_metadata?.user_type;
    if (targetUser.user.id === user.id) {
      return new Response(JSON.stringify({ success: false, error: 'You cannot suspend your own account' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (targetRole === 'admin') {
      return new Response(JSON.stringify({ success: false, error: 'Cannot suspend administrator accounts' }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log('Validated suspension data:', { userId, reason, duration });
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
      error: error instanceof Error ? error.message : String(error) || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
