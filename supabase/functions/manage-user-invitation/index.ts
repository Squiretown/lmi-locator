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
    // Get authenticated user - prioritize user JWT over anonymous key  
    const userJWT = req.headers.get('X-Supabase-Authorization') || req.headers.get('Authorization');
    
    console.log('Auth check - userJWT header:', userJWT ? 'present' : 'missing');
    
    if (!userJWT) {
      console.error('No authorization header found in request');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize header - ensure Bearer prefix
    const normalizedJWT = userJWT.startsWith('Bearer ') ? userJWT : `Bearer ${userJWT}`;
    console.log('Using normalized JWT for auth');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: normalizedJWT } } }
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

      // Log cancellation (non-critical - don't fail request if logging fails)
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
          if (!resend) throw new Error('Resend not initialized');
          
          const inviteLink = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${updatedInvitation.invite_token}&type=invite`;
          
          const emailResponse = await resend.emails.send({
            from: 'LMI Check <notifications@support247.solutions>',
            to: [invitation.email],
            subject: `Reminder: Your invitation to join LMI Check`,
            html: `
              <!DOCTYPE html>
              <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0;">⏰ Invitation Reminder</h1>
                  </div>
                  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                      This is a friendly reminder about your invitation from <strong>${invitation.invited_by_name}</strong> to join <strong>LMI Check</strong> as a <strong>${invitation.user_type}</strong>.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${inviteLink}" style="background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Accept Invitation Now</a>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">
                      <strong>Your invitation code:</strong> <code style="background: white; padding: 5px 10px; border-radius: 3px; color: #1f2937;">${updatedInvitation.invite_code}</code>
                    </p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
                      This invitation expires on <strong>${new Date(updatedInvitation.expires_at).toLocaleDateString()}</strong>.
                    </p>
                  </div>
                </body>
              </html>
            `
          });
          
          console.log('✅ Reminder email sent:', emailResponse.id);
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
          last_reminder_sent: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Log resend (non-critical - don't fail request if logging fails)
      try {
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
      } catch (rpcError) {
        console.warn('Failed to log invitation resend:', rpcError);
      }

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