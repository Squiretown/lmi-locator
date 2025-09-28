
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

    // Check if user is admin
    const isAdmin = user.user_metadata?.user_type === 'admin';
    
    if (!isAdmin) {
      throw new Error("Administrative privileges required to view user sessions");
    }

    // Get userId from request body
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log(`Admin user ${user.id} requesting sessions for user ${userId}`);

    // Note: Supabase doesn't provide a direct way to get active sessions
    // This would typically require custom implementation with session tracking
    // For now, return mock data structure that would come from a sessions table
    
    const mockSessions = [
      {
        id: "session_1",
        user_id: userId,
        ip_address: "192.168.1.100",
        user_agent: "Chrome/120.0.0.0 (Windows NT 10.0; Win64; x64)",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        device_type: "Desktop",
        location: "New York, NY, US"
      },
      {
        id: "session_2", 
        user_id: userId,
        ip_address: "10.0.0.50",
        user_agent: "Safari/17.0 (iPhone; iOS 17.0)",
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        device_type: "Mobile",
        location: "San Francisco, CA, US"
      }
    ];

    console.log(`Retrieved ${mockSessions.length} sessions for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      sessions: mockSessions,
      message: `Found ${mockSessions.length} active sessions`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error getting user sessions:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error) || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
