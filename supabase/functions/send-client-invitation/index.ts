
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationRequest {
  invitationId: string;
  type?: 'email' | 'sms' | 'both';
  resend?: boolean;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Initialize Resend client
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Send Client Invitation Function Started ===');
    
    const { invitationId, type, resend: isResend }: SendInvitationRequest = await req.json();

    console.log('Processing invitation request:', { invitationId, type, isResend });

    if (!invitationId) {
      console.error('Missing invitation ID in request');
      throw new Error('Invitation ID is required');
    }

    // Check if Resend is configured for email sending
    if ((type === 'email' || type === 'both' || !type) && !resendApiKey) {
      console.error('RESEND_API_KEY is not configured but email sending was requested');
      throw new Error('Email service is not configured. Please contact system administrator.');
    }

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('client_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      console.error('Invitation not found:', invitationError);
      throw new Error('Invitation not found');
    }

    console.log('Found invitation:', invitation);

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Get the professional's information for the invitation
    const { data: professional, error: professionalError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', invitation.professional_id)
      .single();

    if (professionalError || !professional) {
      console.error('Professional not found:', professionalError);
      throw new Error('Professional not found');
    }

    console.log('Found professional:', professional.name || professional.company_name);

    const invitationType = type || invitation.invitation_type;
    let emailSent = invitation.email_sent;
    let smsSent = invitation.sms_sent;

    // Prepare invitation URL - use the correct base URL
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || "https://llhofjbijjxkfezidxyi.supabase.co";
    const frontendUrl = baseUrl.replace('supabase.co', 'lovableproject.com'); // Adjust for frontend URL
    const invitationUrl = `${frontendUrl}/client-registration?code=${invitation.invitation_code}`;

    console.log('Invitation URL:', invitationUrl);

    // Send email invitation
    if (invitationType === 'email' || invitationType === 'both') {
      try {
        console.log('Sending email to:', invitation.client_email);
        const emailResponse = await sendEmailInvitation({
          clientEmail: invitation.client_email,
          clientName: invitation.client_name || 'Client',
          professionalName: professional.company_name || professional.name || 'Professional',
          invitationCode: invitation.invitation_code,
          invitationUrl,
          templateType: invitation.template_type || 'standard',
          customMessage: invitation.custom_message,
          professionalEmail: professional.email,
        });

        if (emailResponse?.data?.id) {
          emailSent = true;
          console.log('Email sent successfully:', emailResponse.data.id);
        }
      } catch (error) {
        console.error('Email sending failed:', error);
        // Continue with SMS if both were requested
        if (invitationType === 'email') {
          throw error;
        }
      }
    }

    // Send SMS invitation
    if (invitationType === 'sms' || invitationType === 'both') {
      if (!invitation.client_phone) {
        throw new Error('Phone number is required for SMS invitations');
      }

      try {
        console.log('Sending SMS to:', invitation.client_phone);
        const smsResponse = await sendSMSInvitation({
          clientPhone: invitation.client_phone,
          clientName: invitation.client_name || 'Client',
          professionalName: professional.company_name || professional.name || 'Professional',
          invitationCode: invitation.invitation_code,
          invitationUrl,
        });

        if (smsResponse.success) {
          smsSent = true;
          console.log('SMS sent successfully');
        }
      } catch (error) {
        console.error('SMS sending failed:', error);
        // If email already sent, don't fail completely
        if (invitationType === 'sms' || !emailSent) {
          throw error;
        }
      }
    }

    // Update invitation status
    const updateData: any = {
      email_sent: emailSent,
      sms_sent: smsSent,
      sent_at: new Date().toISOString(),
      status: 'sent',
      updated_at: new Date().toISOString(),
    };

    console.log('Updating invitation with:', updateData);

    const { error: updateError } = await supabase
      .from('client_invitations')
      .update(updateData)
      .eq('id', invitationId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('Invitation updated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
        emailSent,
        smsSent,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("=== Error in send-client-invitation function ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    
    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to send invitation';
    
    if (error.message?.includes('not configured')) {
      statusCode = 503; // Service Unavailable
    } else if (error.message?.includes('not found')) {
      statusCode = 404;
    } else if (error.message?.includes('expired')) {
      statusCode = 410; // Gone
    } else if (error.message?.includes('required')) {
      statusCode = 400; // Bad Request
    }
    
    console.log(`Returning error response with status ${statusCode}: ${errorMessage}`);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
        statusCode
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendEmailInvitation(params: {
  clientEmail: string;
  clientName: string;
  professionalName: string;
  invitationCode: string;
  invitationUrl: string;
  templateType: string;
  customMessage?: string;
  professionalEmail?: string;
}) {
  console.log('Sending email invitation to:', params.clientEmail);
  
  if (!resend || !resendApiKey) {
    console.error('Resend client not initialized - RESEND_API_KEY missing');
    throw new Error('Email service is not configured');
  }
  
  try {
    // Use professional's email as from address if available and verified, otherwise use default
    const fromEmail = "onboarding@resend.dev"; // Use verified domain
    const fromName = params.professionalName;
    const fromAddress = `${fromName} <${fromEmail}>`;

    // Create HTML content based on template type
    const htmlContent = createEmailHtml(params);

    console.log('Sending email with Resend:', {
      from: fromAddress,
      to: params.clientEmail,
      subject: `Invitation from ${params.professionalName}`
    });

    // Send the email using Resend
    const data = await resend.emails.send({
      from: fromAddress,
      to: [params.clientEmail],
      subject: `Invitation from ${params.professionalName}`,
      html: htmlContent,
    });

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
}

function createEmailHtml(params: {
  clientName: string;
  professionalName: string;
  invitationCode: string;
  invitationUrl: string;
  customMessage?: string;
  templateType: string;
}) {
  // Apply the custom message if provided
  const customMessageHtml = params.customMessage 
    ? `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
         <p style="margin: 0; color: #374151; font-style: italic;">${params.customMessage.replace(/\n/g, '<br>')}</p>
       </div>`
    : '';
  
  // Create a nice looking HTML email
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Invitation from ${params.professionalName}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6;
            color: #333;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          .container {
            border: 1px solid #e1e1e1;
            border-radius: 12px;
            padding: 30px;
            background: #fff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .header { 
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f1f1f1;
          }
          .header h1 {
            color: #1f2937;
            margin: 0;
            font-size: 28px;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s ease;
          }
          .button:hover {
            transform: translateY(-1px);
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #6b7280;
            border-top: 1px solid #f1f1f1;
            padding-top: 20px;
          }
          .code {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
            border: 2px dashed #9ca3af;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            margin: 15px 0;
            font-size: 18px;
            font-weight: bold;
            color: #374151;
          }
          .content {
            color: #374151;
            font-size: 16px;
            line-height: 1.7;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
          </div>
          
          <div class="content">
            <p>Hello${params.clientName ? ' ' + params.clientName : ''},</p>
            
            <p><strong>${params.professionalName}</strong> has invited you to join their client portal where you can access exclusive services and resources.</p>
            
            ${customMessageHtml}
            
            <p>Click the button below to accept your invitation and create your account:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.invitationUrl}" class="button">✨ Accept Invitation</a>
            </div>
            
            <p>Or use this invitation code during registration:</p>
            
            <div style="text-align: center;">
              <div class="code">${params.invitationCode}</div>
            </div>
            
            <p style="color: #ef4444; font-weight: 500;">⏰ This invitation will expire in 7 days.</p>
          </div>
          
          <div class="footer">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p style="margin-top: 10px;">
              <strong>Powered by LMI Client Portal</strong><br>
              Professional client management solutions
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

async function sendSMSInvitation(params: {
  clientPhone: string;
  clientName: string;
  professionalName: string;
  invitationCode: string;
  invitationUrl: string;
}) {
  // For now, just log the SMS invitation
  // In production, you would integrate with an SMS service like Twilio
  console.log('SMS invitation would be sent:', {
    to: params.clientPhone,
    message: `Hi ${params.clientName}! ${params.professionalName} has invited you to their client portal. Code: ${params.invitationCode}. Register: ${params.invitationUrl}`,
  });

  // Simulate SMS sending success
  return { success: true, messageId: 'simulated-sms-id-' + Date.now() };
}

serve(handler);
