// supabase/functions/send-user-invitation/index.ts
// FIXED VERSION - Correct invitation URLs and "on behalf of" email pattern

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate 6-character invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Normalize professional type to database-compatible value
function normalizeProfessionalType(inputType: string): string {
  const mapping: Record<string, string> = {
    'mortgage_broker': 'mortgage_professional',
    'lender': 'mortgage_professional',
    'banker': 'mortgage_professional',
    'mortgage_professional': 'mortgage_professional',
    'realtor': 'realtor',
    'real_estate_agent': 'realtor',
    'agent': 'realtor',
  };
  return mapping[inputType?.toLowerCase()] || inputType;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);
  console.log(`[${requestId}] Processing invitation request`);

  try {
    // Initialize Supabase client with user's auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error(`[${requestId}] Auth error:`, userError?.message);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let requestData: any;
    try {
      requestData = await req.json();
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
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

    const inviteeEmail = requestData.email.toLowerCase().trim();

    // Check for existing pending invitations
    const { data: existingInvitation } = await supabaseClient
      .from('user_invitations')
      .select('id, status')
      .eq('email', inviteeEmail)
      .eq('user_type', requestData.userType)
      .eq('invited_by_user_id', user.id)
      .in('status', ['pending', 'sent'])
      .maybeSingle();

    if (existingInvitation) {
      return new Response(
        JSON.stringify({ error: 'An active invitation already exists for this email' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get inviter's profile info for personalization
    const { data: inviterProfile } = await supabaseClient
      .from('user_profiles')
      .select('first_name, last_name, email')
      .eq('user_id', user.id)
      .single();

    const { data: inviterProfessional } = await supabaseClient
      .from('professionals')
      .select('name, company, email, phone')
      .eq('user_id', user.id)
      .single();

    const inviterName = inviterProfile 
      ? `${inviterProfile.first_name || ''} ${inviterProfile.last_name || ''}`.trim()
      : inviterProfessional?.name || user.email?.split('@')[0] || 'A professional';
    
    const inviterCompany = inviterProfessional?.company || '';
    const inviterEmail = inviterProfessional?.email || inviterProfile?.email || user.email;

    // Generate tokens
    const inviteToken = crypto.randomUUID();
    const inviteCode = generateInviteCode();

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Normalize professional type if applicable
    const normalizedProfessionalType = requestData.userType !== 'client' 
      ? normalizeProfessionalType(requestData.professionalType || requestData.userType)
      : null;

    // Create invitation record
    const invitationData = {
      email: inviteeEmail,
      invited_by_user_id: user.id,
      invited_by_name: inviterName,
      user_type: requestData.userType,
      first_name: requestData.firstName || null,
      last_name: requestData.lastName || null,
      phone: requestData.phone || null,
      send_via: requestData.sendVia || 'email',
      custom_message: requestData.customMessage || null,
      invite_token: inviteToken,
      invite_code: inviteCode,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      // Client-specific fields
      ...(requestData.userType === 'client' && {
        property_interest: requestData.propertyInterest || null,
        estimated_budget: requestData.estimatedBudget || null,
        preferred_contact: requestData.preferredContact || 'email',
      }),
      // Professional-specific fields
      ...(requestData.userType !== 'client' && {
        professional_type: normalizedProfessionalType,
        license_number: requestData.licenseNumber || null,
        company_name: requestData.companyName || null,
      }),
    };

    const { data: invitation, error: insertError } = await supabaseClient
      .from('user_invitations')
      .insert(invitationData)
      .select()
      .single();

    if (insertError) {
      console.error(`[${requestId}] Insert error:`, insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Invitation created: ${invitation.id}`);

    // ============================================
    // SEND EMAIL - FIXED URL AND "ON BEHALF OF" PATTERN
    // ============================================
    
    let emailSent = false;
    let emailError = null;

    if (requestData.sendVia === 'email' || requestData.sendVia !== 'sms') {
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        if (!resendApiKey) {
          throw new Error('RESEND_API_KEY not configured');
        }

        const resend = new Resend(resendApiKey);

        // FIXED: Use APP_URL for invitation link, not Supabase auth URL
        const appUrl = Deno.env.get('APP_URL') || 'https://lmicheck.com';
        const inviteLink = `${appUrl}/accept-invitation/${inviteToken}`;

        // Determine invite type for email content
        const isClientInvite = requestData.userType === 'client';
        const inviteTypeLabel = isClientInvite ? 'client' : 'team member';

        // Build email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                You're Invited!
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 18px; line-height: 1.6;">
                Hi${requestData.firstName ? ` ${requestData.firstName}` : ''},
              </p>
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong>${inviterCompany ? ` from <strong>${inviterCompany}</strong>` : ''} has invited you to join their ${inviteTypeLabel} network on LMI Check.
              </p>

              ${requestData.customMessage ? `
              <div style="margin: 24px 0; padding: 20px; background-color: #f0f9ff; border-left: 4px solid #0ea5e9; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px; color: #0c4a6e; font-size: 15px; font-style: italic;">
                  "${requestData.customMessage}"
                </p>
                <p style="margin: 0; color: #0369a1; font-size: 14px; font-weight: 600;">
                  — ${inviterName}
                </p>
              </div>
              ` : ''}

              <p style="margin: 0 0 32px; color: #6b7280; font-size: 15px; line-height: 1.6;">
                LMI Check helps you find properties in Low-to-Moderate Income areas that qualify for special mortgage assistance programs.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <table role="presentation" style="margin: 0 auto;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); border-radius: 8px; padding: 0;">
                      <a href="${inviteLink}" style="display: inline-block; padding: 16px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                        Accept Invitation
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Invite Code -->
              <div style="text-align: center; margin: 32px 0; padding: 24px; background-color: #f9fafb; border-radius: 8px; border: 1px dashed #d1d5db;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Or enter this code manually
                </p>
                <p style="margin: 0; color: #111827; font-size: 32px; font-weight: 700; letter-spacing: 4px; font-family: monospace;">
                  ${inviteCode}
                </p>
              </div>

              <p style="margin: 0; color: #9ca3af; font-size: 14px; text-align: center;">
                This invitation expires on ${expiresAt.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.5;">
                If you didn't expect this invitation, you can safely ignore this email.
                <br>
                Questions? Reply to this email to reach ${inviterName} directly.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} LMI Check. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

        // Plain text version for better deliverability
        const emailText = `
You're Invited to LMI Check!

Hi${requestData.firstName ? ` ${requestData.firstName}` : ''},

${inviterName}${inviterCompany ? ` from ${inviterCompany}` : ''} has invited you to join their ${inviteTypeLabel} network on LMI Check.

${requestData.customMessage ? `Message from ${inviterName}: "${requestData.customMessage}"\n\n` : ''}

LMI Check helps you find properties in Low-to-Moderate Income areas that qualify for special mortgage assistance programs.

Accept your invitation: ${inviteLink}

Or enter this code manually: ${inviteCode}

This invitation expires on ${expiresAt.toLocaleDateString()}.

---
If you didn't expect this invitation, you can safely ignore this email.
Questions? Reply to this email to reach ${inviterName} directly.

© ${new Date().getFullYear()} LMI Check
`;

        // Send email with "on behalf of" pattern
        // Using verified support247.solutions domain
        const emailResult = await resend.emails.send({
          from: 'LMI Check <notifications@support247.solutions>',
          reply_to: inviterEmail, // Replies go to the inviting professional
          to: [inviteeEmail],
          subject: `${inviterName} has invited you to join LMI Check`,
          html: emailHtml,
          text: emailText,
        });

        console.log(`[${requestId}] Resend response:`, JSON.stringify(emailResult));

        if (emailResult.error) {
          throw new Error(emailResult.error.message);
        }

        emailSent = true;

        // Update invitation status
        await supabaseClient
          .from('user_invitations')
          .update({ 
            status: 'sent',
            email_sent: true,
            email_sent_at: new Date().toISOString(),
            metadata: {
              resend_id: emailResult.data?.id,
              sent_from: 'notifications@support247.solutions',
              reply_to: inviterEmail,
            }
          })
          .eq('id', invitation.id);

        console.log(`[${requestId}] Email sent successfully`);

      } catch (emailErr) {
        console.error(`[${requestId}] Email error:`, emailErr);
        emailError = emailErr instanceof Error ? emailErr.message : 'Unknown email error';
        
        // Update invitation with error info
        await supabaseClient
          .from('user_invitations')
          .update({ 
            metadata: {
              email_error: emailError,
              email_attempted_at: new Date().toISOString(),
            }
          })
          .eq('id', invitation.id);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          userType: invitation.user_type,
          inviteCode: invitation.invite_code,
          expiresAt: invitation.expires_at,
          status: emailSent ? 'sent' : 'pending',
        },
        email: {
          sent: emailSent,
          error: emailError,
        },
        message: emailSent 
          ? `Invitation sent to ${inviteeEmail}`
          : `Invitation created. Share code ${inviteCode} with ${inviteeEmail}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
