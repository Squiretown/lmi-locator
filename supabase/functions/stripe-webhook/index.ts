import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep("Webhook signature verified");
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err instanceof Error ? err.message : String(err) });
        return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
    } else {
      // Parse without verification (dev mode)
      event = JSON.parse(body);
      logStep("Webhook parsed without signature verification (dev mode)");
    }

    logStep("Processing event", { type: event.type, id: event.id });

    // Helper to get user_id from Stripe customer
    const getUserIdFromCustomer = async (customerId: string): Promise<string | null> => {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return null;
      
      // Check metadata first
      if (customer.metadata?.user_id) {
        return customer.metadata.user_id;
      }
      
      // Fallback to email lookup
      if (customer.email) {
        const { data: users } = await supabaseClient.auth.admin.listUsers();
        const user = users.users.find(u => u.email === customer.email);
        return user?.id || null;
      }
      
      return null;
    };

    // Helper to promote user to pro role (Stripe-backed, not admin-granted)
    const promoteUserToPro = async (userId: string): Promise<void> => {
      // Update user_roles - reset admin grant fields since this is Stripe-backed
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .update({ 
          role: 'pro',
          is_admin_grant: false,
          granted_by: null,
          granted_at: null,
          grant_expires_at: null,
          grant_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (roleError) {
        logStep("Error updating user role to pro", { error: roleError.message, userId });
      } else {
        logStep("User promoted to pro via Stripe subscription", { userId });
      }

      // Ensure profile status is active
      await supabaseClient
        .from('user_profiles')
        .update({ status: 'active' })
        .eq('user_id', userId);
    };

    // Helper to handle subscription cancellation
    const handleSubscriptionCancelled = async (userId: string): Promise<void> => {
      // Check if user has admin-granted access that should be preserved
      const { data: roleData } = await supabaseClient
        .from('user_roles')
        .select('is_admin_grant, grant_expires_at')
        .eq('user_id', userId)
        .single();

      // If valid admin grant exists, don't touch anything
      if (roleData?.is_admin_grant) {
        const expiresAt = roleData.grant_expires_at;
        if (!expiresAt || new Date(expiresAt) > new Date()) {
          logStep("User has valid admin grant, preserving access", { userId });
          return;
        }
      }

      // Mark profile as 'cancelled' - shows proper "subscription ended" message
      const { error } = await supabaseClient
        .from('user_profiles')
        .update({ status: 'cancelled' })
        .eq('user_id', userId);

      if (!error) {
        logStep("User marked as cancelled (subscription ended)", { userId });
      }
    };

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", { sessionId: session.id });

        if (!session.customer || !session.subscription) {
          logStep("No customer or subscription in session");
          break;
        }

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

        const userId = await getUserIdFromCustomer(customerId);
        if (!userId) {
          logStep("Could not find user for customer", { customerId });
          break;
        }

        // Get full subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Upsert subscription record
        const { error: upsertError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'stripe_subscription_id',
          });

        if (upsertError) {
          logStep("Error upserting subscription", { error: upsertError.message });
        } else {
          logStep("Subscription upserted", { userId, status: subscription.status });
          // Promote user to pro after successful subscription
          await promoteUserToPro(userId);
        }

        // Update billing history
        await supabaseClient
          .from('billing_history')
          .update({ status: 'completed' })
          .eq('stripe_payment_intent_id', session.id);

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription event", { type: event.type, subscriptionId: subscription.id });

        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        const userId = await getUserIdFromCustomer(customerId);

        if (!userId) {
          logStep("Could not find user for customer", { customerId });
          break;
        }

        // Upsert subscription record
        const { error: upsertError } = await supabaseClient
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'stripe_subscription_id',
          });

        if (!upsertError) {
          logStep("Subscription upserted", { userId, status: subscription.status });
          
          // Promote to pro if subscription is active or trialing
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            await promoteUserToPro(userId);
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", { subscriptionId: subscription.id });

        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        const userId = await getUserIdFromCustomer(customerId);

        if (!userId) {
          logStep("Could not find user for customer", { customerId });
          break;
        }

        // Mark subscription as canceled in database
        const { error } = await supabaseClient
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (!error) {
          logStep("Subscription marked as canceled", { userId });
          // Handle cancellation - update profile status
          await handleSubscriptionCancelled(userId);
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment succeeded", { invoiceId: invoice.id });

        if (invoice.subscription) {
          const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
          
          // Update subscription status
          await supabaseClient
            .from('subscriptions')
            .update({ 
              status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Invoice payment failed", { invoiceId: invoice.id });

        if (invoice.subscription) {
          const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
          
          // Update subscription status to past_due
          await supabaseClient
            .from('subscriptions')
            .update({ 
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
        }

        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});