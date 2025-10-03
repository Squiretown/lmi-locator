import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Check for security alerts
    const { data: alerts, error } = await supabaseClient.rpc('check_security_alerts', {
      p_since: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // Last hour
      p_severity: ['critical', 'high'],
      p_unacknowledged_only: true
    });

    if (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }

    console.log(`Found ${alerts?.length || 0} security alerts`);

    // Filter for critical alerts
    const criticalAlerts = alerts?.filter((a: any) => a.severity === 'critical') || [];
    
    if (criticalAlerts.length > 0) {
      console.log(`Sending email for ${criticalAlerts.length} critical alert(s)`);
      
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      
      if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        throw new Error('RESEND_API_KEY not configured');
      }

      // Format email body
      const emailBody = criticalAlerts.map((alert: any) => `
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #dc2626; background: #fee;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">🚨 ${alert.message}</h3>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${alert.alert_type}</p>
          <p style="margin: 5px 0;"><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Event Count:</strong> ${alert.event_count}</p>
          <p style="margin: 5px 0;"><strong>First Seen:</strong> ${new Date(alert.first_seen).toLocaleString()}</p>
          <p style="margin: 5px 0;"><strong>Last Seen:</strong> ${new Date(alert.last_seen).toLocaleString()}</p>
          ${alert.ip_addresses?.length > 0 ? `<p style="margin: 5px 0;"><strong>IP Addresses:</strong> ${alert.ip_addresses.join(', ')}</p>` : ''}
        </div>
      `).join('');

      // Send email via Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'alerts@support247.solutions',
          to: ['info@squiretown.co'],
          subject: `🚨 CRITICAL: ${criticalAlerts.length} Security Alert(s) Detected`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                    line-height: 1.6;
                    color: #333;
                  }
                  .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                  }
                  .header { 
                    background: #dc2626; 
                    color: white; 
                    padding: 20px; 
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                  }
                  .header h1 {
                    margin: 0;
                    font-size: 24px;
                  }
                  .content { 
                    padding: 20px;
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-top: none;
                  }
                  .footer { 
                    text-align: center; 
                    padding: 20px; 
                    color: #666; 
                    font-size: 12px;
                    background: #f9fafb;
                    border-radius: 0 0 8px 8px;
                  }
                  .button {
                    display: inline-block;
                    background: #dc2626;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    margin: 20px 0;
                    font-weight: 600;
                  }
                  .summary {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🚨 Critical Security Alert</h1>
                    <p style="margin: 10px 0 0 0;">${criticalAlerts.length} critical security event(s) detected</p>
                  </div>
                  <div class="content">
                    <div class="summary">
                      <strong>Summary:</strong><br>
                      Total Events: ${criticalAlerts.reduce((sum: number, a: any) => sum + a.event_count, 0)}<br>
                      Unique Alert Types: ${new Set(criticalAlerts.map((a: any) => a.alert_type)).size}<br>
                      Time: ${new Date().toLocaleString()}
                    </div>
                    
                    <h2 style="margin-top: 30px;">Alert Details:</h2>
                    ${emailBody}
                    
                    <p style="margin-top: 30px; text-align: center;">
                      <a href="https://yourdomain.com/admin/security" class="button">
                        View Security Dashboard
                      </a>
                    </p>
                  </div>
                  <div class="footer">
                    <p>This is an automated security notification from your system.</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                    <p style="margin-top: 10px;">
                      If you did not expect this email, please contact your system administrator immediately.
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Resend API error:', errorText);
        throw new Error(`Failed to send email: ${errorText}`);
      }

      const emailResult = await emailResponse.json();
      console.log('Email sent successfully:', emailResult);
    } else {
      console.log('No critical alerts to send');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alertCount: alerts?.length || 0,
        criticalCount: criticalAlerts.length,
        emailSent: criticalAlerts.length > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    console.error('Error in security-alert-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    );
  }
});
