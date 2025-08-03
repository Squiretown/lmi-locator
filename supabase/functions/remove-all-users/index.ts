
// This function allows authorized admins to remove all users
// WARNING: This is a destructive operation that cannot be undone

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

// Configure CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    // Check if user is admin
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('user_is_admin');
    
    if (adminCheckError || !isAdmin) {
      throw new Error("Administrative privileges required to perform this action");
    }

    // Get confirmation from request body
    const { confirmation } = await req.json();
    
    if (confirmation !== "CONFIRM_DELETE_ALL_USERS") {
      throw new Error("Invalid confirmation code");
    }

    console.log("Admin user confirmed deletion of all users");

    // List all users except the current admin
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Error listing users: ${listError.message}`);
    }
    
    const usersToDelete = users.users
      .filter(u => u.id !== user.id) // Don't delete the current admin
      .map(u => u.id);
    
    console.log(`Found ${usersToDelete.length} users to delete`);
    
    // Delete users in batches to avoid timeouts
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < usersToDelete.length; i += batchSize) {
      const batch = usersToDelete.slice(i, i + batchSize);
      
      for (const userId of batch) {
        try {
          console.log(`Attempting to delete user ${userId} using delete_user_safely`);
          
          const { data: deleteResult, error: deleteError } = await supabase.rpc('delete_user_safely', {
            target_user_id: userId
          });
          
          if (deleteError) {
            console.error(`Error deleting user ${userId}: ${deleteError.message}`);
            results.push({ 
              userId, 
              success: false, 
              error: deleteError.message,
              errorCode: deleteError.code
            });
          } else if (!deleteResult?.success) {
            console.error(`User deletion failed for ${userId}: ${deleteResult?.message || 'Unknown error'}`);
            results.push({ 
              userId, 
              success: false, 
              error: deleteResult?.message || 'Deletion failed',
              details: deleteResult
            });
          } else {
            console.log(`Successfully deleted user ${userId}:`, deleteResult);
            results.push({ 
              userId, 
              success: true,
              deletedRecords: deleteResult.deleted_records,
              message: deleteResult.message
            });
          }
          
          // Small delay to avoid hitting rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {
          console.error(`Exception deleting user ${userId}: ${e.message}`);
          results.push({ userId, success: false, error: e.message });
        }
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Attempted to delete ${usersToDelete.length} users`,
      results: results,
      deletedCount: results.filter(r => r.success).length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error removing users:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
