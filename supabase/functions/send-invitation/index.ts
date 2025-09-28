import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-authorization"
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface UnifiedInvitationPayload {
  target: 'client' | 'professional';
  channel: 'email' | 'sms' | 'both';
  recipient: {
    email: string;
    name?: string;
    phone?: string;
  };
  context: {
    role?: string;
    customMessage?: string;
    templateType?: string;
    teamContext?: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[send-invitation] Processing request at ${new Date().toISOString()}`);

    // Validate environment
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[send-invitation] Missing Supabase configuration');
      return new Response(JSON.stringify({
        error: 'Service not configured',
        success: false
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!RESEND_API_KEY) {
      console.error('[send-invitation] Missing Resend API key');
      return new Response(JSON.stringify({
        error: 'Email service not configured',
        success: false
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get and validate auth
    const authHeader = req.headers.get('authorization') || req.headers.get('x-supabase-authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'No authorization header',
        success: false
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('[send-invitation] Auth verification failed:', authError);
      return new Response(JSON.stringify({
        error: 'Invalid token',
        success: false
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request payload
    const payload: UnifiedInvitationPayload = await req.json();
    console.log('[send-invitation] Payload received:', payload);

    // Validate payload
    if (!payload.target || !payload.channel || !payload.recipient?.email) {
      return new Response(JSON.stringify({
        error: 'Invalid payload: missing required fields',
        success: false
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get sender info
    const { data: senderProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: senderProfessional } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const senderName = senderProfessional?.name || senderProfile?.display_name || 'Professional';
    const senderCompany = senderProfessional?.company || senderProfile?.company_name || '';

    // Generate invitation data
    const invitationCode = generateInvitationCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation record
    let invitationId;
    
    if (payload.target === 'client') {
      const { data: invitation, error: insertError } = await supabase
        .from('user_invitations')
        .insert({
          email: payload.recipient.email,
          user_type: 'client',
          first_name: payload.recipient.name?.split(' ')[0],
          last_name: payload.recipient.name?.split(' ').slice(1).join(' ') || undefined,
          phone: payload.recipient.phone,
          send_via: payload.channel,
          custom_message: payload.context.customMessage,
          invite_code: invitationCode,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('[send-invitation] Failed to create invitation:', insertError);
        throw new Error('Failed to create invitation');
      }
      invitationId = invitation.id;
    } else {
      // Professional invitation
      const { data: invitation, error: insertError } = await supabase
        .from('user_invitations')
        .insert({
          email: payload.recipient.email,
          user_type: payload.context.role || 'professional',
          first_name: payload.recipient.name?.split(' ')[0],
          last_name: payload.recipient.name?.split(' ').slice(1).join(' ') || undefined,
          phone: payload.recipient.phone,
          send_via: payload.channel,
          custom_message: payload.context.customMessage,
          invite_code: invitationCode,
          expires_at: expiresAt.toISOString(),
          invited_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('[send-invitation] Failed to create professional invitation:', insertError);
        throw new Error('Failed to create invitation');
      }
      invitationId = invitation.id;
    }

    // Send email if requested
    let emailSent = false;
    if (payload.channel === 'email' || payload.channel === 'both') {
      try {
        const resend = new Resend(RESEND_API_KEY);
        
        // Get frontend URL
        const frontendUrl = req.headers.get('origin') || 'https://llhofjbijjxkfezidxyi.lovableproject.com';
        const invitationUrl = `${frontendUrl}/register?code=${invitationCode}`;

        const emailResult = await resend.emails.send({
          from: `${senderName} <notifications@support247.solutions>`,
          to: [payload.recipient.email],
          subject: `Invitation from ${senderName}`,
          html: createInvitationEmail({
            recipientName: payload.recipient.name || 'there',
            senderName,
            senderCompany,
            invitationUrl,
            invitationCode,
            customMessage: payload.context.customMessage,
            target: payload.target
          })
        });

        if (emailResult.data?.id) {
          emailSent = true;
          console.log('[send-invitation] Email sent successfully:', emailResult.data.id);
        }
      } catch (emailError) {
        console.error('[send-invitation] Email failed:', emailError);
        if (payload.channel === 'email') {
          throw new Error('Failed to send email invitation');
        }
      }
    }

    // Update invitation status
    await supabase
      .from('user_invitations')
      .update({ 
        status: emailSent ? 'sent' : 'failed',
        sent_at: emailSent ? new Date().toISOString() : null
      })
      .eq('id', invitationId);

    return new Response(JSON.stringify({
      success: true,
      message: 'Invitation sent successfully',
      invitationId,
      emailSent
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[send-invitation] Error:', error);
    
    let statusCode = 500;
    let errorMessage = error.message || 'Internal server error';
    
    if (error.message?.includes('Invalid payload')) {
      statusCode = 400;
    } else if (error.message?.includes('not configured')) {
      statusCode = 503;
    }

    return new Response(JSON.stringify({
      error: errorMessage,
      success: false
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

function generateInvitationCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function createInvitationEmail(params: {
  recipientName: string;
  senderName: string;
  senderCompany: string;
  invitationUrl: string;
  invitationCode: string;
  customMessage?: string;
  target: string;
}): string {
  const customMessageHtml = params.customMessage ? `
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
      <p style="margin: 0; color: #374151; font-style: italic;">${params.customMessage.replace(/\n/g, '<br>')}</p>
    </div>
  ` : '';

  const targetText = params.target === 'client' ? 'client portal' : 'professional network';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Invitation from ${params.senderName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border: 1px solid #e1e1e1; border-radius: 12px; padding: 30px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f1f1f1;">
            <h1 style="color: #1f2937; margin: 0; font-size: 28px;">🎉 You're Invited!</h1>
          </div>
          
          <div style="color: #374151; font-size: 16px; line-height: 1.7;">
            <p>Hello ${params.recipientName},</p>
            <p><strong>${params.senderName}</strong>${params.senderCompany ? ` from ${params.senderCompany}` : ''} has invited you to join their ${targetText}.</p>
            
            ${customMessageHtml}
            
            <p>Click the button below to accept your invitation:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${params.invitationUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
            </div>
            
            <p>Or use this invitation code: <strong>${params.invitationCode}</strong></p>
            <p style="color: #ef4444; font-weight: 500;">⏰ This invitation expires in 7 days.</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 14px; color: #6b7280; border-top: 1px solid #f1f1f1; padding-top: 20px;">
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

serve(handler);