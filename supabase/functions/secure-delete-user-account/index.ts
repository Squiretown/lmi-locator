// supabase/functions/secure-delete-user-account/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { currentPassword } = await req.json()

    if (!currentPassword) {
      return new Response(
        JSON.stringify({ error: 'Current password is required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Verify password before deletion
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid password. Please verify your current password and try again.' 
        }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Get client info for logging
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Log the account deletion attempt
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: 'account_deletion_initiated',
        p_user_id: user.id,
        p_details: { email: user.email },
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log security event:', logError)
      // Continue with deletion even if logging fails
    }

    // ✅ FIXED: Call cleanup function BEFORE deleting auth user
    console.log(`Calling delete_user_references for user ${user.id}`)
    const { data: cleanupData, error: cleanupError } = await supabase
      .rpc('delete_user_references', { p_target_user_id: user.id })

    if (cleanupError) {
      console.error('Cleanup function error:', cleanupError)
      // Log the error but continue - CASCADE constraints will handle it
    } else {
      console.log('Cleanup completed:', cleanupData)
    }

    // Delete the user account from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error('Failed to delete user account:', deleteError)
      
      // Log failed deletion
      try {
        await supabase.rpc('log_security_event', {
          p_event_type: 'account_deletion_failed',
          p_user_id: user.id,
          p_details: { error: deleteError.message },
          p_ip_address: clientIP,
          p_user_agent: userAgent,
          p_success: false
        })
      } catch (logError) {
        console.error('Failed to log deletion failure:', logError)
      }

      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete account. Please try again or contact support.',
          details: deleteError.message 
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Log successful account deletion
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: 'account_deleted',
        p_user_id: user.id,
        p_details: { 
          email: user.email,
          cleanup_summary: cleanupData 
        },
        p_ip_address: clientIP,
        p_user_agent: userAgent
      })
    } catch (logError) {
      console.error('Failed to log successful deletion:', logError)
    }

    console.log('User account successfully deleted:', user.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Account successfully deleted',
        cleanup: cleanupData
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
        error: 'An unexpected error occurred. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})