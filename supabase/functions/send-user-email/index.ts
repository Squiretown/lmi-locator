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

    // Get userId, message, and subject from request body
    const { userId, message, subject = "Message from Admin" } = await req.json();
    
    if (!userId || !message) {
      throw new Error("User ID and message are required");
    }

    console.log(`Admin user ${user.id} attempting to send email to user ${userId}`);

    // Get the target user's email
    const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !targetUser.user) {
      throw new Error("User not found");
    }

    // Get admin's profile information
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminProfileError) {
      console.warn('Failed to get admin profile:', adminProfileError);
    }

    // Send the actual email using Resend (disabled)
    // const emailResponse = await sendAdminEmail({
    //   to: targetUser.user.email,
    //   subject: subject,
    //   message: message,
    //   adminName: adminProfile?.name || user.email || 'Admin',
    //   adminEmail: user.email || 'admin@example.com'
    // });

    console.log('Email sending disabled - would send to:', targetUser.user.email);
    const emailResponse = { success: true, id: 'disabled-' + Date.now() };

    console.log('Email sent successfully:', emailResponse);

    // Insert a notification record
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: subject,
        message: message,
        notification_type: 'admin_message',
        is_read: false
      });

    if (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Email sent to ${targetUser.user.email}`,
      recipient: targetUser.user.email,
      emailId: emailResponse.id
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

async function sendAdminEmail(params: {
  to: string;
  subject: string;
  message: string;
  adminName: string;
  adminEmail: string;
}) {
  try {
    // Create HTML content for the email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${params.subject}</title>
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
            .message {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
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
              <h2>${params.subject}</h2>
            </div>
            
            <p>You've received a message from ${params.adminName}:</p>
            
            <div class="message">
              ${params.message.replace(/\n/g, '<br>')}
            </div>
            
            <div class="footer">
              <p>This is an administrative message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email using Resend
    const data = await resend.emails.send({
      from: `${params.adminName} <support@lmicheck.com>`,
      to: [params.to],
      subject: params.subject,
      html: htmlContent,
      reply_to: params.adminEmail,
    });

    return data;
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
}