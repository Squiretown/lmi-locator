
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Create a Supabase client with admin privileges
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    console.log("Creating error logging tables...");
    
    // Create LMI search error logs table
    const { error: lmiErrorTableError } = await supabase.rpc('create_lmi_error_logs_table');
    
    if (lmiErrorTableError) {
      throw new Error(`Failed to create LMI error logs table: ${lmiErrorTableError.message}`);
    }
    
    // Create edge function error logs table
    const { error: edgeFunctionErrorTableError } = await supabase.rpc('create_edge_function_error_logs_table');
    
    if (edgeFunctionErrorTableError) {
      throw new Error(`Failed to create edge function error logs table: ${edgeFunctionErrorTableError.message}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Error logging tables created successfully" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error creating tables:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
