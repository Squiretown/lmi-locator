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
const resend = new Resend(resendApiKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId, type, resend: isResend }: SendInvitationRequest = await req.json();

    if (!invitationId) {
      throw new Error('Invitation ID is required');
    }

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('client_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (invitationError || !invitation) {
      throw new Error('Invitation not found');
    }

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
      throw new Error('Professional not found');
    }

    const invitationType = type || invitation.invitation_type;
    let emailSent = invitation.email_sent;
    let smsSent = invitation.sms_sent;

    // Prepare invitation URL
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || "https://llhofjbijjxkfezidxyi.supabase.co";
    const invitationUrl = `${baseUrl}/client-registration?code=${invitation.invitation_code}`;

    // Send email invitation
    if (invitationType === 'email' || invitationType === 'both') {
      try {
        const emailResponse = await sendEmailInvitation({
          clientEmail: invitation.client_email,
          clientName: invitation.client_name || 'Client',
          professionalName: professional.company_name || professional.name || 'Professional',
          invitationCode: invitation.invitation_code,
          invitationUrl,
          templateType: invitation.template_type,
          customMessage: invitation.custom_message,
          professionalEmail: professional.email,
        });

        if (emailResponse?.id) {
          emailSent = true;
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
        const smsResponse = await sendSMSInvitation({
          clientPhone: invitation.client_phone,
          clientName: invitation.client_name || 'Client',
          professionalName: professional.company_name || professional.name || 'Professional',
          invitationCode: invitation.invitation_code,
          invitationUrl,
        });

        if (smsResponse.success) {
          smsSent = true;
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

    const { error: updateError } = await supabase
      .from('client_invitations')
      .update(updateData)
      .eq('id', invitationId);

    if (updateError) {
      throw updateError;
    }

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
    console.error("Error in send-client-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send invitation',
        success: false 
      }),
      {
        status: 500,
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
  
  try {
    // Use professional's email as from address if available, otherwise use default
    const fromEmail = params.professionalEmail || "onboarding@resend.dev";
    const fromName = params.professionalName;
    const fromAddress = `${fromName} <${fromEmail}>`;

    // Create HTML content based on template type
    const htmlContent = createEmailHtml(params);

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
    ? `<p style="margin-bottom: 20px;">${params.customMessage.replace(/\n/g, '<br>')}</p>`
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
          }
          .container {
            border: 1px solid #e1e1e1;
            border-radius: 5px;
            padding: 20px;
            background: #fff;
          }
          .header { 
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f1f1f1;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .code {
            display: inline-block;
            padding: 10px 20px;
            background-color: #f1f1f1;
            border-radius: 5px;
            font-family: monospace;
            margin: 10px 0;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>You've Been Invited</h2>
          </div>
          
          <p>Hello${params.clientName ? ' ' + params.clientName : ''},</p>
          
          <p>${params.professionalName} has invited you to join their client portal.</p>
          
          ${customMessageHtml}
          
          <p>Click the button below to create your account:</p>
          
          <div style="text-align: center;">
            <a href="${params.invitationUrl}" class="button">Accept Invitation</a>
          </div>
          
          <p>Or use this invitation code during registration:</p>
          
          <div style="text-align: center;">
            <div class="code">${params.invitationCode}</div>
          </div>
          
          <p>This invitation will expire in 7 days.</p>
          
          <div class="footer">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
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
    message: `You've been invited by ${params.professionalName}. Code: ${params.invitationCode}. Register: ${params.invitationUrl}`,
  });

  // Simulate SMS sending
  return { success: true, messageId: 'simulated-sms-id' };
}

serve(handler);