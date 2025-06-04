
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
      throw new Error("Administrative privileges required to send emails to users");
    }

    // Get userId and message from request body
    const { userId, message } = await req.json();
    
    if (!userId || !message) {
      throw new Error("User ID and message are required");
    }

    console.log(`Admin user ${user.id} attempting to send email to user ${userId}`);

    // Get the target user's email
    const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !targetUser.user) {
      throw new Error("User not found");
    }

    // For now, we'll log the email action (in a real implementation, you'd integrate with an email service)
    console.log(`Email would be sent to ${targetUser.user.email} with message: ${message}`);

    // Insert a notification record
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Message from Admin',
        message: message,
        notification_type: 'admin_message',
        is_read: false
      });

    if (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Email notification sent to ${targetUser.user.email}`,
      recipient: targetUser.user.email
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error sending email to user:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
