import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-authorization',
};

interface AcceptInvitationRequest {
  token: string;
  email: string;
  password?: string; // Optional for existing users
  userData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
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
    
    if (!requestData.token || !requestData.email) {
      return new Response(
        JSON.stringify({ error: 'Token and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing authenticated user via headers
    const userJWT = req.headers.get('X-Supabase-Authorization') || req.headers.get('Authorization');
    let currentUser = null;
    
    if (userJWT) {
      // Normalize header - ensure Bearer prefix (but avoid double prefixing)
      const normalizedJWT = userJWT.startsWith('Bearer ') ? userJWT : `Bearer ${userJWT}`;
      console.log('Checking authentication with normalized JWT');
      
      // Create a client with user JWT to check if user is authenticated
      const userClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: { headers: { Authorization: normalizedJWT } }
        }
      );
      
      const { data: { user }, error: userError } = await userClient.auth.getUser();
      if (!userError && user) {
        currentUser = user;
        console.log('Authenticated user found via JWT:', user.email);
      } else if (userError) {
        console.log('JWT validation error:', userError.message);
      }
    }

    // Determine acceptance path based on authentication and password
    const isExistingUserPath = currentUser || (!requestData.password);
    console.log('Acceptance path:', isExistingUserPath ? 'existing-user' : 'new-user');

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

    if (isExistingUserPath) {
      // EXISTING USER PATH: User is authenticated or no password provided
      console.log('Processing existing user acceptance');
      
      let targetUser = currentUser;
      
      // If no current user but no password, check if user exists via user_profiles
      if (!targetUser) {
        const { data: existingProfile } = await supabaseClient
          .from('user_profiles')
          .select('user_id')
          .eq('email', requestData.email.toLowerCase())
          .maybeSingle();
        
        if (existingProfile?.user_id) {
          // Get user by ID
          const { data: userData } = await supabaseClient.auth.admin.getUserById(existingProfile.user_id);
          if (userData?.user) {
            targetUser = userData.user;
            console.log('Found existing user for email:', requestData.email);
          }
        }
        
        if (!targetUser) {
          return new Response(
            JSON.stringify({ 
              error: 'User account not found. Please provide a password to create a new account.',
              shouldCreateAccount: true 
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Verify the authenticated user's email matches invitation
      if (targetUser.email?.toLowerCase() !== requestData.email.toLowerCase()) {
        return new Response(
          JSON.stringify({ error: 'Authenticated user email does not match invitation email' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create/update user profiles for existing user
      const profileData = {
        user_id: targetUser.id,
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
        .eq('user_id', targetUser.id)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabaseClient
          .from('user_profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Failed to create user profile for existing user:', profileError);
          return new Response(
            JSON.stringify({ error: 'Failed to create user profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Create type-specific profiles for existing user
      if (invitation.user_type === 'client') {
        const { data: existingClient } = await supabaseClient
          .from('client_profiles')
          .select('id')
          .eq('id', targetUser.id)
          .maybeSingle();

        if (!existingClient) {
          const { error: clientError } = await supabaseClient
            .from('client_profiles')
            .insert({
              id: targetUser.id,
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
          .eq('id', targetUser.id)
          .maybeSingle();

        if (!existingProfessional) {
          const { error: professionalError } = await supabaseClient
            .from('professionals')
            .insert({
              id: targetUser.id,
              user_id: targetUser.id,
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

      // Log acceptance for existing user
      await supabaseClient.rpc('log_invitation_action', {
        p_invitation_id: invitation.id,
        p_action: 'accepted',
        p_details: {
          user_id: targetUser.id,
          email: requestData.email,
          user_type: invitation.user_type,
          existing_user: true,
          authenticated: !!currentUser
        },
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent'),
      });

      return new Response(
        JSON.stringify({
          success: true,
          userId: targetUser.id,
          userType: invitation.user_type,
          email: requestData.email,
          existingUser: true,
          message: 'Invitation accepted successfully for existing user'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else {
      // NEW USER PATH: Create new account with password
      console.log('Processing new user account creation');
      
      if (!requestData.password) {
        return new Response(
          JSON.stringify({ error: 'Password is required for new user accounts' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user with this email already exists via user_profiles
      const { data: existingProfile } = await supabaseClient
        .from('user_profiles')
        .select('user_id')
        .eq('email', requestData.email.toLowerCase())
        .maybeSingle();
      
      if (existingProfile?.user_id) {
        return new Response(
          JSON.stringify({ 
            error: 'An account with this email already exists. Please sign in instead.',
            shouldSignIn: true 
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      // Create user profile for new user
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
        // Clean up the auth user if profile creation fails
        await supabaseClient.auth.admin.deleteUser(authData.user.id);
        return new Response(
          JSON.stringify({ error: 'Failed to create user profile' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create type-specific profiles for new user
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
      await supabaseClient
        .from('user_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      // Log acceptance for new user
      await supabaseClient.rpc('log_invitation_action', {
        p_invitation_id: invitation.id,
        p_action: 'accepted',
        p_details: {
          user_id: authData.user.id,
          email: requestData.email,
          user_type: invitation.user_type,
          new_user: true
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
          newUser: true,
          message: 'Invitation accepted successfully and account created'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in accept-user-invitation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);