import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('Unsuspend user function called');
    
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header provided' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error('Invalid or expired token:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user is admin
    const adminType = user.user_metadata?.user_type;
    if (adminType !== 'admin') {
      console.error('Unauthorized: User is not admin', { userId: user.id, userType: adminType });
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { userId } = await req.json();

    if (!userId) {
      console.error('Missing userId in request body');
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Attempting to unsuspend user:', userId);

    // Get the target user
    const { data: targetUser, error: fetchError } = await supabase.auth.admin.getUserById(userId);

    if (fetchError || !targetUser.user) {
      console.error('Failed to fetch target user:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prevent unsuspending yourself
    if (targetUser.user.id === user.id) {
      console.error('Admin attempted to unsuspend themselves:', user.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot unsuspend yourself' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prevent unsuspending other admins
    if (targetUser.user.user_metadata?.user_type === 'admin') {
      console.error('Admin attempted to unsuspend another admin:', userId);
      return new Response(
        JSON.stringify({ success: false, error: 'Cannot unsuspend admin users' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clear suspension fields in user metadata
    const currentMetadata = targetUser.user.user_metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      suspended: false,
      suspension_reason: null,
      suspension_end: null,
      suspended_by: null,
      suspended_at: null,
      unsuspended_by: user.id,
      unsuspended_at: new Date().toISOString()
    };

    // Update user metadata to clear suspension
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: updatedMetadata
      }
    );

    if (updateError) {
      console.error('Failed to update user metadata:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to unsuspend user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('User unsuspended successfully:', userId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User unsuspended successfully',
        user: updateData.user
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in unsuspend-user function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});