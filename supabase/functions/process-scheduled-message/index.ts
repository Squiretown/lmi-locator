
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Timeout helper with label logging
async function withTimeout<T>(promise: Promise<T>, ms: number, label?: string): Promise<T> {
  const started = Date.now();
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms${label ? ` during ${label}` : ''}`)), ms))
  ]).finally(() => {
    if (label) console.log(`[process-scheduled-message] ${label} took ${Date.now() - started}ms`);
  });
}


interface ScheduledMessage {
  id: string;
  title: string;
  message: string;
  delivery_method: string;
  recipient_type: 'single' | 'bulk';
  recipient_id?: string;
  recipient_filter?: {
    user_filter: string;
    user_type?: string;
    target_count: number;
  };
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const start = Date.now();
    const budgetMs = 24000; // leave headroom under platform limit

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { messageId } = await req.json();

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'Message ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the scheduled message
    const { data: scheduledMessage, error: fetchError } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('id', messageId)
      .eq('status', 'scheduled')
      .single();

    if (fetchError || !scheduledMessage) {
      console.error('Error fetching scheduled message:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Scheduled message not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const message = scheduledMessage as ScheduledMessage;
    const deliveryMethods = message.delivery_method.split(',').map(m => m.trim());
    let targetUsers: string[] = [];

    // Get target users based on recipient type
    if (message.recipient_type === 'single' && message.recipient_id) {
      targetUsers = [message.recipient_id];
    } else if (message.recipient_type === 'bulk' && message.recipient_filter) {
      const filter = message.recipient_filter;
      
      if (filter.user_filter === 'all') {
        const { data: allUsers, error } = await supabase
          .from('user_profiles')
          .select('user_id');
        
        if (error) throw error;
        targetUsers = allUsers?.map(u => u.user_id) || [];
      } else if (filter.user_filter === 'by_type' && filter.user_type) {
        // Support both legacy string-based user_type and relational user_type_id via user_types.type_name
        const { data: typedUsersByString, error: typedByStringError } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('user_type', filter.user_type);
        
        if (typedByStringError) throw typedByStringError;
        
        if (typedUsersByString && typedUsersByString.length > 0) {
          targetUsers = typedUsersByString.map(u => u.user_id);
        } else {
          // Fallback to relational model lookup
          const { data: typeRow, error: typeLookupError } = await supabase
            .from('user_types')
            .select('type_id')
            .eq('type_name', filter.user_type)
            .maybeSingle();
          
          if (typeLookupError) throw typeLookupError;
          
          if (typeRow?.type_id) {
            const { data: typedUsersById, error: typedByIdError } = await supabase
              .from('user_profiles')
              .select('user_id')
              .eq('user_type_id', typeRow.type_id);
            
            if (typedByIdError) throw typedByIdError;
            targetUsers = typedUsersById?.map(u => u.user_id) || [];
          } else {
            targetUsers = [];
          }
        }
      }
    }

    if (targetUsers.length === 0) {
      // Mark as failed
      await supabase
        .from('scheduled_messages')
        .update({ 
          status: 'failed', 
          error_message: 'No target users found',
          sent_at: new Date().toISOString()
        })
        .eq('id', messageId);

      return new Response(
        JSON.stringify({ error: 'No target users found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let notificationsCreated = 0;
    let emailsSent = 0;
    let emailsFailed = 0;

    // Send in-app notifications if selected
    if (deliveryMethods.includes('in_app')) {
      const bulkMessageId = crypto.randomUUID();
      const notifications = targetUsers.map(userId => ({
        user_id: userId,
        title: message.title,
        message: message.message,
        notification_type: 'admin_message',
        priority: 'normal',
        bulk_message_id: bulkMessageId,
        is_read: false,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) {
        console.error('Error creating notifications:', error);
      } else {
        notificationsCreated = targetUsers.length;
      }
    }

    // Send emails if selected
    if (deliveryMethods.includes('email')) {
      const processBatches = async (startIndex: number) => {
        const batchSize = 5;
        for (let i = startIndex; i < targetUsers.length; i += batchSize) {
          // If we're close to the time budget, offload remaining work
          if (Date.now() - start > budgetMs) {
            try {
              // @ts-ignore - EdgeRuntime may exist in Supabase Edge
              globalThis.EdgeRuntime?.waitUntil?.(processBatches(i));
            } catch (_) {}
            break;
          }

          const batch = targetUsers.slice(i, i + batchSize);
          const emailPromises = batch.map(async (userId) => {
            try {
              const { error: emailError } = await withTimeout(
                supabase.functions.invoke('send-user-email', {
                  body: { userId, subject: message.title, message: message.message },
                }),
                6000,
                `send-user-email ${userId}`
              );
              if (emailError) throw emailError;
              return { success: true, userId };
            } catch (error) {
              console.error(`Failed to send email to user ${userId}:`, error);
              return { success: false, userId };
            }
          });

          const results = await Promise.allSettled(emailPromises);
          emailsSent += results.filter(r => r.status === 'fulfilled' && (r as PromiseFulfilledResult<any>).value.success).length;
          emailsFailed += results.filter(r => r.status === 'fulfilled' && !(r as PromiseFulfilledResult<any>).value.success).length;

          // Small delay between batches
          if (i + batchSize < targetUsers.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      };

      await processBatches(0);
    }

    // Update scheduled message status
    const updateData: any = {
      status: 'sent',
      sent_at: new Date().toISOString()
    };

    if (emailsFailed > 0) {
      updateData.error_message = `${emailsFailed} emails failed to send`;
    }

    await supabase
      .from('scheduled_messages')
      .update(updateData)
      .eq('id', messageId);

    const result = {
      success: true,
      targetUsers: targetUsers.length,
      notificationsCreated,
      emailsSent,
      emailsFailed
    };

    console.log('Scheduled message processed:', result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error processing scheduled message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);
