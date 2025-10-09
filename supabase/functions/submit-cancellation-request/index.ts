import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CancellationRequest {
  currentPassword: string;
  userEmail: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Create regular client for user authentication
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { currentPassword }: { currentPassword: string } = await req.json();

    if (!currentPassword) {
      return new Response(JSON.stringify({ error: 'Current password is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get current user from the session
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify password by attempting to sign in
    const { error: verifyError } = await supabaseUser.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (verifyError) {
      console.error('Password verification failed:', verifyError);
      return new Response(JSON.stringify({ 
        error: 'Incorrect password. Please verify your current password and try again.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all admin users using service role (bypasses RLS)
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id')
      .eq('user_type', 'admin');

    if (adminError) {
      console.error('Error fetching admin users:', adminError);
      return new Response(JSON.stringify({ 
        error: `Failed to fetch administrators: ${adminError.message}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.error('No admin users found');
      return new Response(JSON.stringify({ 
        error: 'No administrators found in the system. Please contact support directly.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notifications for all admin users
    const adminNotifications = adminUsers.map(admin => ({
      user_id: admin.user_id,
      notification_type: 'account_cancellation_request',
      title: 'Account Cancellation Request',
      message: `User ${user.email} has requested account cancellation. Please review and approve.`,
      is_read: false,
      priority: 'high',
      data: {
        requesting_user_id: user.id,
        requesting_user_email: user.email,
        request_type: 'account_cancellation'
      }
    }));

    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert(adminNotifications);

    if (notificationError) {
      console.error('Error creating cancellation request:', notificationError);
      console.error('Notification error details:', JSON.stringify(notificationError, null, 2));
      console.error('Attempted to insert:', JSON.stringify(adminNotifications, null, 2));
      return new Response(JSON.stringify({ 
        error: 'Failed to submit cancellation request. Please try again.',
        details: notificationError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Account cancellation request submitted for user ${user.email}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Account cancellation request submitted successfully. An admin will review your request.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in submit-cancellation-request function:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred. Please try again.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);