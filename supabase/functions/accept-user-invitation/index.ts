import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptInvitationRequest {
  token: string;
  email: string;
  password: string;
  userData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    // Additional fields can be added here
  };
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
    // Use service role for admin operations and auth management
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('Using service role client for admin operations');

    const requestData: AcceptInvitationRequest = await req.json();
    
    if (!requestData.token || !requestData.email || !requestData.password) {
      return new Response(
        JSON.stringify({ error: 'Token, email, and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First, validate the invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('user_invitations')
      .select('*')
      .eq('invite_token', requestData.token)
      .single();

    if (inviteError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invalid invitation token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify invitation is valid
    if (invitation.status === 'accepted') {
      return new Response(
        JSON.stringify({ error: 'This invitation has already been accepted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (invitation.status === 'cancelled') {
      return new Response(
        JSON.stringify({ error: 'This invitation has been cancelled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This invitation has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify email matches invitation
    if (invitation.email.toLowerCase() !== requestData.email.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Email does not match invitation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(requestData.email);
    
    if (existingUser.user) {
      // User exists - handle existing user acceptance
      console.log('User already exists, handling existing user acceptance');
      
      // Create user profile for existing user
      const profileData = {
        user_id: existingUser.user.id,
        user_type: invitation.user_type,
        first_name: requestData.userData?.firstName || invitation.first_name,
        last_name: requestData.userData?.lastName || invitation.last_name,
        email: requestData.email,
        phone: requestData.userData?.phone || invitation.phone,
      };

      // Check if profile already exists
      const { data: existingProfile } = await supabaseClient
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', existingUser.user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabaseClient
          .from('user_profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Failed to create user profile for existing user:', profileError);
        }
      }

      // Create type-specific profiles for existing user
      if (invitation.user_type === 'client') {
        const { data: existingClient } = await supabaseClient
          .from('client_profiles')
          .select('id')
          .eq('id', existingUser.user.id)
          .single();

        if (!existingClient) {
          const { error: clientError } = await supabaseClient
            .from('client_profiles')
            .insert({
              id: existingUser.user.id,
              professional_id: invitation.invited_by_user_id,
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              email: profileData.email,
              phone: profileData.phone,
            });

          if (clientError) {
            console.error('Failed to create client profile for existing user:', clientError);
          }
        }
      } else if (invitation.user_type === 'realtor' || invitation.user_type === 'mortgage_professional') {
        const { data: existingProfessional } = await supabaseClient
          .from('professionals')
          .select('id')
          .eq('id', existingUser.user.id)
          .single();

        if (!existingProfessional) {
          const { error: professionalError } = await supabaseClient
            .from('professionals')
            .insert({
              id: existingUser.user.id,
              user_id: existingUser.user.id,
              type: invitation.professional_type,
              name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
              company: invitation.company_name,
              license_number: invitation.license_number,
              phone: profileData.phone,
              status: invitation.requires_approval ? 'pending' : 'active',
            });

          if (professionalError) {
            console.error('Failed to create professional profile for existing user:', professionalError);
          }
        }
      }

      // Mark invitation as accepted
      await supabaseClient
        .from('user_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Log acceptance
      await supabaseClient.rpc('log_invitation_action', {
        p_invitation_id: invitation.id,
        p_action: 'accepted',
        p_details: {
          user_id: existingUser.user.id,
          email: requestData.email,
          user_type: invitation.user_type,
          existing_user: true
        },
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent'),
      });

      return new Response(
        JSON.stringify({
          success: true,
          userId: existingUser.user.id,
          userType: invitation.user_type,
          email: requestData.email,
          existingUser: true,
          message: 'Invitation accepted successfully for existing user'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new user account
    const { data: authData, error: signUpError } = await supabaseClient.auth.admin.createUser({
      email: requestData.email,
      password: requestData.password,
      email_confirm: true, // Auto-confirm since they came through invitation
      user_metadata: {
        first_name: requestData.userData?.firstName || invitation.first_name,
        last_name: requestData.userData?.lastName || invitation.last_name,
        user_type: invitation.user_type,
        invited_by: invitation.invited_by_user_id,
        invitation_id: invitation.id
      }
    });

    if (signUpError || !authData.user) {
      console.error('Failed to create user:', signUpError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create user profile
    const profileData = {
      user_id: authData.user.id,
      user_type: invitation.user_type,
      first_name: requestData.userData?.firstName || invitation.first_name,
      last_name: requestData.userData?.lastName || invitation.last_name,
      email: requestData.email,
      phone: requestData.userData?.phone || invitation.phone,
    };

    const { error: profileError } = await supabaseClient
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.error('Failed to create user profile:', profileError);
      // If profile creation fails, we should clean up the auth user
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create type-specific profiles
    if (invitation.user_type === 'client') {
      const { error: clientError } = await supabaseClient
        .from('client_profiles')
        .insert({
          id: authData.user.id,
          professional_id: invitation.invited_by_user_id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          phone: profileData.phone,
        });

      if (clientError) {
        console.error('Failed to create client profile:', clientError);
      }
    } else if (invitation.user_type === 'realtor' || invitation.user_type === 'mortgage_professional') {
      const { error: professionalError } = await supabaseClient
        .from('professionals')
        .insert({
          id: authData.user.id,
          user_id: authData.user.id,
          type: invitation.professional_type,
          name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim(),
          company: invitation.company_name,
          license_number: invitation.license_number,
          phone: profileData.phone,
          status: invitation.requires_approval ? 'pending' : 'active',
        });

      if (professionalError) {
        console.error('Failed to create professional profile:', professionalError);
      }
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabaseClient
      .from('user_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Failed to update invitation status:', updateError);
    }

    // Log acceptance
    await supabaseClient.rpc('log_invitation_action', {
      p_invitation_id: invitation.id,
      p_action: 'accepted',
      p_details: {
        user_id: authData.user.id,
        email: requestData.email,
        user_type: invitation.user_type
      },
      p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      p_user_agent: req.headers.get('user-agent'),
    });

    return new Response(
      JSON.stringify({
        success: true,
        userId: authData.user.id,
        userType: invitation.user_type,
        email: requestData.email,
        message: 'Invitation accepted successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in accept-user-invitation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);