
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface WebhookPayload {
  type: string;
  table: string;
  record: {
    id: string;
    email: string;
    raw_user_meta_data: string | null; // This comes as a JSON string from the database
    [key: string]: any;
  };
  schema: string;
  old_record: any;
}

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Create Supabase client with admin privileges
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Parse webhook payload
    const payload: WebhookPayload = await req.json();
    
    // Only proceed if this is a new user creation
    if (payload.type !== 'INSERT' || payload.table !== 'users' || payload.schema !== 'auth') {
      return new Response(
        JSON.stringify({ message: 'Not a new user event' }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const user = payload.record;
    
    // Check if the user profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    if (existingProfile) {
      console.log(`User profile already exists for user ${user.id}`);
      return new Response(
        JSON.stringify({ message: 'Profile already exists' }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse metadata safely
    let metadata: any = {};
    try {
      if (user.raw_user_meta_data && typeof user.raw_user_meta_data === 'string') {
        metadata = JSON.parse(user.raw_user_meta_data);
      } else if (user.raw_user_meta_data && typeof user.raw_user_meta_data === 'object') {
        metadata = user.raw_user_meta_data;
      }
    } catch (parseError) {
      console.warn('Failed to parse user metadata:', parseError);
      metadata = {};
    }
    
    // Get user type from metadata or default to 'client'
    const validUserTypes = ['client', 'realtor', 'mortgage_professional'];
    const userType = validUserTypes.includes(metadata.user_type) ? metadata.user_type : 'client';
    
    console.log('Creating user profile:', { 
      userId: user.id, 
      userType, 
      metadata: metadata,
      rawMetadata: user.raw_user_meta_data 
    });
    
    // Create user profile
    const { error: insertError } = await supabase.from('user_profiles').insert({
      user_id: user.id,
      user_type: userType,
      // Add other fields from metadata if available
      company: metadata.company || null,
    });
    
    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Created profile for user ${user.id} with user_type ${userType}`);
    
    return new Response(
      JSON.stringify({ message: 'Profile created successfully' }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
