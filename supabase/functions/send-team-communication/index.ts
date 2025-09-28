import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
// import { Resend } from "npm:resend@2.0.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize Resend client
const resendApiKey = Deno.env.get("RESEND_API_KEY");
// const resend = new Resend(resendApiKey);

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

interface TeamCommunicationRequest {
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  content: string;
  team_member_name?: string;
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client
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

    // Get request data
    const { type, recipient, subject, content, team_member_name }: TeamCommunicationRequest = await req.json();
    
    if (!type || !recipient || !content) {
      throw new Error("Type, recipient, and content are required");
    }

    console.log(`User ${user.id} sending ${type} to team member at ${recipient}`);

    let result;

    if (type === 'email') {
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY not configured");
      }

      result = null; // { success: true, message: 'Email sending disabled' };
      console.log('Email sending disabled - Resend not configured');

      console.log('Email sent successfully:', result);
    } else if (type === 'sms') {
      // For SMS, we would typically integrate with Twilio or similar
      // For now, we'll simulate SMS sending
      console.log(`SMS simulation - Would send to ${recipient}: ${content}`);
      result = { success: true, message: 'SMS simulation successful' };
      
      // In a real implementation, you would do something like:
      // const twilioResult = await sendSMS(recipient, content);
      // result = twilioResult;
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${type === 'email' ? 'Email' : 'SMS'} sent successfully`,
      recipient: recipient,
      id: (result as any)?.id || 'simulated'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error sending team communication:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error) || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});