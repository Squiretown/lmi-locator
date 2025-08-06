import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check for Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, checking/starting trial");
      
      // Get or create trial plan
      const { data: trialPlan } = await supabaseClient
        .from("subscription_plans")
        .select("*")
        .eq("is_trial", true)
        .single();
      
      if (!trialPlan) {
        throw new Error("No trial plan found");
      }
      
      // Check if user already has a profile with trial info
      const { data: userProfile } = await supabaseClient
        .from("user_profiles")
        .select("trial_started_at, trial_expired, current_plan_id")
        .eq("user_id", user.id)
        .single();
      
      let trialStarted = userProfile?.trial_started_at;
      let trialExpired = userProfile?.trial_expired || false;
      
      // Start trial if not already started
      if (!trialStarted) {
        trialStarted = new Date().toISOString();
        logStep("Starting new trial", { trialStarted });
        
        await supabaseClient
          .from("user_profiles")
          .upsert({
            user_id: user.id,
            current_plan_id: trialPlan.id,
            trial_started_at: trialStarted,
            trial_expired: false,
            subscription_starts_at: trialStarted,
            subscription_ends_at: new Date(Date.now() + trialPlan.trial_period_days * 24 * 60 * 60 * 1000).toISOString()
          }, { onConflict: 'user_id' });
      } else {
        // Check if trial has expired
        const trialEndDate = new Date(trialStarted);
        trialEndDate.setDate(trialEndDate.getDate() + trialPlan.trial_period_days);
        trialExpired = new Date() > trialEndDate;
        
        if (trialExpired && !userProfile?.trial_expired) {
          logStep("Trial expired, updating status");
          await supabaseClient
            .from("user_profiles")
            .update({ trial_expired: true })
            .eq("user_id", user.id);
        }
      }
      
      const daysRemaining = trialExpired ? 0 : Math.max(0, Math.ceil((new Date(trialStarted).getTime() + trialPlan.trial_period_days * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)));
      
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: !trialExpired,
        subscription_tier: trialExpired ? "expired" : "trial",
        subscription_end: trialExpired ? null : new Date(new Date(trialStarted).getTime() + trialPlan.trial_period_days * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      return new Response(JSON.stringify({ 
        subscribed: !trialExpired,
        subscription_tier: trialExpired ? "expired" : "trial",
        subscription_end: trialExpired ? null : new Date(new Date(trialStarted).getTime() + trialPlan.trial_period_days * 24 * 60 * 60 * 1000).toISOString(),
        trial_days_remaining: daysRemaining,
        is_trial: true,
        trial_expired: trialExpired,
        plan_id: trialPlan.id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = 'free';
    let subscriptionEnd = null;
    let planId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Determine tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 999) {
        subscriptionTier = "free";
      } else if (amount <= 3999) {
        subscriptionTier = "professional";
      } else {
        subscriptionTier = "enterprise";
      }
      logStep("Active subscription found", { subscriptionId: subscription.id, tier: subscriptionTier });
    }

    // Get the plan ID for the tier
    const { data: plan } = await supabaseClient
      .from('subscription_plans')
      .select('id')
      .eq('name', subscriptionTier)
      .single();
    
    planId = plan?.id;

    // Update user's plan
    await supabaseClient
      .from('user_profiles')
      .update({ current_plan_id: planId })
      .eq('user_id', user.id);

    // Upsert subscriber record
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier,
      planId 
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      trial_days_remaining: 0,
      is_trial: false,
      trial_expired: false,
      plan_id: planId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});