import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequestBody {
  notificationId: string;
  action: 'approve' | 'reject';
  adminComments?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Verify user is admin
    const userType = user.user_metadata?.user_type;
    if (userType !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const { notificationId, action, adminComments }: ProcessRequestBody = await req.json();

    // Get the notification details
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();

    if (notificationError || !notification) {
      throw new Error('Notification not found');
    }

    const isAccountCancellation = notification.notification_type === 'account_cancellation';
    const isAccountDeletion = notification.notification_type === 'account_deletion';

    if (!isAccountCancellation && !isAccountDeletion) {
      throw new Error('Invalid notification type');
    }

    // Get the requesting user's information
    const requestingUserId = notification.data?.user_id || notification.user_id;
    const { data: requestingUser, error: userDataError } = await supabase.auth.admin.getUserById(requestingUserId);

    if (userDataError || !requestingUser) {
      throw new Error('Requesting user not found');
    }

    // Update notification with admin decision
    const { error: updateError } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        data: {
          ...notification.data,
          status: action,
          processed_at: new Date().toISOString(),
          processed_by: user.id,
          admin_comments: adminComments
        }
      })
      .eq('id', notificationId);

    if (updateError) throw updateError;

    if (action === 'approve') {
      if (isAccountDeletion) {
        // For account deletion, actually delete the user
        const { error: deleteError } = await supabase.auth.admin.deleteUser(requestingUserId);
        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          // Continue with notification updates even if deletion fails
        }
      } else if (isAccountCancellation) {
        // For account cancellation, deactivate but don't delete
        // This could involve setting a status flag in user_metadata or a profiles table
        const { error: updateUserError } = await supabase.auth.admin.updateUserById(requestingUserId, {
          user_metadata: {
            ...requestingUser.user.user_metadata,
            account_status: 'cancelled',
            cancelled_at: new Date().toISOString()
          }
        });
        
        if (updateUserError) {
          console.error('Error updating user status:', updateUserError);
        }
      }
    }

    // Send confirmation notification to the requesting user
    const confirmationMessage = action === 'approve' 
      ? `Your account ${isAccountCancellation ? 'cancellation' : 'deletion'} request has been approved and processed.`
      : `Your account ${isAccountCancellation ? 'cancellation' : 'deletion'} request has been rejected. ${adminComments ? `Reason: ${adminComments}` : ''}`;

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
        });

      if (confirmNotificationError) {
        console.error('Error sending confirmation notification:', confirmNotificationError);
      }
    }

    console.log(`Account ${isAccountCancellation ? 'cancellation' : 'deletion'} request ${action}d for user ${requestingUserId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Account request ${action}d successfully` 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error processing account request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process account request' 
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);