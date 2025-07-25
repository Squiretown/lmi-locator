import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
const handleCors = (req: Request): Response | null => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }
  return null
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get the user's JWT from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header found')
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const jwt = authHeader.replace('Bearer ', '')
    
    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Parse request body
    const { currentPassword } = await req.json()
    
    if (!currentPassword) {
      return new Response(
        JSON.stringify({ error: 'Current password is required for account deletion' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Get client IP and user agent for security logging
    const clientIP = req.headers.get('CF-Connecting-IP') || 
                    req.headers.get('X-Forwarded-For') || 
                    'unknown'
    const userAgent = req.headers.get('User-Agent') || 'unknown'

    // Verify password by attempting to sign in
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (passwordError) {
      console.error('Password verification failed:', passwordError)
      
      // Log failed deletion attempt
      await supabase.rpc('log_security_event', {
        p_event_type: 'account_deletion_failed_auth',
        p_user_id: user.id,
        p_details: { reason: 'Invalid password provided' },
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_success: false
      })

      return new Response(
        JSON.stringify({ 
          error: 'Invalid password. Please verify your current password and try again.' 
        }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Log the account deletion attempt
    await supabase.rpc('log_security_event', {
      p_event_type: 'account_deletion_initiated',
      p_user_id: user.id,
      p_details: { email: user.email },
      p_ip_address: clientIP,
      p_user_agent: userAgent
    })

    // Anonymize user's search history before deletion
    try {
      await supabase.rpc('anonymize_user_search_history', {
        target_user_id: user.id
      })
      console.log('Successfully anonymized user search history')
    } catch (anonymizeError) {
      console.error('Failed to anonymize user search history:', anonymizeError)
      // Continue with deletion even if anonymization fails
    }

    // Delete the user account
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error('Failed to delete user account:', deleteError)
      
      // Log failed deletion
      await supabase.rpc('log_security_event', {
        p_event_type: 'account_deletion_failed',
        p_user_id: user.id,
        p_details: { error: deleteError.message },
        p_ip_address: clientIP,
        p_user_agent: userAgent,
        p_success: false
      })

      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete account. Please try again or contact support.' 
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Log successful account deletion
    await supabase.rpc('log_security_event', {
      p_event_type: 'account_deleted',
      p_user_id: user.id,
      p_details: { email: user.email },
      p_ip_address: clientIP,
      p_user_agent: userAgent
    })

    console.log('User account successfully deleted:', user.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account successfully deleted'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error during account deletion:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again later.' 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})