import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptInvitationRequest {
  invitationCode: string;
  userEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationCode, userEmail }: AcceptInvitationRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('client_invitations')
      .select('*')
      .eq('invitation_code', invitationCode)
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invalid invitation code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation is still valid
    if (invitation.status !== 'pending' && invitation.status !== 'sent') {
      return new Response(
        JSON.stringify({ error: 'Invitation has already been used or revoked' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Invitation has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the current user (if authenticated)
    const authHeader = req.headers.get('Authorization');
    let currentUser = null;
    if (authHeader) {
      const userClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: { headers: { Authorization: authHeader } }
        }
      );
      const { data: { user } } = await userClient.auth.getUser();
      currentUser = user;
    }

    let acceptedByUserId = currentUser?.id;
    
    // If no current user but email provided, try to find existing user
    if (!currentUser && userEmail) {
      // For security, we don't expose user lookup, but we can proceed with the flow
      // The user will need to sign up/login separately
    }

    // Determine invitation type and handle accordingly
    if (invitation.invitation_target_type === 'client') {
      // Create client profile if user is authenticated
      if (acceptedByUserId) {
        const { error: clientError } = await supabaseClient
          .from('client_profiles')
          .insert({
            professional_id: invitation.professional_id,
            first_name: invitation.client_name?.split(' ')[0] || 'Unknown',
            last_name: invitation.client_name?.split(' ').slice(1).join(' ') || 'Client',
            email: invitation.client_email,
            phone: invitation.client_phone,
            status: 'active'
          });

        if (clientError) {
          console.error('Error creating client profile:', clientError);
        }
      }
    } else if (invitation.invitation_target_type === 'professional') {
      // Create professional team relationship if user is authenticated
      if (acceptedByUserId) {
        // Determine which role is which based on the invitation context
        const teamData = invitation.target_professional_role === 'realtor' ? {
          mortgage_professional_id: invitation.professional_id,
          realtor_id: acceptedByUserId,
          created_by: invitation.professional_id
        } : {
          mortgage_professional_id: acceptedByUserId,
          realtor_id: invitation.professional_id,
          created_by: invitation.professional_id
        };

        const { error: teamError } = await supabaseClient
          .from('professional_teams')
          .insert(teamData);

        if (teamError) {
          console.error('Error creating team relationship:', teamError);
        }
      }
    }

    // Update invitation status
    const { error: updateError } = await supabaseClient
      .from('client_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: acceptedByUserId
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to accept invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        invitation: {
          ...invitation,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: acceptedByUserId
        },
        message: 'Invitation accepted successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in accept-invitation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);