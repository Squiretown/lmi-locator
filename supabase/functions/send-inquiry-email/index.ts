import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = new Resend(resendApiKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new Error("No authorization token provided");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authorization token");
    }

    const isAdmin = user.user_metadata?.user_type === 'admin';
    
    if (!isAdmin) {
      throw new Error("Administrative privileges required");
    }

    const { inquiryId, subject, message } = await req.json();
    
    if (!inquiryId || !message) {
      throw new Error("Inquiry ID and message are required");
    }

    console.log(`Admin ${user.id} sending email for inquiry ${inquiryId}`);

    // Get the inquiry details
    const { data: inquiry, error: inquiryError } = await supabase
      .from('contact_inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();
    
    if (inquiryError || !inquiry) {
      throw new Error("Inquiry not found");
    }

    // Get admin's profile
    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const adminName = adminProfile?.name || user.email || 'Support Team';
    const finalSubject = subject || `Re: Your ${inquiry.inquiry_type.replace('_', ' ')} inquiry`;

    // Send email via Resend
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${finalSubject}</title>
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
              white-space: pre-line;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #f1f1f1;
              padding-top: 20px;
            }
            .inquiry-details {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${finalSubject}</h2>
            </div>
            
            <p>Hi ${inquiry.name},</p>
            
            <p>Thank you for contacting us. Here's our response to your inquiry:</p>
            
            <div class="message">${message}</div>
            
            <div class="inquiry-details">
              <strong>Your original inquiry:</strong><br>
              <strong>Type:</strong> ${inquiry.inquiry_type.replace('_', ' ')}<br>
              ${inquiry.location ? `<strong>Location:</strong> ${inquiry.location}<br>` : ''}
              <strong>Message:</strong><br>
              ${inquiry.message}
            </div>
            
            <p>If you have any questions, feel free to reply to this email.</p>
            
            <p>Best regards,<br>${adminName}</p>
            
            <div class="footer">
              <p>This email was sent in response to your inquiry submitted on ${new Date(inquiry.created_at).toLocaleDateString()}.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: `${adminName} <notifications@support247.solutions>`,
      to: [inquiry.email],
      subject: finalSubject,
      html: htmlContent,
      reply_to: user.email || 'support@support247.solutions',
    });

    console.log('Email sent successfully:', emailResponse);

    // Update inquiry status to in_progress if it was new
    if (inquiry.status === 'new') {
      await supabase
        .from('contact_inquiries')
        .update({ status: 'in_progress' })
        .eq('id', inquiryId);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Email sent to ${inquiry.email}`,
      emailId: emailResponse.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error sending inquiry email:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
