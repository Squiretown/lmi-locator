// supabase/functions/manage-user-invitation/index.ts
// FIXED VERSION - Correct invitation URL and reply-to pattern for resend

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-supabase-authorization, x-client-info, apikey, content-type',
};

interface ManageInvitationRequest {
  invitationId: string;
  action: 'resend' | 'cancel';
  sendVia?: 'email' | 'sms' | 'both';
  customMessage?: string;
}

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get JWT from authorization header
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      console.error('No authorization header found in request');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JWT token
    const jwt = authHeader.replace('Bearer ', '');

    // Create admin client to verify JWT
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the JWT and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    if (userError || !user) {
      console.error('JWT verification failed:', userError?.message || 'No user found');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client for database operations with user's auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${jwt}` }
        }
      }
    );

    // Parse request body
    const requestData: ManageInvitationRequest = await req.json();

    if (!requestData.invitationId || !requestData.action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: invitationId, action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify invitation exists and belongs to the user
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('user_invitations')
      .select('*')
      .eq('id', requestData.invitationId)
      .eq('invited_by_user_id', user.id)
      .single();

    if (inviteError || !invitation) {
      console.error('Invitation not found or access denied:', inviteError?.message);
      return new Response(
        JSON.stringify({ error: 'Invitation not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle cancel action
    if (requestData.action === 'cancel') {
      const { error: updateError } = await supabaseClient
        .from('user_invitations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Failed to cancel invitation:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to cancel invitation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log cancellation
      try {
        await supabaseClient.rpc('log_invitation_action', {
          p_invitation_id: invitation.id,
          p_action: 'cancelled',
          p_details: { cancelled_by: user.id },
          p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          p_user_agent: req.headers.get('user-agent'),
        });
      } catch (rpcError) {
        console.warn('Failed to log invitation cancellation:', rpcError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation cancelled successfully' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle resend action
    if (requestData.action === 'resend') {
      if (invitation.status === 'accepted') {
        return new Response(
          JSON.stringify({ error: 'Cannot resend an accepted invitation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (invitation.status === 'cancelled') {
        return new Response(
          JSON.stringify({ error: 'Cannot resend a cancelled invitation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const sendVia = requestData.sendVia || invitation.send_via || 'email';

      // Generate new token and extend expiration
      const newToken = `${crypto.randomUUID()}-${Date.now()}`;
      const newExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const { data: updatedInvitation, error: updateError } = await supabaseClient
        .from('user_invitations')
        .update({
          invite_token: newToken,
          expires_at: newExpiration.toISOString(),
          attempts: (invitation.attempts || 0) + 1,
          send_via: sendVia,
          status: 'pending'
        })
        .eq('id', invitation.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update invitation for resend:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update invitation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get inviter's email for reply-to
      const { data: inviterProfile } = await supabaseClient
        .from('user_profiles')
        .select('email')
        .eq('user_id', user.id)
        .single();

      const { data: inviterProfessional } = await supabaseClient
        .from('professionals')
        .select('email')
        .eq('user_id', user.id)
        .single();

      const inviterEmail = inviterProfessional?.email || inviterProfile?.email || user.email;

      // Send email if requested
      let emailSent = false;
      let smsSent = false;

      if (sendVia === 'email' || sendVia === 'both') {
        try {
          if (!resend) throw new Error('Resend not initialized');
          
          // FIXED: Use APP_URL instead of SUPABASE_URL
          const appUrl = Deno.env.get('APP_URL') || 'https://lmicheck.com';
          const inviteLink = `${appUrl}/accept-invitation/${updatedInvitation.invite_token}`;
          
          const emailResponse = await resend.emails.send({
            from: 'LMI Check <notifications@support247.solutions>',
            reply_to: inviterEmail, // ADDED: Replies go to inviter
            to: [invitation.email],
            subject: `Reminder: Your invitation to join LMI Check`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ⏰ Invitation Reminder
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                This is a friendly reminder about your invitation from <strong>${invitation.invited_by_name}</strong> to join LMI Check as a <strong>${invitation.user_type}</strong>.
              </p>
              
              <p style="margin: 0 0 32px; color: #6b7280; font-size: 15px; line-height: 1.6;">
                LMI Check helps you find properties in Low-to-Moderate Income areas that qualify for special mortgage assistance programs.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <table role="presentation" style="margin: 0 auto;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px; padding: 0;">
                      <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                        Accept Invitation Now
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Invite Code -->
              <div style="text-align: center; margin: 32px 0; padding: 24px; background-color: #f9fafb; border-radius: 8px; border: 1px dashed #d1d5db;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Or enter this code manually
                </p>
                <p style="margin: 0; color: #111827; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">
                  ${updatedInvitation.invite_code}
                </p>
              </div>

              <p style="margin: 0; color: #9ca3af; font-size: 14px; text-align: center;">
                This invitation expires on ${newExpiration.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.5;">
                Questions? Reply to this email to reach ${invitation.invited_by_name} directly.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} LMI Check. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
            `,
            text: `
Invitation Reminder - LMI Check

This is a friendly reminder about your invitation from ${invitation.invited_by_name} to join LMI Check as a ${invitation.user_type}.

Accept your invitation: ${inviteLink}

Or enter this code: ${updatedInvitation.invite_code}

This invitation expires on ${newExpiration.toLocaleDateString()}.

Questions? Reply to this email to reach ${invitation.invited_by_name} directly.
            `
          });
          
          console.log('✅ Reminder email sent:', emailResponse.data?.id);
          emailSent = true;
        } catch (emailError) {
          console.error('❌ Failed to send reminder email:', emailError);
          emailSent = false;
        }
      }

      // Update with send results
      await supabaseClient
        .from('user_invitations')
        .update({
          status: emailSent ? 'sent' : 'pending',
          email_sent: emailSent,
          sms_sent: smsSent,
          sent_at: emailSent ? new Date().toISOString() : invitation.sent_at,
          last_reminder_sent: new Date().toISOString(),
          metadata: {
            ...(invitation.metadata || {}),
            last_resend_by: user.id,
            last_resend_at: new Date().toISOString(),
            reply_to: inviterEmail,
          }
        })
        .eq('id', invitation.id);

      // Log resend
      try {
        await supabaseClient.rpc('log_invitation_action', {
          p_invitation_id: invitation.id,
          p_action: 'resent',
          p_details: {
            email_sent: emailSent,
            sms_sent: smsSent,
            send_via: sendVia,
            attempt: (invitation.attempts || 0) + 1
          },
          p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          p_user_agent: req.headers.get('user-agent'),
        });
      } catch (rpcError) {
        console.warn('Failed to log invitation resend:', rpcError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent,
          smsSent,
          newExpiration: newExpiration.toISOString(),
          message: emailSent 
            ? 'Invitation reminder sent successfully' 
            : 'Invitation updated but email failed to send'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "resend" or "cancel".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in manage-user-invitation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
