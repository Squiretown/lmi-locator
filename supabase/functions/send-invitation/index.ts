import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-supabase-authorization, x-client-info, apikey, content-type',
};

interface UnifiedInvitationPayload {
  target: 'client' | 'professional';
  channel: 'email' | 'sms' | 'both';
  recipient: {
    email: string;
  };
  context: {
    role?: string;
    customMessage?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Expected POST.' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const requestId = crypto.randomUUID().substring(0, 8);
    console.log(`[${requestId}] Starting send-invitation shim request`);

    // Get authenticated user - support both header formats
    const userJWT = req.headers.get('X-Supabase-Authorization') || req.headers.get('Authorization');
    
    if (!userJWT) {
      console.error(`[${requestId}] No authorization header found`);
      return new Response(
        JSON.stringify({ error: 'Authorization header required', requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse unified payload
    const rawBody = await req.text();
    let unifiedPayload: UnifiedInvitationPayload;
    
    try {
      console.log(`[${requestId}] Raw body length:`, rawBody?.length ?? 0);
      console.log(`[${requestId}] Raw body preview:`, rawBody?.slice(0, 300));
      unifiedPayload = JSON.parse(rawBody);
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse JSON body:`, parseError instanceof Error ? parseError.message : String(parseError));
      return new Response(
        JSON.stringify({ error: 'Invalid request body', requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map unified payload to send-user-invitation format
    const sendUserInvitationPayload = {
      email: unifiedPayload.recipient.email,
      userType: unifiedPayload.target === 'professional' ? 'realtor' : 'client',
      firstName: unifiedPayload.recipient.email.split('@')[0],
      lastName: '',
      phone: '',
      sendVia: unifiedPayload.channel === 'both' ? 'both' : 'email',
      customMessage: unifiedPayload.context?.customMessage || '',
      // Professional-specific fields
      ...(unifiedPayload.target === 'professional' && {
        professionalType: 'realtor',
        requiresApproval: false
      })
    };

    // Create Supabase client and forward to send-user-invitation
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { 
            Authorization: userJWT.startsWith('Bearer ') ? userJWT : `Bearer ${userJWT}`
          } 
        } 
      }
    );

    const { data, error } = await supabaseClient.functions.invoke('send-user-invitation', {
      body: sendUserInvitationPayload
    });

    if (error) {
      console.error(`[${requestId}] Forward to send-user-invitation failed:`, error);
      return new Response(
        JSON.stringify({ error: 'Failed to send invitation', details: error.message, requestId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[${requestId}] Successfully forwarded to send-user-invitation`);
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-invitation shim:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);