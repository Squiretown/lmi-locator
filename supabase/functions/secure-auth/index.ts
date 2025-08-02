import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  email: string;
  password?: string;
  action: 'signin' | 'signup' | 'reset_password';
  userType?: string;
  firstName?: string;
  lastName?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function checkRateLimit(ipAddress: string, email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_auth_rate_limit', {
      p_ip_address: ipAddress,
      p_email: email
    });
    
    if (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Rate limit exception:', error);
    return false;
  }
}

async function logSecurityEvent(
  eventType: string,
  userId: string | null,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  details?: any
) {
  try {
    await supabase.rpc('log_security_event', {
      p_event_type: eventType,
      p_user_id: userId,
      p_details: details ? JSON.stringify(details) : null,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_success: success
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

function validateInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  // Check for malicious patterns
  const maliciousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(input)) {
      throw new Error('Input contains potentially malicious content');
    }
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .substring(0, maxLength);
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    const body: AuthRequest = await req.json();
    const { email, password, action, userType, firstName, lastName } = body;

    // Validate inputs
    if (!email || !action) {
      await logSecurityEvent('invalid_auth_request', null, ipAddress, userAgent, false, {
        reason: 'Missing required fields'
      });
      return new Response(
        JSON.stringify({ error: 'Email and action are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const sanitizedEmail = validateInput(email, 254);
    
    // Check rate limiting
    const isAllowed = await checkRateLimit(ipAddress, sanitizedEmail);
    if (!isAllowed) {
      await logSecurityEvent('rate_limit_exceeded', null, ipAddress, userAgent, false, {
        email: sanitizedEmail
      });
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    let result;
    let eventType: string;

    switch (action) {
      case 'signin':
        if (!password) {
          throw new Error('Password is required for signin');
        }
        
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password: password
        });
        
        eventType = 'user_signin_attempt';
        result = { data: signinData, error: signinError };
        
        await logSecurityEvent(
          eventType,
          signinData?.user?.id || null,
          ipAddress,
          userAgent,
          !signinError,
          { email: sanitizedEmail }
        );
        break;

      case 'signup':
        if (!password || !userType || !firstName || !lastName) {
          throw new Error('Password, user type, first name, and last name are required for signup');
        }

        const sanitizedUserType = validateInput(userType, 50);
        const sanitizedFirstName = validateInput(firstName, 100);
        const sanitizedLastName = validateInput(lastName, 100);

        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password: password,
          options: {
            data: {
              user_type: sanitizedUserType,
              first_name: sanitizedFirstName,
              last_name: sanitizedLastName
            },
            emailRedirectTo: `${req.headers.get('origin') || 'https://app.example.com'}/login`
          }
        });
        
        eventType = 'user_signup_attempt';
        result = { data: signupData, error: signupError };
        
        await logSecurityEvent(
          eventType,
          signupData?.user?.id || null,
          ipAddress,
          userAgent,
          !signupError,
          { 
            email: sanitizedEmail,
            user_type: sanitizedUserType
          }
        );
        break;

      case 'reset_password':
        const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(
          sanitizedEmail,
          {
            redirectTo: `${req.headers.get('origin') || 'https://app.example.com'}/reset-password`
          }
        );
        
        eventType = 'password_reset_attempt';
        result = { data: resetData, error: resetError };
        
        await logSecurityEvent(
          eventType,
          null,
          ipAddress,
          userAgent,
          !resetError,
          { email: sanitizedEmail }
        );
        break;

      default:
        throw new Error('Invalid action');
    }

    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify(result.data),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in secure-auth function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);