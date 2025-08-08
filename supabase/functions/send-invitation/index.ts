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
      .select('id, name, company, phone, license_number')
      .eq('user_id', user.id)
      .single();

    if (profError || !professional) {
      console.error("Error fetching professional:", profError);
      throw new Error("Professional profile not found");
    }

    // Get user profile for fallback data
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, company_name, license_number')
      .eq('user_id', user.id)
      .single();

    // Create enhanced professional object with fallbacks
    const enhancedProfessional = {
      ...professional,
      name: professional.name || (userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : '') || 'Professional',
      company: professional.company || userProfile?.company_name || 'Company',
      license_number: professional.license_number || userProfile?.license_number || 'License Pending'
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

    // Generate invitation code
    const invitationCode = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invitation record
    const invitationData = {
      professional_id: professional.id,
      client_email: body.email,
      invitation_code: invitationCode,
      invitation_type: body.type === 'client' ? 'email' : 'email',
      invitation_target_type: body.type,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      custom_message: body.customMessage,
      client_name: body.clientName,
      client_phone: body.clientPhone,
      target_professional_role: body.professionalType || body.role,
    };

    const { data: invitation, error: inviteError } = await supabase
      .from('client_invitations')
      .insert(invitationData)
      .select()
      .single();

    if (inviteError || !invitation) {
      console.error("Error creating invitation:", inviteError);
      throw new Error("Failed to create invitation");
    }

    console.log("Invitation created:", invitation.id);

    // Prepare email content
    const inviterName = enhancedProfessional.name;
    const companyName = enhancedProfessional.company || "Our Team";
    
    let subject: string;
    let htmlContent: string;
    
    if (body.type === 'client') {
      subject = `Invitation from ${inviterName}`;
      htmlContent = createClientInvitationHTML({
        inviterName,
        companyName,
        invitationCode,
        customMessage: body.customMessage,
      });
    } else {
      subject = `Professional Invitation from ${inviterName}`;
      htmlContent = createProfessionalInvitationHTML({
        inviterName,
        companyName,
        invitationCode,
        professionalType: body.professionalType || 'team member',
        customMessage: body.customMessage,
      });
    }

    // Send email or mock in development
    console.log("Sending email to:", body.email);
    
    let emailResult: any;
    
    if (isDevelopment) {
      // Development mode - mock email sending
      console.log("Development mode: Mocking email send");
      console.log("Email would be sent to:", body.email);
      console.log("Subject:", subject);
      console.log("From:", `${inviterName} <noreply@lmicheck.com>`);
      
      emailResult = {
        data: { id: `mock-${Date.now()}` },
        error: null
      };
    } else {
      // Production mode - send actual email
      if (!resend) {
        throw new Error("RESEND_API_KEY is required for sending emails in production");
      }
      
      emailResult = await resend.emails.send({
        from: `${inviterName} <noreply@lmicheck.com>`, // Use your verified domain
        to: [body.email],
        subject,
        html: htmlContent,
      });
    }

    if (emailResult.error) {
      console.error("Email sending failed:", emailResult.error);
      console.error("Full error object:", JSON.stringify(emailResult.error, null, 2));
      
      // Update invitation status to failed
      await supabase
        .from('client_invitations')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id);
      
      // Handle different error types from Resend
      let errorMessage = "Email sending failed";
      if (emailResult.error?.message) {
        errorMessage = emailResult.error.message;
      } else if (typeof emailResult.error === 'string') {
        errorMessage = emailResult.error;
      } else if (emailResult.error?.error) {
        errorMessage = emailResult.error.error;
      }
        
      throw new Error(`Email sending failed: ${errorMessage}`);
    }

    console.log("Email sent successfully:", emailResult.data?.id);

    // Update invitation status to sent
    await supabase
      .from('client_invitations')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_sent: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    return new Response(
      JSON.stringify({
        success: true,
        invitationId: invitation.id,
        emailId: emailResult.data?.id,
        message: "Invitation sent successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
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
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #2563eb;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Your Invitation Code:</p>
            <p style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 0; letter-spacing: 2px;">${invitationCode}</p>
          </div>
          
          <p style="margin: 20px 0;">
            Use this code to create your account and start working with ${inviterName} on your mortgage journey.
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
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #16a34a;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">Your Invitation Code:</p>
            <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 0; letter-spacing: 2px;">${invitationCode}</p>
          </div>
          
          <p style="margin: 20px 0;">
            Use this code to create your professional account and start collaborating with our team.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666;">
            <p>Welcome to the team!<br>The ${companyName} Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}