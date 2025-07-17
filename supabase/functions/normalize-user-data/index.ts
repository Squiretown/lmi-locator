import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client with admin privileges
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user JWT from request
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      throw new Error("No authorization token provided");
    }

    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid authorization token");
    }

    // Check if user is admin from JWT metadata
    const userType = user.user_metadata?.user_type;
    if (userType !== 'admin') {
      throw new Error("Administrative privileges required to normalize user data");
    }

    console.log(`Admin user ${user.id} starting user data normalization`);

    const issues = [];
    let fixedCount = 0;

    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Failed to fetch auth users: ${authError.message}`);
    }

    console.log(`Found ${authUsers.users.length} auth users to process`);

    for (const authUser of authUsers.users) {
      try {
        const userId = authUser.id;
        const userType = authUser.user_metadata?.user_type || 'client';

        // Check if user_profiles entry exists
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: userId,
              user_type: userType
            });

          if (insertError) {
            issues.push(`Failed to create profile for user ${userId}: ${insertError.message}`);
          } else {
            console.log(`Created missing profile for user ${userId} with type ${userType}`);
            fixedCount++;
          }
        } else if (profileError) {
          issues.push(`Error checking profile for user ${userId}: ${profileError.message}`);
        } else if (profileData && profileData.user_type !== userType) {
          // Profile exists but user_type doesn't match
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ user_type: userType })
            .eq('user_id', userId);

          if (updateError) {
            issues.push(`Failed to update user_type for user ${userId}: ${updateError.message}`);
          } else {
            console.log(`Updated user_type for user ${userId} from ${profileData.user_type} to ${userType}`);
            fixedCount++;
          }
        }

        // For mortgage_professional and realtor users, check if professionals entry exists
        if (userType === 'mortgage_professional' || userType === 'realtor') {
          const { data: professionalData, error: professionalError } = await supabase
            .from('professionals')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (professionalError && professionalError.code === 'PGRST116') {
            // Professional profile doesn't exist, create it
            const { error: insertError } = await supabase
              .from('professionals')
              .insert({
                user_id: userId,
                name: authUser.email?.split('@')[0] || 'Unknown',
                company: 'Not Specified',
                type: userType,
                license_number: 'Not Provided',
                status: 'active'
              });

            if (insertError) {
              issues.push(`Failed to create professional profile for user ${userId}: ${insertError.message}`);
            } else {
              console.log(`Created missing professional profile for user ${userId}`);
              fixedCount++;
            }
          } else if (professionalError) {
            issues.push(`Error checking professional profile for user ${userId}: ${professionalError.message}`);
          }
        }

      } catch (userError) {
        issues.push(`Error processing user ${authUser.id}: ${userError.message}`);
      }
    }

    console.log(`User data normalization complete. Fixed ${fixedCount} issues.`);

    return new Response(JSON.stringify({
      success: true,
      message: `User data normalization complete. Fixed ${fixedCount} issues.`,
      fixedCount,
      issues,
      totalUsers: authUsers.users.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error normalizing user data:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});