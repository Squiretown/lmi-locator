import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

// Role normalization utility
const LEGACY_ROLE_MAPPING = {
  'mortgage': 'mortgage_professional',
  'mortgage_broker': 'mortgage_professional',
  'realtor': 'realtor',
  'admin': 'admin',
  'client': 'client'
};

function normalizeRole(role) {
  if (!role) return 'client';
  const lowercaseRole = role.toLowerCase();
  if (lowercaseRole in LEGACY_ROLE_MAPPING) {
    return LEGACY_ROLE_MAPPING[lowercaseRole];
  }
  return lowercaseRole;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Simple timeout wrapper with logging
async function withTimeout(promise, ms, label) {
  const started = Date.now();
  return await Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms${label ? ` during ${label}` : ''}`)), ms))
  ]).finally(() => {
    if (label) console.log(`[send-client-invitation] ${label} took ${Date.now() - started}ms`);
  });
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const handler = async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const start = Date.now();
    console.log(`[send-client-invitation] Starting request processing at ${new Date().toISOString()}`);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[send-client-invitation] Missing Supabase configuration');
      return new Response(JSON.stringify({
        error: 'Service not configured',
        success: false
      }), {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Improved request body parsing with detailed logging
    let requestBody;
    let invitationId;
    let type;
    let isResend;

    try {
      const rawBody = await req.text();
      console.log(`[send-client-invitation] Raw request body length: ${rawBody.length}`);
      console.log(`[send-client-invitation] Raw request body: ${rawBody}`);

      if (!rawBody || rawBody.trim() === '') {
        throw new Error('Empty request body');
      }

      requestBody = JSON.parse(rawBody);
      console.log(`[send-client-invitation] Parsed request body:`, requestBody);

      ({ invitationId, type, resend: isResend } = requestBody);

      if (!invitationId) {
        throw new Error('Missing invitationId in request body');
      }

      console.log(`[send-client-invitation] Processing invitation: ${invitationId}, type: ${type || 'default'}`);
    } catch (parseError) {
      console.error('[send-client-invitation] Request body parsing failed:', parseError.message);
      return new Response(JSON.stringify({
        error: 'Invalid request body',
        details: parseError.message,
        success: false
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    if ((type === 'email' || type === 'both' || !type) && !resendApiKey) {
      throw new Error('Email service is not configured. Please contact system administrator.');
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

    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Get professional info
    let professional;
    const { data: prof } = await supabase
      .from('professionals')
      .select('id, user_id, name, company, phone, status, professional_type, email')
      .eq('id', invitation.professional_id)
      .maybeSingle();

    if (prof) {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', prof.user_id)
        .single();

      professional = userProfile ? {
        ...prof,
        ...userProfile,
        company_name: prof.company || userProfile.company_name
      } : prof;
    } else {
      const { data: userProf } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', invitation.professional_id)
        .single();
      professional = userProf;
    }

    if (!professional) throw new Error('Professional profile not found');

    // Validate role if specified
    if (invitation.target_professional_role) {
      const normalizedInvitationRole = normalizeRole(invitation.target_professional_role);
      const normalizedProfessionalType = normalizeRole(professional.professional_type);

      if (normalizedInvitationRole !== normalizedProfessionalType) {
        throw new Error(`Professional role mismatch. Expected ${normalizedInvitationRole}, found ${normalizedProfessionalType}`);
      }
    }

    const invitationType = type || invitation.invitation_type;
    let emailSent = invitation.email_sent;
    let smsSent = invitation.sms_sent;

    // Prepare invitation URL
    const configuredFrontend = Deno.env.get("FRONTEND_URL");
    const originHeader = req.headers.get("origin") || '';
    const fallbackFrontend = (Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || "https://llhofjbijjxkfezidxyi.supabase.co").replace('supabase.co', 'lovableproject.com');
    const frontendBase = configuredFrontend || originHeader || fallbackFrontend;
    const invitationUrl = `${frontendBase}/client-registration?code=${invitation.invitation_code}`;

    // Send communications (run in parallel when 'both')
    let emailPromise = null;
    let smsPromise = null;

    if (invitationType === 'email' || invitationType === 'both') {
      emailPromise = withTimeout(sendEmailInvitation({
        clientEmail: invitation.client_email,
        clientName: invitation.client_name || 'Client',
        professionalName: professional.company_name || professional.name || 'Professional',
        invitationCode: invitation.invitation_code,
        invitationUrl,
        templateType: invitation.template_type || 'standard',
        customMessage: invitation.custom_message,
        professionalEmail: professional.email
      }), 12000, 'sendEmail');
    }

    if (invitationType === 'sms' || invitationType === 'both') {
      if (!invitation.client_phone) throw new Error('Phone number is required for SMS invitations');
      smsPromise = withTimeout(sendSMSInvitation({
        clientPhone: invitation.client_phone,
        clientName: invitation.client_name || 'Client',
        professionalName: professional.company_name || professional.name || 'Professional',
        invitationCode: invitation.invitation_code,
        invitationUrl
      }), 8000, 'sendSMS');
    }

    const results = await Promise.allSettled([
      emailPromise ?? Promise.resolve(null),
      smsPromise ?? Promise.resolve(null)
    ]);

    const emailResult = results[0];
    const smsResult = results[1];

    if (emailPromise) {
      if (emailResult.status === 'fulfilled' && emailResult.value?.data?.id) {
        emailSent = true;
      } else if (invitationType === 'email' && emailResult.status === 'rejected') {
        throw emailResult.reason;
      }
    }

    if (smsPromise) {
      if (smsResult.status === 'fulfilled' && smsResult.value?.success) {
        smsSent = true;
      } else if ((invitationType === 'sms' || (invitationType === 'both' && !emailSent)) && smsResult.status === 'rejected') {
        throw smsResult.reason;
      }
    }

    // Update invitation status
    const updateData = {
      email_sent: emailSent,
      sms_sent: smsSent,
      sent_at: new Date().toISOString(),
      status: 'sent',
      updated_at: new Date().toISOString()
    };

    await supabase
      .from('client_invitations')
      .update(updateData)
      .eq('id', invitationId);

    // Only return success if at least one was sent
    const wasActuallySent = emailSent || smsSent;

    return new Response(JSON.stringify({
      success: wasActuallySent,
      message: wasActuallySent 
        ? (emailSent && smsSent 
          ? 'Invitation sent via email and SMS successfully' 
          : emailSent 
            ? 'Invitation sent via email successfully' 
            : 'Invitation sent via SMS successfully')
        : 'Failed to send invitation',
      emailSent,
      smsSent
    }), {
      status: wasActuallySent ? 200 : 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });

  } catch (error) {
    let statusCode = 500;
    let errorMessage = error.message || 'Failed to send invitation';

    if (error.message?.includes('not configured')) {
      statusCode = 503;
    } else if (error.message?.includes('not found')) {
      statusCode = 404;
    } else if (error.message?.includes('expired')) {
      statusCode = 410;
    } else if (error.message?.includes('required')) {
      statusCode = 400;
    }

    return new Response(JSON.stringify({
      error: errorMessage,
      success: false,
      statusCode
    }), {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
};

async function sendEmailInvitation(params) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error('Email service is not configured');
  }

  try {
    const resendLocal = new Resend(apiKey);
    const fromEmail = "support@lmicheck.com";
    const fromName = params.professionalName;
    const fromAddress = `${fromName} <${fromEmail}>`;

    const htmlContent = createEmailHtml(params);

    const data = await resendLocal.emails.send({
      from: fromAddress,
      to: [params.clientEmail],
      subject: `Invitation from ${params.professionalName}`,
      html: htmlContent
    });

    return data;
  } catch (error) {
    throw error;
  }
}

function createEmailHtml(params) {
  const customMessageHtml = params.customMessage ? `<div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
         <p style="margin: 0; color: #374151; font-style: italic;">${params.customMessage.replace(/\n/g, '<br>')}</p>
       </div>` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Invitation from ${params.professionalName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #ffffff;}
          .container { border: 1px solid #e1e1e1; border-radius: 12px; padding: 30px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);}
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f1f1f1;}
          .header h1 { color: #1f2937; margin: 0; font-size: 28px;}
          .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; font-size: 16px;}
          .button:hover { transform: translateY(-1px);}
          .footer { margin-top: 30px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #f1f1f1; padding-top: 20px;}
          .code { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f3f4f6, #e5e7eb); border: 2px dashed #9ca3af; border-radius: 8px; font-family: 'Monaco', 'Menlo', monospace; margin: 15px 0; font-size: 18px; font-weight: bold; color: #374151;}
          .content { color: #374151; font-size: 16px; line-height: 1.7;}
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

async function sendSMSInvitation(params) {
  // TODO: Integrate production SMS service here
  return {
    success: true,
    messageId: 'simulated-sms-id-' + Date.now()
  };
}

serve(handler);