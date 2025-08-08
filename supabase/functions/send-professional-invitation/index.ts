
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface ProfessionalInvitationRequest {
  email: string;
  name?: string;
  professionalType: 'mortgage_professional' | 'realtor';
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('🚀 Professional invitation function started');

    // Initialize Supabase client with service role key for better permissions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📋 Supabase client initialized with service role');

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header found');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ Invalid user token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('👤 User authenticated:', user.id);

    // Parse request body
    const { email, name, professionalType, customMessage }: ProfessionalInvitationRequest = await req.json();

    console.log('📝 Invitation data:', { email, name, professionalType });

    // Validate required fields
    if (!email || !professionalType) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Email and professional type are required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get the current professional's info - try professionals table first
    let currentProfessional;
    
    console.log('🔍 Looking up professional for user:', user.id);
    
    // First try to find in professionals table
    const { data: profData, error: profError } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profData) {
      currentProfessional = profData;
      console.log('✅ Found professional in professionals table:', profData.id);
    } else {
      console.log('⚠️ No professional found in professionals table, checking user_profiles');
      
      // Fallback to user_profiles table
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userProfile) {
        // Create a pseudo professional object from user profile
        currentProfessional = {
          id: userProfile.user_id, // Use user_id as professional_id fallback
          user_id: user.id,
          name: userProfile.company_name || `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim(),
          company: userProfile.company_name,
          email: user.email,
          professional_type: userProfile.user_type || 'realtor'
        };
        console.log('✅ Created professional from user_profiles:', currentProfessional.id);
      } else {
        console.error('❌ No professional profile found for user:', user.id);
        return new Response(
          JSON.stringify({ 
            error: 'Professional profile not found', 
            details: 'You must have a professional profile to send invitations'
          }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }
    }

    console.log('💼 Current professional:', currentProfessional.name || currentProfessional.company);

    // Create the invitation record
    const invitationData = {
      professional_id: currentProfessional.id,
      client_email: email,
      client_name: name || email.split('@')[0],
      custom_message: customMessage,
      invitation_target_type: 'professional',
      target_professional_role: professionalType,
      status: 'pending'
    };

    console.log('📤 Creating invitation with data:', invitationData);

    const { data: invitation, error: invitationError } = await supabase
      .from('client_invitations')
      .insert([invitationData])
      .select()
      .single();

    if (invitationError) {
      console.error('❌ Failed to create invitation:', invitationError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create invitation',
          details: invitationError.message
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('✅ Invitation created successfully:', invitation.id);

    // Now send the email by calling send-client-invitation
    let emailSent = false;
    let emailError = null;
    
    try {
      console.log('📧 Attempting to send invitation email for:', invitation.id);
      console.log('📧 Payload being sent:', {
        invitationId: invitation.id,
        type: 'email'
      });
      
      // Use direct HTTP call instead of supabase.functions.invoke for better reliability
      const functionUrl = `${supabaseUrl}/functions/v1/send-client-invitation`;
      console.log('📧 Function URL:', functionUrl);
      
      const emailResponse = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          invitationId: invitation.id,
          type: 'email'
        })
      });
      
      console.log('📧 Email response status:', emailResponse.status);
      const emailData = await emailResponse.json();
      console.log('📧 Email response data:', emailData);
      
      if (!emailResponse.ok) {
        console.error('❌ Email sending failed with status:', emailResponse.status);
        emailError = emailData.error || `HTTP ${emailResponse.status}`;
      } else if (emailData.success) {
        console.log('✅ Email sent successfully');
        emailSent = true;
      } else {
        console.error('❌ Email sending failed:', emailData.error);
        emailError = emailData.error || 'Unknown email error';
      }
    } catch (emailErr: any) {
      console.error('💥 Exception while sending email:', emailErr);
      emailError = emailErr.message || 'Email sending exception';
    }

    const responseMessage = emailSent 
      ? 'Professional invitation created and email sent successfully'
      : 'Professional invitation created successfully, but email sending failed';

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation: {
          id: invitation.id,
          email: email,
          type: professionalType,
          status: 'created'
        },
        emailSent,
        emailError,
        message: responseMessage
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('💥 Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to process professional invitation request'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);
