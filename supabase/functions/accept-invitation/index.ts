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

    let userType = 'client'; // Default for client invitations
    let profileCreated = false;

    // Determine invitation type and handle accordingly
    if (invitation.invitation_target_type === 'client') {
      userType = 'client';
      
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
        } else {
          profileCreated = true;
          console.log('Client profile created successfully');
        }
      }
    } else if (invitation.invitation_target_type === 'professional') {
      userType = invitation.target_professional_role || 'realtor';
      
      // Create professional team relationship if user is authenticated
      if (acceptedByUserId) {
        // First ensure the user has a professional profile
        let professionalId = null;
        const { data: existingProfessional } = await supabaseClient
          .from('professionals')
          .select('id')
          .eq('user_id', acceptedByUserId)
          .single();

        if (existingProfessional) {
          professionalId = existingProfessional.id;
        } else {
          // Create professional profile
          const { data: newProfessional, error: profError } = await supabaseClient
            .from('professionals')
            .insert({
              user_id: acceptedByUserId,
              professional_type: userType,
              name: invitation.client_name || 'Professional',
              company: 'Professional Services',
              license_number: '',
              status: 'active',
              email: invitation.client_email,
              phone: ''
            })
            .select('id')
            .single();

          if (profError) {
            console.error('Error creating professional profile:', profError);
          } else {
            professionalId = newProfessional.id;
            console.log('Professional profile created successfully');
          }
        }

        // Create team relationship
        if (professionalId) {
          console.log('Creating team relationship for:', {
            professionalId,
            inviterId: invitation.professional_id,
            targetRole: invitation.target_professional_role
          });

          const teamData = invitation.target_professional_role === 'realtor' ? {
            mortgage_professional_id: invitation.professional_id,
            realtor_id: professionalId,
            role: 'partner',
            status: 'active'
          } : {
            mortgage_professional_id: professionalId,
            realtor_id: invitation.professional_id,
            role: 'partner', 
            status: 'active'
          };

          // Check if relationship already exists
          const { data: existingTeam } = await supabaseClient
            .from('professional_teams')
            .select('id')
            .eq('mortgage_professional_id', teamData.mortgage_professional_id)
            .eq('realtor_id', teamData.realtor_id)
            .single();

          if (existingTeam) {
            console.log('Team relationship already exists, skipping creation');
            profileCreated = true;
          } else {
            const { error: teamError } = await supabaseClient
              .from('professional_teams')
              .insert(teamData);

            if (teamError) {
              console.error('Error creating team relationship:', teamError);
            } else {
              profileCreated = true;
              console.log('Professional team relationship created successfully');
            
              // Create notification for the inviter
              const { data: inviterProfessional } = await supabaseClient
                .from('professionals')
                .select('user_id, name')
                .eq('id', invitation.professional_id)
                .single();

              if (inviterProfessional) {
                await supabaseClient
                  .from('notifications')
                  .insert({
                    user_id: inviterProfessional.user_id,
                    notification_type: 'invitation_accepted',
                    title: 'Invitation Accepted!',
                    message: `${invitation.client_name || 'A professional'} has accepted your ${invitation.target_professional_role || 'team'} invitation.`,
                    data: {
                      invitationId: invitation.id,
                      acceptedBy: acceptedByUserId,
                      acceptedByName: invitation.client_name,
                      professionalType: invitation.target_professional_role
                    },
                    is_read: false
                  });
              }
            }
          }
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
        userType,
        profileCreated,
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