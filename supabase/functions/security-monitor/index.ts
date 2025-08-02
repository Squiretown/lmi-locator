import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  eventType: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function analyzeSecurityEvent(event: SecurityEvent): Promise<{
  riskScore: number;
  shouldBlock: boolean;
  recommendations: string[];
}> {
  let riskScore = 0;
  const recommendations: string[] = [];
  
  // Analyze event type
  switch (event.eventType) {
    case 'failed_login':
      riskScore += 30;
      recommendations.push('Monitor for brute force attempts');
      break;
    case 'suspicious_activity':
      riskScore += 50;
      recommendations.push('Investigate user behavior patterns');
      break;
    case 'admin_access_attempt':
      riskScore += 70;
      recommendations.push('Verify admin access credentials');
      break;
    case 'data_export':
      riskScore += 40;
      recommendations.push('Audit data access permissions');
      break;
    case 'password_reset_abuse':
      riskScore += 60;
      recommendations.push('Implement stricter password reset limits');
      break;
    default:
      riskScore += 10;
  }
  
  // Analyze IP patterns
  if (event.ipAddress) {
    try {
      // Check for recent failed attempts from this IP
      const { data: recentEvents } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('ip_address', event.ipAddress)
        .eq('success', false)
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (recentEvents && recentEvents.length > 5) {
        riskScore += 50;
        recommendations.push('IP address showing suspicious activity patterns');
      }
    } catch (error) {
      console.error('Error analyzing IP patterns:', error);
    }
  }
  
  // Check severity override
  if (event.severity === 'critical') {
    riskScore = Math.max(riskScore, 90);
  } else if (event.severity === 'high') {
    riskScore = Math.max(riskScore, 70);
  }
  
  const shouldBlock = riskScore > 80;
  
  return { riskScore, shouldBlock, recommendations };
}

async function processSecurityAlert(event: SecurityEvent, analysis: any) {
  if (analysis.riskScore > 70) {
    console.log(`HIGH RISK SECURITY EVENT: ${event.eventType}`);
    console.log(`Risk Score: ${analysis.riskScore}`);
    console.log(`Recommendations:`, analysis.recommendations);
    
    // In a production environment, you might:
    // - Send notifications to security team
    // - Trigger automated response actions
    // - Update threat intelligence feeds
    // - Integrate with SIEM systems
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const body: SecurityEvent = await req.json();
    
    // Validate required fields
    if (!body.eventType) {
      return new Response(
        JSON.stringify({ error: 'Event type is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Analyze the security event
    const analysis = await analyzeSecurityEvent(body);
    
    // Log the security event with analysis
    const { error: logError } = await supabase.rpc('log_security_event', {
      p_event_type: body.eventType,
      p_user_id: body.userId || user.id,
      p_details: JSON.stringify({
        ...body.details,
        risk_score: analysis.riskScore,
        recommendations: analysis.recommendations
      }),
      p_ip_address: body.ipAddress || req.headers.get('x-forwarded-for') || 'unknown',
      p_user_agent: body.userAgent || req.headers.get('user-agent') || 'unknown',
      p_success: !analysis.shouldBlock
    });

    if (logError) {
      console.error('Failed to log security event:', logError);
    }

    // Process high-risk events
    await processSecurityAlert(body, analysis);

    const response = {
      riskScore: analysis.riskScore,
      shouldBlock: analysis.shouldBlock,
      recommendations: analysis.recommendations,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: analysis.shouldBlock ? 403 : 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in security-monitor function:', error);
    return new Response(
      JSON.stringify({ error: 'Security monitoring failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);