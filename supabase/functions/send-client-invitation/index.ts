import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId, type, resend }: SendInvitationRequest = await req.json();

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
    const invitationUrl = `${Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '')}/client-registration?code=${invitation.invitation_code}`;

    // Send email invitation
    if (invitationType === 'email' || invitationType === 'both') {
      try {
        const emailResponse = await sendEmailInvitation({
          clientEmail: invitation.client_email,
          clientName: invitation.client_name,
          professionalName: professional.company_name || 'Professional',
          invitationCode: invitation.invitation_code,
          invitationUrl,
          templateType: invitation.template_type,
          customMessage: invitation.custom_message,
        });

        if (emailResponse.success) {
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
          clientName: invitation.client_name,
          professionalName: professional.company_name || 'Professional',
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
  clientName?: string;
  professionalName: string;
  invitationCode: string;
  invitationUrl: string;
  templateType: string;
  customMessage?: string;
}) {
  // For now, just log the email invitation
  // In production, you would integrate with an email service like Resend
  console.log('Email invitation would be sent:', {
    to: params.clientEmail,
    subject: `Invitation from ${params.professionalName}`,
    code: params.invitationCode,
    url: params.invitationUrl,
  });

  // Simulate email sending
  return { success: true, messageId: 'simulated-email-id' };
}

async function sendSMSInvitation(params: {
  clientPhone: string;
  clientName?: string;
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