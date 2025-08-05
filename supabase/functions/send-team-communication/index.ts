import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Resend } from "npm:resend@2.0.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize Resend client
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

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

      // Send email using Resend
      result = await resend.emails.send({
        from: `Team Communication <onboarding@resend.dev>`,
        to: [recipient],
        subject: subject || 'Team Communication',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>${subject || 'Team Communication'}</title>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                  line-height: 1.6;
                  color: #333;
                  padding: 20px;
                  max-width: 600px;
                  margin: 0 auto;
                }
                .container {
                  border: 1px solid #e1e1e1;
                  border-radius: 5px;
                  padding: 20px;
                  background: #fff;
                }
                .header { 
                  margin-bottom: 20px;
                  padding-bottom: 20px;
                  border-bottom: 1px solid #f1f1f1;
                }
                .content {
                  white-space: pre-line;
                  margin: 20px 0;
                }
                .footer {
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                  border-top: 1px solid #f1f1f1;
                  padding-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>${subject || 'Team Communication'}</h2>
                  ${team_member_name ? `<p>Hello ${team_member_name},</p>` : ''}
                </div>
                
                <div class="content">${content}</div>
                
                <div class="footer">
                  <p>This is a team communication message.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: content,
      });

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
      id: result.id || 'simulated'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error sending team communication:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});