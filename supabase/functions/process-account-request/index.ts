// supabase/functions/process-account-request/index.ts
// This handles admin approval/rejection of account cancellation/deletion requests

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { notificationId, action, adminComments } = await req.json()

    if (!notificationId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the notification to extract user info
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single()

    if (notificationError || !notification) {
      return new Response(
        JSON.stringify({ error: 'Notification not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const requestingUserId = notification.data?.requesting_user_id
    const requestType = notification.data?.request_type

    if (!requestingUserId) {
      return new Response(
        JSON.stringify({ error: 'Invalid notification data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update notification status
    await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        data: {
          ...notification.data,
          processed_at: new Date().toISOString(),
          action,
          admin_comments: adminComments
        }
      })
      .eq('id', notificationId)

    const isAccountDeletion = requestType === 'account_deletion'
    const isAccountCancellation = requestType === 'account_cancellation'

    if (action === 'approve') {
      // Get user info before deletion
      const { data: requestingUser } = await supabase.auth.admin.getUserById(requestingUserId)

      if (isAccountDeletion) {
        // ✅ FIXED: Call cleanup function BEFORE deleting auth user
        console.log(`Calling delete_user_references for user ${requestingUserId}`)
        const { data: cleanupData, error: cleanupError } = await supabase
          .rpc('delete_user_references', { p_target_user_id: requestingUserId })

        if (cleanupError) {
          console.error('Cleanup function error:', cleanupError)
          // Continue with deletion - CASCADE constraints will help
        } else {
          console.log('Cleanup completed:', cleanupData)
        }

        // Now delete from auth
        const { error: deleteError } = await supabase.auth.admin.deleteUser(requestingUserId)
        
        if (deleteError) {
          console.error('Error deleting user:', deleteError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to delete user account',
              details: deleteError.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`User ${requestingUserId} successfully deleted`)

      } else if (isAccountCancellation) {
        // For account cancellation, deactivate but don't delete
        const { error: updateUserError } = await supabase.auth.admin.updateUserById(requestingUserId, {
          user_metadata: {
            ...requestingUser?.user?.user_metadata,
            account_status: 'cancelled',
            cancelled_at: new Date().toISOString()
          }
        })
        
        if (updateUserError) {
          console.error('Error updating user status:', updateUserError)
          return new Response(
            JSON.stringify({ 
              error: 'Failed to cancel user account',
              details: updateUserError.message 
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Send confirmation notification to the requesting user (only if user still exists)
    const confirmationMessage = action === 'approve' 
      ? `Your account ${isAccountCancellation ? 'cancellation' : 'deletion'} request has been approved and processed.`
      : `Your account ${isAccountCancellation ? 'cancellation' : 'deletion'} request has been rejected. ${adminComments ? `Reason: ${adminComments}` : ''}`

    // Only send notification if user still exists (not deleted)
    if (action !== 'approve' || !isAccountDeletion) {
      const { error: confirmNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: requestingUserId,
          title: `Account ${isAccountCancellation ? 'Cancellation' : 'Deletion'} Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          message: confirmationMessage,
          notification_type: 'account_status',
          is_read: false,
          priority: 'high'
        })

      if (confirmNotificationError) {
        console.error('Error sending confirmation notification:', confirmNotificationError)
      }
    }

    console.log(`Account ${isAccountCancellation ? 'cancellation' : 'deletion'} request ${action}d for user ${requestingUserId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Account request ${action}d successfully` 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )

  } catch (error: any) {
    console.error('Error processing account request:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process account request',
        details: error 
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
}

serve(handler)