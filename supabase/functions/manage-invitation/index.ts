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

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let requestBody;
    try {
      const bodyText = await req.text();
      if (!bodyText.trim()) {
        throw new Error('Request body is empty');
      }
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { invitationId, action, type = 'email' }: ManageInvitationRequest = requestBody;
    console.log(`Starting ${action} for invitation ${invitationId}, type: ${type}`);

    // Get the current user
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader, authHeader?.substring(0, 20) + '...');
    
    if (!authHeader) {
      console.error('No authorization header provided');
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
    console.log('User authentication result:', { userId: user?.id, error: userError?.message });
    
    if (userError || !user) {
      console.error('Authentication failed:', userError?.message);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid authentication', 
          details: userError?.message || 'User not found' 
        }),
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
      console.log(`Revoking invitation ${invitationId} by user ${user.id}`);
      
      // Revoke the invitation
      const { error: updateError } = await supabaseClient
        .from('client_invitations')
        .update({ 
          status: 'revoked',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (updateError) {
        console.error(`Failed to revoke invitation ${invitationId}:`, updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to revoke invitation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Successfully revoked invitation ${invitationId}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Invitation revoked successfully',
          invitation: { ...invitation, status: 'revoked' }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'resend') {
      console.log(`Resending invitation ${invitationId} by user ${user.id}, type: ${type}`);
      
      // Check if invitation is still valid for resending
      if (invitation.status === 'accepted' || invitation.status === 'revoked') {
        console.log(`Cannot resend invitation ${invitationId} - status is ${invitation.status}`);
        return new Response(
          JSON.stringify({ error: 'Cannot resend accepted or revoked invitation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Always use send-invitation for resends with unified payload
      console.log(`Resending invitation ${invitationId} with target type: ${invitation.invitation_target_type}, channel: ${type}`);
      
      // Call send-invitation with unified payload for resend
      const { data: sendResult, error: sendError } = await supabaseClient.functions.invoke('send-invitation', {
        body: { 
          invitationId,
          target: invitation.invitation_target_type,
          channel: type,
          recipient: {
            email: invitation.client_email,
            name: invitation.client_name,
            phone: invitation.client_phone
          },
          context: {
            customMessage: invitation.custom_message,
            role: invitation.target_professional_role
          }
        }
      });

      if (sendError || !sendResult?.success) {
        console.error(`Failed to resend invitation ${invitationId}:`, sendError, sendResult);
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

      console.log(`Successfully resent invitation ${invitationId}`);
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