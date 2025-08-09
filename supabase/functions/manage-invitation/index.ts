import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManageInvitationRequest {
  invitationId: string;
  action: 'resend' | 'revoke';
  type?: 'email' | 'sms' | 'both';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId, action, type = 'email' }: ManageInvitationRequest = await req.json();

    // Get the current user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the invitation and verify ownership
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('client_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invitation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'revoke') {
      // Revoke the invitation
      const { error: updateError } = await supabaseClient
        .from('client_invitations')
        .update({ 
          status: 'revoked',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to revoke invitation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation revoked successfully',
          invitation: { ...invitation, status: 'revoked' }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'resend') {
      // Check if invitation is still valid for resending
      if (invitation.status === 'accepted' || invitation.status === 'revoked') {
        return new Response(
          JSON.stringify({ error: 'Cannot resend accepted or revoked invitation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Call the send-invitation function to resend
      const { data: sendResult, error: sendError } = await supabaseClient.functions.invoke('send-invitation', {
        body: { 
          invitationId,
          type 
        }
      });

      if (sendError || !sendResult?.success) {
        return new Response(
          JSON.stringify({ error: sendResult?.error || 'Failed to resend invitation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update the sent timestamp
      const updateData: any = {
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'sent'
      };

      if (sendResult.emailSent) updateData.email_sent = true;
      if (sendResult.smsSent) updateData.sms_sent = true;

      const { error: updateError } = await supabaseClient
        .from('client_invitations')
        .update(updateData)
        .eq('id', invitationId);

      if (updateError) {
        console.error('Error updating invitation after resend:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation resent successfully',
          emailSent: sendResult.emailSent,
          smsSent: sendResult.smsSent
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in manage-invitation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);