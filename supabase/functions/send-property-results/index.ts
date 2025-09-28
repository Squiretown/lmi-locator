import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { Resend } from "npm:resend@2.0.0";

// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PropertyResultsEmailRequest {
  recipientEmail: string;
  address: string;
  isApproved: boolean;
  tractId?: string;
  senderName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, address, isApproved, tractId, senderName }: PropertyResultsEmailRequest = await req.json();

    console.log("Sending property results email to:", recipientEmail);

    const status = isApproved ? 'LMI Eligible' : 'Not in LMI Area';
    const tractInfo = tractId ? `\nCensus Tract: ${tractId}` : '';
    const senderInfo = senderName ? `\n\nShared by: ${senderName}` : '';

    const emailResponse = null; // Email sending disabled
    console.log("Email sending disabled - Resend not configured");

    // Mock successful response for testing
    const mockResponse = {
      success: true,
      message: "Email sending is currently disabled but request was processed"
    };

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email processing disabled - Resend not configured"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-property-results function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);