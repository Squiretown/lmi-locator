import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
// import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-supabase-authorization, x-client-info, apikey, content-type',
};

interface SendInvitationRequest {
  email: string;
  userType: 'client' | 'realtor' | 'mortgage_professional';
  firstName?: string;
  lastName?: string;
  phone?: string;
  sendVia?: 'email' | 'sms' | 'both';
  customMessage?: string;
  
  // Client-specific fields
  propertyInterest?: 'buying' | 'selling' | 'refinancing';
  estimatedBudget?: number;
  preferredContact?: 'email' | 'phone' | 'text';
  
  // Professional-specific fields
  professionalType?: 'realtor' | 'mortgage_broker' | 'lender';
  licenseNumber?: string;
  licenseState?: string;
  companyName?: string;
  yearsExperience?: number;
  serviceAreas?: any[];
  specializations?: any[];
  requiresApproval?: boolean;
}

// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const resendApiKey = Deno.env.get("RESEND_API_KEY");

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed. Expected POST.',
        received: req.method 
      }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const requestId = crypto.randomUUID().substring(0, 8);
    console.log(`[${requestId}] Starting send-user-invitation request: ${req.method}`);
    
    // Log headers (excluding sensitive ones)
    const logHeaders = Object.fromEntries(
      [...req.headers.entries()].filter(([key]) => 
        !key.toLowerCase().includes('authorization') && 
        !key.toLowerCase().includes('apikey')
      )
    );
    console.log(`[${requestId}] Headers:`, logHeaders);

    // Get authenticated user - support both header formats
    let userJWT = req.headers.get('X-Supabase-Authorization') || req.headers.get('Authorization');
    console.log(`[${requestId}] Auth header present:`, !!userJWT);
    
    if (!userJWT) {
      console.error(`[${requestId}] No authorization header found`);
      return new Response(
        JSON.stringify({ 
          error: 'Authorization header required',
          requestId,
          received_headers: Object.keys(Object.fromEntries(req.headers.entries()))
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize Authorization header - ensure it has Bearer prefix
    if (userJWT && !userJWT.startsWith('Bearer ')) {
      userJWT = `Bearer ${userJWT}`;
      console.log(`[${requestId}] Added Bearer prefix to auth header`);
    }

    // Create Supabase client with proper auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { 
            Authorization: userJWT 
          } 
        } 
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error(`[${requestId}] Auth failed:`, userError?.message || 'No user found');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          details: userError?.message,
          requestId
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Authenticated user:`, user.id);

    // Parse and validate request body
    let requestData: SendInvitationRequest;
    try {
      const rawBody = await req.text();
      console.log(`[${requestId}] Raw body length:`, rawBody.length);
      console.log(`[${requestId}] Raw body:`, rawBody);
      
      if (!rawBody || rawBody.trim() === '') {
        throw new Error('Empty request body');
      }
      
      requestData = JSON.parse(rawBody);
      console.log(`[${requestId}] Parsed request data:`, requestData);
    } catch (parseError) {
      console.error(`[${requestId}] Request parsing failed:`, parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body',
          details: parseError instanceof Error ? parseError.message : String(parseError),
          requestId
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate required fields
    if (!requestData.email || !requestData.userType) {
      return new Response(
        JSON.stringify({ error: 'Email and user type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing pending invitations for the same email and user type
    // Use consistent duplicate checking rule: one pending/sent invitation per email+user_type+inviter
    const { data: existingInvitation } = await supabaseClient
      .from('user_invitations')
      .select('id, status')
      .eq('email', requestData.email.toLowerCase())
      .eq('user_type', requestData.userType)
      .eq('invited_by_user_id', user.id)
      .in('status', ['pending', 'sent'])
      .maybeSingle();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: 'An active invitation already exists for this email and user type' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get inviter info for personalization
    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const inviterName = profile 
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
      : user.email;

    // Create invitation record
    const invitationData = {
      email: requestData.email,
      invited_by_user_id: user.id,
      invited_by_name: inviterName,
      user_type: requestData.userType,
      first_name: requestData.firstName,
      last_name: requestData.lastName,
      phone: requestData.phone,
      send_via: requestData.sendVia || 'email',
      custom_message: requestData.customMessage,
      
      // Client-specific fields
      ...(requestData.userType === 'client' && {
        property_interest: requestData.propertyInterest,
        estimated_budget: requestData.estimatedBudget,
        preferred_contact: requestData.preferredContact || 'email',
      }),
      
      // Professional-specific fields  
      ...(requestData.userType !== 'client' && {
        professional_type: requestData.professionalType,
        license_number: requestData.licenseNumber,
        license_state: requestData.licenseState,
        company_name: requestData.companyName,
        years_experience: requestData.yearsExperience,
        service_areas: requestData.serviceAreas,
        specializations: requestData.specializations,
        requires_approval: requestData.requiresApproval || false,
      })
    };

    const { data: invitation, error: insertError } = await supabaseClient
      .from('user_invitations')
      .insert(invitationData)
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create invitation:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send email if requested
    let emailSent = false;
    let smsSent = false;

    if (requestData.sendVia === 'email' || requestData.sendVia === 'both') {
      // Email sending disabled for now - would send invitation
      console.log('Email sending disabled - would send invitation to:', requestData.email);
      emailSent = false; // Set to false until email service is properly configured
    }

    // Update invitation status and tracking
    const updateData: any = {
      status: emailSent ? 'sent' : 'pending',
      email_sent: emailSent,
      sms_sent: smsSent,
      attempts: 1,
    };

    if (emailSent || smsSent) {
      updateData.sent_at = new Date().toISOString();
    }

    await supabaseClient
      .from('user_invitations')
      .update(updateData)
      .eq('id', invitation.id);

    // Log the action (non-critical - don't fail request if logging fails)
    try {
      await supabaseClient.rpc('log_invitation_action', {
        p_invitation_id: invitation.id,
        p_action: 'sent',
        p_details: {
          email_sent: emailSent,
          sms_sent: smsSent,
          send_via: requestData.sendVia,
        },
        p_ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        p_user_agent: req.headers.get('user-agent'),
      });
    } catch (rpcError) {
      console.warn('Failed to log invitation action:', rpcError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        invitationId: invitation.id,
        inviteCode: invitation.invite_code,
        inviteToken: invitation.invite_token,
        emailSent,
        smsSent,
        message: 'Invitation created successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-user-invitation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);