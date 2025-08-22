import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-supabase-authorization, x-client-info, apikey, content-type',
};

interface ManageInvitationRequest {
  invitationId: string;
  action: 'resend' | 'cancel';
  sendVia?: 'email' | 'sms' | 'both';
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    // Get authenticated user - prioritize user JWT over anonymous key
    const authHeader = req.headers.get('X-Supabase-Authorization') || req.headers.get('Authorization');
    const userJWT = req.headers.get('X-Supabase-Authorization');
    const anonKey = req.headers.get('Authorization');
    
    console.log('Auth check - Authorization:', anonKey ? 'present' : 'missing');
    console.log('Auth check - X-Supabase-Authorization:', userJWT ? 'present' : 'missing');
    console.log('Using header:', userJWT ? 'X-Supabase-Authorization (user JWT)' : 'Authorization (anon key)');
    
    if (!authHeader) {
      console.error('No authorization header found in request');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth.getUser failed:', userError?.message || 'No user found');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: ManageInvitationRequest = await req.json();
    
    if (!requestData.invitationId || !requestData.action) {
      return new Response(
        JSON.stringify({ error: 'Invitation ID and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the invitation and verify ownership
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('user_invitations')
      .select('*')
      .eq('id', requestData.invitationId)
      .eq('invited_by_user_id', user.id) // Ensure user owns this invitation
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invitation not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (requestData.action === 'cancel') {
      // Cancel/revoke invitation
      if (invitation.status === 'accepted') {
        return new Response(
          JSON.stringify({ error: 'Cannot cancel an accepted invitation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabaseClient
        .from('user_invitations')
        .update({ 
          status: 'cancelled',
          metadata: { 
            ...invitation.metadata, 
            cancelled_at: new Date().toISOString(),
            cancelled_by: user.id 
          }
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
      await supabaseClient.rpc('log_invitation_action', {
        p_invitation_id: invitation.id,
        p_action: 'cancelled',
        p_details: { cancelled_by: user.id },
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent'),
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation cancelled successfully' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (requestData.action === 'resend') {
      // Resend invitation
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
      const { data: updatedInvitation, error: updateError } = await supabaseClient
        .from('user_invitations')
        .update({
          invite_token: `${crypto.randomUUID()}-${Date.now()}`, // New token
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          attempts: invitation.attempts + 1,
          send_via: sendVia,
          status: 'pending' // Reset to pending
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

      // Send email if requested
      let emailSent = false;
      let smsSent = false;

      if (sendVia === 'email' || sendVia === 'both') {
        try {
          const acceptUrl = `${req.headers.get('origin') || 'https://llhofjbijjxkfezidxyi.lovable.app'}/invitation-acceptance/${updatedInvitation.invite_token}`;
          
          const emailSubject = `Reminder: You've been invited to join as a ${invitation.user_type}`;
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Invitation Reminder</h2>
              <p>Hi ${invitation.first_name || 'there'},</p>
              <p>This is a reminder that ${invitation.invited_by_name} has invited you to join as a <strong>${invitation.user_type}</strong>.</p>
              ${invitation.custom_message ? `<p><em>"${invitation.custom_message}"</em></p>` : ''}
              <div style="margin: 30px 0;">
                <a href="${acceptUrl}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              <p>Or copy and paste this link: <br><a href="${acceptUrl}">${acceptUrl}</a></p>
              <p>This invitation will expire in 7 days.</p>
              <p>Your invitation code is: <strong>${updatedInvitation.invite_code}</strong></p>
            </div>
          `;

          await resend.emails.send({
            from: 'Invitations <noreply@resend.dev>',
            to: [invitation.email],
            subject: emailSubject,
            html: emailHtml,
          });

          emailSent = true;
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
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
          last_reminder_sent: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Log resend
      await supabaseClient.rpc('log_invitation_action', {
        p_invitation_id: invitation.id,
        p_action: 'resent',
        p_details: {
          email_sent: emailSent,
          sms_sent: smsSent,
          send_via: sendVia,
          attempt: invitation.attempts + 1
        },
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent'),
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent,
          smsSent,
          message: 'Invitation resent successfully' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
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