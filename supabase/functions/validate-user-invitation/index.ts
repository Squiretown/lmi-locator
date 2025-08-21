import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateInvitationRequest {
  token?: string;
  code?: string;
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const requestData: ValidateInvitationRequest = await req.json();
    
    if (!requestData.token && !requestData.code) {
      return new Response(
        JSON.stringify({ error: 'Either token or code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build query based on provided identifier
    let query = supabaseClient
      .from('user_invitations')
      .select('*');

    if (requestData.token) {
      query = query.eq('invite_token', requestData.token);
    } else {
      query = query.eq('invite_code', requestData.code);
    }

    const { data: invitation, error } = await query.single();

    if (error || !invitation) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invitation not found',
          code: 'NOT_FOUND'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.status === 'accepted') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'This invitation has already been accepted',
          code: 'ALREADY_ACCEPTED'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has been cancelled/revoked
    if (invitation.status === 'cancelled') {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'This invitation has been cancelled',
          code: 'CANCELLED'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Automatically mark as expired
      await supabaseClient
        .from('user_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'This invitation has expired',
          code: 'EXPIRED',
          expiredAt: invitation.expires_at
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Invitation is valid - return details for form pre-population
    const invitationDetails = {
      valid: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        userType: invitation.user_type,
        firstName: invitation.first_name,
        lastName: invitation.last_name,
        phone: invitation.phone,
        customMessage: invitation.custom_message,
        invitedBy: invitation.invited_by_name,
        expiresAt: invitation.expires_at,
        
        // Client-specific fields
        ...(invitation.user_type === 'client' && {
          propertyInterest: invitation.property_interest,
          estimatedBudget: invitation.estimated_budget,
          preferredContact: invitation.preferred_contact,
        }),
        
        // Professional-specific fields
        ...(invitation.user_type !== 'client' && {
          professionalType: invitation.professional_type,
          licenseNumber: invitation.license_number,
          licenseState: invitation.license_state,
          companyName: invitation.company_name,
          yearsExperience: invitation.years_experience,
          serviceAreas: invitation.service_areas,
          specializations: invitation.specializations,
          requiresApproval: invitation.requires_approval,
        })
      }
    };

    // Log validation attempt
    await supabaseClient.rpc('log_invitation_action', {
      p_invitation_id: invitation.id,
      p_action: 'validated',
      p_details: {
        method: requestData.token ? 'token' : 'code',
        valid: true
      },
      p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      p_user_agent: req.headers.get('user-agent'),
    });

    return new Response(
      JSON.stringify(invitationDetails),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-user-invitation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);