
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
      throw new Error("Administrative privileges required to reset user password");
    }

    // Get userId from request body
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log(`Admin user ${user.id} attempting to reset password for user ${userId}`);

    // Get the user's email to send reset link
    const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !targetUser.user) {
      throw new Error("User not found");
    }

    // Use the admin API to generate a password reset link
    const { data, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: targetUser.user.email!,
    });
    
    if (resetError) {
      throw new Error(`Failed to generate password reset link: ${resetError.message}`);
    }

    console.log(`Successfully generated password reset link for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Password reset link generated for ${targetUser.user.email}`,
      resetLink: data.properties.action_link // This would typically be sent via email
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error resetting user password:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
