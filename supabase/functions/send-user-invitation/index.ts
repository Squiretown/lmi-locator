import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

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

    // Parse request body
    const requestData: SendInvitationRequest = await req.json();
    
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
      try {
        // Generate robust accept URL that works across environments
        const getAcceptUrl = () => {
          // Try multiple fallback approaches for base URL
          const origin = req.headers.get('origin');
          const referer = req.headers.get('referer');
          const siteUrl = Deno.env.get('SITE_URL');
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          
          // Use explicit SITE_URL if available
          if (siteUrl) return `${siteUrl}/invitation-acceptance/${invitation.invite_token}`;
          
          // Use origin header from request
          if (origin) return `${origin}/invitation-acceptance/${invitation.invite_token}`;
          
          // Extract from referer header
          if (referer) {
            const url = new URL(referer);
            return `${url.origin}/invitation-acceptance/${invitation.invite_token}`;
          }
          
          // Convert Supabase URL to app URL (Lovable pattern)
          if (supabaseUrl?.includes('supabase.co')) {
            const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
            if (projectId) {
              return `https://${projectId}.lovable.app/invitation-acceptance/${invitation.invite_token}`;
            }
          }
          
          // Final fallback
          return `https://llhofjbijjxkfezidxyi.lovable.app/invitation-acceptance/${invitation.invite_token}`;
        };
        
        const acceptUrl = getAcceptUrl();
        console.log('Generated acceptUrl:', acceptUrl);
        
        const emailSubject = `You've been invited to join as a ${requestData.userType}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've Been Invited!</h2>
            <p>Hi ${requestData.firstName || 'there'},</p>
            <p>${inviterName} has invited you to join as a <strong>${requestData.userType}</strong>.</p>
            ${requestData.customMessage ? `<p><em>"${requestData.customMessage}"</em></p>` : ''}
            <div style="margin: 30px 0;">
              <a href="${acceptUrl}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p>Or copy and paste this link: <br><a href="${acceptUrl}">${acceptUrl}</a></p>
            <p>This invitation will expire in 7 days.</p>
            <p>Your invitation code is: <strong>${invitation.invite_code}</strong></p>
          </div>
        `;

        await resend.emails.send({
          from: 'Invitations <noreply@resend.dev>',
          to: [requestData.email],
          subject: emailSubject,
          html: emailHtml,
        });

        emailSent = true;
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
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

    // Log the action
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