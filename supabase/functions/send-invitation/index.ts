import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  type: 'client' | 'professional' | 'realtor';
  inviterName?: string;
  companyName?: string;
  customMessage?: string;
  clientName?: string;
  clientPhone?: string;
  professionalType?: string;
  role?: string;
}

// Initialize Resend with validation
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const isDevelopment = Deno.env.get("ENVIRONMENT") === "development" || !resendApiKey;

let resend: any = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Invitation request received");
    
    // Get request data
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Authentication error:", userError);
      throw new Error("Authentication failed");
    }

    console.log("User authenticated:", user.email);

    // Parse request body
    const body: InvitationRequest = await req.json();
    console.log("Request body:", body);

    // Validate required fields
    if (!body.email || !body.type) {
      throw new Error("Email and type are required fields");
    }

    if (!isValidEmail(body.email)) {
      throw new Error("Invalid email format");
    }

    // Get inviter's professional profile with fallback
    const { data: professional, error: profError } = await supabase
      .from('professionals')
      .select('id, name, company, phone, license_number, email')
      .eq('user_id', user.id)
      .single();

    if (profError || !professional) {
      console.error("Error fetching professional:", profError);
      throw new Error("Professional profile not found");
    }

    // Get user profile for fallback data
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    // Create enhanced professional object with fallbacks
    const enhancedProfessional = {
      ...professional,
      name: professional.name || (userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : '') || 'Professional',
      company: professional.company || 'Company',
      license_number: professional.license_number || 'License Pending',
      email: professional.email || user.email || ''
    };

    // Log the profile data for debugging
    console.log("Professional profile data:", {
      original: { name: professional.name, license_number: professional.license_number },
      enhanced: { name: enhancedProfessional.name, license_number: enhancedProfessional.license_number }
    });

    // Validate essential fields (name is required)
    if (!enhancedProfessional.name || enhancedProfessional.name === 'Professional') {
      const missingFields = [];
      if (!professional.name && !userProfile?.first_name && !userProfile?.last_name) missingFields.push('name');
      
      throw new Error(`Professional profile is incomplete. Missing required fields: ${missingFields.join(', ')}. Please complete your profile settings before sending invitations.`);
    }

    console.log("Professional found:", enhancedProfessional.name);

    // Support resend-by-id and prevent duplicate active invitations
    type TargetType = 'client' | 'professional';
    const isProfessionalTarget = (t: string | undefined) => t === 'professional' || t === 'realtor';

    // Parse body as any to allow optional invitationId
    const rawBody: any = body as any;

    // Helper to build and send email/SMS based on invitation type
    const sendEmailForInvitation = async (
      invitation: { id: string; invitation_code: string; client_email: string; invitation_target_type: TargetType; invitation_type?: string },
      typeForEmail: 'client' | 'professional',
      customMessage?: string,
      professionalType?: string
    ) => {
      const invitationCode = invitation.invitation_code;
      const subject = typeForEmail === 'client'
        ? `Invitation from ${inviterName}`
        : `Professional Invitation from ${inviterName}`;

      const htmlContent = typeForEmail === 'client'
        ? createClientInvitationHTML({ inviterName, companyName, invitationCode, customMessage })
        : createProfessionalInvitationHTML({ inviterName, companyName, invitationCode, professionalType: professionalType || 'team member', customMessage });

      console.log("Sending email to:", invitation.client_email);
      let emailResult: any;
      if (isDevelopment) {
        console.log("Development mode: Mocking email send");
        console.log("Email would be sent to:", invitation.client_email);
        emailResult = { data: { id: `mock-${Date.now()}` }, error: null };
      } else {
        if (!resend) {
          throw new Error("RESEND_API_KEY is required for sending emails in production");
        }
        emailResult = await resend.emails.send({
          from: `${inviterName} <noreply@lmicheck.com>`,
          to: [invitation.client_email],
          subject,
          html: htmlContent,
        });
      }

      if (emailResult.error) {
        console.error("Email sending failed:", emailResult.error);
        await supabase.from('client_invitations').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', invitation.id);
        let errorMessage = typeof emailResult.error === 'string' ? emailResult.error : (emailResult.error?.message || 'Email sending failed');
        throw new Error(`Email sending failed: ${errorMessage}`);
      }

      console.log("Email sent successfully:", emailResult.data?.id);
      
      // Determine if we need to send SMS too
      const invitationType = invitation.invitation_type || 'email';
      let smsSent = false;
      
      if (invitationType === 'sms' || invitationType === 'both') {
        // TODO: Implement SMS sending when SMS provider is configured
        console.log("SMS sending not yet implemented");
      }
      
      await supabase
        .from('client_invitations')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(), 
          email_sent: true,
          sms_sent: smsSent,
          updated_at: new Date().toISOString() 
        })
        .eq('id', invitation.id);

      return {
        success: true,
        invitationId: invitation.id,
        emailId: emailResult.data?.id,
        emailSent: true,
        smsSent,
      };
    };

    // Common values used by email helpers
    const inviterName = enhancedProfessional.name;
    const companyName = enhancedProfessional.company || "Our Team";

    // 1) Resend by existing invitation ID
    if (rawBody?.invitationId) {
      const { data: existing, error: fetchExistingError } = await supabase
        .from('client_invitations')
        .select('id, invitation_code, client_email, invitation_target_type, status')
        .eq('id', rawBody.invitationId)
        .single();

      if (fetchExistingError || !existing) {
        throw new Error('Invitation not found');
      }

      if (existing.status === 'revoked' || existing.status === 'accepted') {
        throw new Error('Cannot resend accepted or revoked invitation');
      }

      const emailResult = await sendEmailForInvitation(
        existing as any,
        existing.invitation_target_type === 'professional' ? 'professional' : 'client',
        rawBody.customMessage,
        rawBody.professionalType || rawBody.role
      );

      return new Response(
        JSON.stringify({ success: true, ...emailResult, message: 'Invitation sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2) Create or reuse existing active invitation (pre-check)
    if (!rawBody.email || !rawBody.type) {
      throw new Error('Email and type are required fields');
    }

    if (!isValidEmail(rawBody.email)) {
      throw new Error('Invalid email format');
    }

    const targetType: TargetType = isProfessionalTarget(rawBody.type) ? 'professional' : 'client';
    const emailLower = String(rawBody.email).toLowerCase();

    // Look for an existing active invitation
    const { data: activeInvite } = await supabase
      .from('client_invitations')
      .select('id, invitation_code, client_email, invitation_target_type, status')
      .eq('professional_id', professional.id)
      .eq('client_email', emailLower)
      .eq('invitation_target_type', targetType)
      .in('status', ['pending', 'sent'])
      .maybeSingle();

    if (activeInvite) {
      console.log('Active invitation exists, resending email');
      const emailResult = await sendEmailForInvitation(
        activeInvite as any,
        targetType === 'professional' ? 'professional' : 'client',
        rawBody.customMessage,
        rawBody.professionalType || rawBody.role
      );

      return new Response(
        JSON.stringify({ success: true, ...emailResult, message: 'Existing active invitation resent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 3) Create new invitation then send
    const invitationCode = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Determine invitation type - support email, sms, both
  const invitationType = rawBody.invitationType || rawBody.type || 'email';
  
  const invitationData = {
    professional_id: professional.id,
    client_email: emailLower,
    invitation_code: invitationCode,
    invitation_type: invitationType,
    invitation_target_type: targetType,
    status: 'pending',
    expires_at: expiresAt.toISOString(),
    custom_message: rawBody.customMessage,
    client_name: rawBody.clientName,
    client_phone: rawBody.clientPhone,
    target_professional_role: rawBody.professionalType || rawBody.role,
  };

    const { data: invitation, error: inviteError } = await supabase
      .from('client_invitations')
      .insert(invitationData)
      .select()
      .single();

    if (inviteError || !invitation) {
      console.error('Error creating invitation:', inviteError);
      throw new Error('Failed to create invitation');
    }

    console.log('Invitation created:', invitation.id);

    const emailResult = await sendEmailForInvitation(
      invitation as any,
      targetType === 'professional' ? 'professional' : 'client',
      rawBody.customMessage,
      rawBody.professionalType || rawBody.role
    );

    return new Response(
      JSON.stringify({ success: true, ...emailResult, message: 'Invitation sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2));
    console.error("Error stack:", error.stack);
    
    // Determine appropriate status code
    let statusCode = 500;
    let errorMessage = error.message || "Failed to send invitation";
    
    if (error.message?.includes("Invalid email format") || 
        error.message?.includes("required fields") ||
        error.message?.includes("profile is incomplete")) {
      statusCode = 400; // Bad Request
    } else if (error.message?.includes("Authentication failed") ||
               error.message?.includes("No authorization header")) {
      statusCode = 401; // Unauthorized
    } else if (error.message?.includes("Professional profile not found")) {
      statusCode = 403; // Forbidden
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: isDevelopment ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: statusCode,
      }
    );
  }
});

function createClientInvitationHTML(params: {
  inviterName: string;
  companyName: string;
  invitationCode: string;
  customMessage?: string;
}): string {
  const { inviterName, companyName, invitationCode, customMessage } = params;
  // Use dynamic domain for client registration
  const domain = Deno.env.get("FRONTEND_URL") || "https://llhofjbijjxkfezidxyi.lovableproject.com";
  const acceptUrl = `${domain}/client-registration?code=${invitationCode}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>You're Invited!</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">You're Invited to Join Our Platform!</h1>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${inviterName}</strong> from <strong>${companyName}</strong> has invited you to join our mortgage platform.
          </p>
          
          ${customMessage ? `
            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <p style="margin: 0; font-style: italic;">"${customMessage}"</p>
            </div>
          ` : ''}
          
          <!-- Main CTA Button -->
          <div style="margin: 30px 0;">
            <a href="${acceptUrl}" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
              Accept Invitation & Create Account
            </a>
          </div>
          
          <p style="margin: 20px 0; font-size: 14px; color: #666;">
            Can't click the button? Copy and paste this link into your browser:
          </p>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #2563eb; word-break: break-all;">
            ${acceptUrl}
          </p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #2563eb;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Or use this invitation code manually:</p>
            <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0; letter-spacing: 2px;">${invitationCode}</p>
          </div>
          
          <p style="margin: 20px 0;">
            Get started working with ${inviterName} on your mortgage journey today!
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666;">
            <p>Best regards,<br>The ${companyName} Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function createProfessionalInvitationHTML(params: {
  inviterName: string;
  companyName: string;
  invitationCode: string;
  professionalType: string;
  customMessage?: string;
}): string {
  const { inviterName, companyName, invitationCode, professionalType, customMessage } = params;
  // Use dynamic domain for professional registration  
  const domain = Deno.env.get("FRONTEND_URL") || "https://llhofjbijjxkfezidxyi.lovableproject.com";
  const acceptUrl = `${domain}/professional-registration?code=${invitationCode}`;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Professional Invitation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: #16a34a; margin-bottom: 20px;">Join Our Professional Team!</h1>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>${inviterName}</strong> from <strong>${companyName}</strong> has invited you to join as a <strong>${professionalType}</strong>.
          </p>
          
          ${customMessage ? `
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 0; font-style: italic;">"${customMessage}"</p>
            </div>
          ` : ''}
          
          <!-- Main CTA Button -->
          <div style="margin: 30px 0;">
            <a href="${acceptUrl}" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(22, 163, 74, 0.2);">
              Accept Invitation & Join Team
            </a>
          </div>
          
          <p style="margin: 20px 0; font-size: 14px; color: #666;">
            Can't click the button? Copy and paste this link into your browser:
          </p>
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #16a34a; word-break: break-all;">
            ${acceptUrl}
          </p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #16a34a;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Or use this invitation code manually:</p>
            <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 0; letter-spacing: 2px;">${invitationCode}</p>
          </div>
          
          <p style="margin: 20px 0;">
            Start collaborating with our team and grow your professional network today!
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666;">
            <p>Welcome to the team!<br>The ${companyName} Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}