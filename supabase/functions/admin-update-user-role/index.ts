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
    
    // Verify the user's session and check admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Check if user is admin
    const userType = user.user_metadata?.user_type
    if (userType !== 'admin') {
      console.error('Non-admin attempted role change:', user.id)
      
      // Log unauthorized attempt
      await supabase.rpc('log_security_event', {
        p_event_type: 'unauthorized_role_change_attempt',
        p_user_id: user.id,
        p_details: { attempted_action: 'user_role_update' },
        p_ip_address: req.headers.get('CF-Connecting-IP') || 'unknown',
        p_user_agent: req.headers.get('User-Agent') || 'unknown',
        p_success: false
      })

      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Admin access required.' }),
        { status: 403, headers: corsHeaders }
      )
    }

    // Parse request body
    const { targetUserId, newRole, reason } = await req.json()
    
    if (!targetUserId || !newRole) {
      return new Response(
        JSON.stringify({ error: 'Target user ID and new role are required' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate role
    const validRoles = ['client', 'professional', 'admin']
    if (!validRoles.includes(newRole)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role specified' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Use the secure database function for role updates
    const { data: result, error: roleUpdateError } = await supabase.rpc('admin_update_user_role', {
      p_target_user_id: targetUserId,
      p_new_role: newRole,
      p_reason: reason || 'Admin role change'
    })

    if (roleUpdateError) {
      console.error('Role update failed:', roleUpdateError)
      return new Response(
        JSON.stringify({ error: roleUpdateError.message }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Update the user's metadata in the auth system
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      targetUserId,
      {
        user_metadata: { user_type: newRole }
      }
    )

    if (authUpdateError) {
      console.error('Auth metadata update failed:', authUpdateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update user authentication metadata' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('User role successfully updated:', {
      targetUserId,
      newRole,
      updatedBy: user.id
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        result: result,
        message: `User role successfully updated to ${newRole}`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error during role update:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred. Please try again later.' 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})