import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('Starting nightly cleanup job...')

    // 1. Update expired invitations status
    const { data: expiredInvitations, error: expiredError } = await supabase
      .from('client_invitations')
      .update({ status: 'expired' })
      .lt('expires_at', new Date().toISOString())
      .eq('status', 'pending')
      .select('id')

    if (expiredError) {
      console.error('Error updating expired invitations:', expiredError)
      throw expiredError
    }

    console.log(`Updated ${expiredInvitations?.length || 0} expired invitations`)

    // 2. Clean up old revoked invitations (older than 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: deletedInvitations, error: deleteError } = await supabase
      .from('client_invitations')
      .delete()
      .eq('status', 'revoked')
      .lt('updated_at', thirtyDaysAgo.toISOString())
      .select('id')

    if (deleteError) {
      console.error('Error deleting old revoked invitations:', deleteError)
      throw deleteError
    }

    console.log(`Deleted ${deletedInvitations?.length || 0} old revoked invitations`)

    // 3. Clean up orphaned records
    const { data: orphanedInvitations, error: orphanedError } = await supabase
      .from('client_invitations')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 days old
      .select('id')

    if (orphanedError) {
      console.error('Error cleaning orphaned invitations:', orphanedError)
      throw orphanedError
    }

    console.log(`Cleaned up ${orphanedInvitations?.length || 0} orphaned invitations`)

    // 4. Update invitation statistics
    const { data: stats, error: statsError } = await supabase
      .from('client_invitations')
      .select('status, count(*)')
      .order('status')

    if (statsError) {
      console.error('Error fetching invitation statistics:', statsError)
    } else {
      console.log('Invitation statistics:', stats)
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      actions: {
        expired_invitations_updated: expiredInvitations?.length || 0,
        old_revoked_invitations_deleted: deletedInvitations?.length || 0,
        orphaned_invitations_cleaned: orphanedInvitations?.length || 0
      },
      statistics: stats
    }

    console.log('Nightly cleanup completed successfully:', summary)

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Nightly cleanup failed:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})