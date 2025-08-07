import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfessionalInvitationRequest {
  email: string;
  name?: string;
  professionalType: 'mortgage_professional' | 'realtor';
  customMessage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Professional invitation function started');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('📋 Supabase client initialized');

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

    // Get the current professional's info
    const { data: currentProfessional, error: professionalError } = await supabase
      .from('professionals')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (professionalError || !currentProfessional) {
      console.error('❌ Professional not found:', professionalError);
      return new Response(
        JSON.stringify({ error: 'Professional profile not found' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('💼 Current professional:', currentProfessional.name);

    // Create the invitation record
    const invitationData = {
      professional_id: currentProfessional.id, // Use professional ID, not user ID
      client_email: email,
      client_name: name || email.split('@')[0],
      custom_message: customMessage,
      invitation_target_type: 'professional',
      target_professional_role: professionalType,
      status: 'pending'
    };

    const { data: invitation, error: invitationError } = await supabase
      .from('client_invitations')
      .insert([invitationData])
      .select()
      .single();

    if (invitationError) {
      console.error('❌ Failed to create invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invitation' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('✅ Invitation created:', invitation.id);

    // Here you would typically send an email using a service like Resend
    // For now, we'll just log that the invitation was created
    console.log('📧 Email would be sent to:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        invitation: {
          id: invitation.id,
          email: email,
          type: professionalType,
          status: 'sent'
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('💥 Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);