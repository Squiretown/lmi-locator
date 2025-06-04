
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
      throw new Error("Administrative privileges required to view audit trail");
    }

    // Get userId and optional filters from request body
    const { userId, timeRange = '7d', eventType = 'all' } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    console.log(`Admin user ${user.id} requesting audit trail for user ${userId}`);

    // Calculate time range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Mock audit trail data - in a real implementation this would come from an audit_logs table
    const mockAuditEvents = [
      {
        id: "audit_1",
        user_id: userId,
        action: "User Login",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        ip_address: "192.168.1.100",
        user_agent: "Chrome/120.0.0.0",
        details: "Successful login from desktop browser",
        result: "success",
        resource_type: "auth",
        resource_id: userId
      },
      {
        id: "audit_2",
        user_id: userId,
        action: "Profile Update",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        ip_address: "192.168.1.100",
        user_agent: "Chrome/120.0.0.0",
        details: "Updated email preferences",
        result: "success",
        resource_type: "profile",
        resource_id: userId
      },
      {
        id: "audit_3",
        user_id: userId,
        action: "Failed Login",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        ip_address: "203.0.113.1",
        user_agent: "Unknown",
        details: "Invalid password attempt from suspicious IP",
        result: "failure",
        resource_type: "auth",
        resource_id: userId
      },
      {
        id: "audit_4",
        user_id: userId,
        action: "API Request",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        ip_address: "192.168.1.100",
        user_agent: "Chrome/120.0.0.0",
        details: "Property search API call",
        result: "success",
        resource_type: "api",
        resource_id: "properties/search"
      }
    ];

    // Filter events based on criteria
    let filteredEvents = mockAuditEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      const inTimeRange = eventDate >= startDate && eventDate <= now;
      const matchesType = eventType === 'all' || event.action.toLowerCase().includes(eventType.toLowerCase());
      return inTimeRange && matchesType;
    });

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log(`Retrieved ${filteredEvents.length} audit events for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      events: filteredEvents,
      total_count: filteredEvents.length,
      time_range: timeRange,
      start_date: startDate.toISOString(),
      end_date: now.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error getting audit trail:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
