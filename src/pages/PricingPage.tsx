import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  billing_period: string;
  is_popular: boolean;
  features: string[];
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlansAndUser();
  }, []);

  const loadPlansAndUser = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Get user's current plan if logged in
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select(`
            current_plan_id,
            subscription_plans!current_plan_id (name)
          `)
          .eq('user_id', user.id)
          .single();
        
        setUserPlan((profile?.subscription_plans as any)?.name || null);
      }

      // Load subscription plans
      const { data: plansData, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      setPlans(plansData || []);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    if (planName === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    try {
      toast.loading('Redirecting to payment...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planName }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to start checkout process');
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${(price / 100).toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-96 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Start free and upgrade as you grow. Cancel anytime.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.is_popular ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.display_name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {formatPrice(plan.price)}
                    {plan.price > 0 && (
                      <span className="text-lg text-muted-foreground">
                        /{plan.billing_period}
                      </span>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  {userPlan === plan.name ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : plan.name === 'enterprise' ? (
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => window.open('mailto:support@example.com?subject=Enterprise Plan Inquiry', '_blank')}
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade(plan.name)}
                      variant={plan.is_popular ? 'default' : 'outline'}
                    >
                      {plan.name === 'free' ? 'Get Started' : 'Upgrade Now'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {currentUser && (
            <div className="mt-12 p-6 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Need to manage your subscription?</h3>
              <p className="text-muted-foreground mb-4">
                Access your billing portal to update payment methods, view invoices, or cancel your subscription.
              </p>
              <Button 
                variant="outline" 
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.functions.invoke('customer-portal');
                    if (error) throw error;
                    if (data?.url) window.open(data.url, '_blank');
                  } catch (error) {
                    toast.error('Failed to open billing portal');
                  }
                }}
              >
                Manage Subscription
              </Button>
            </div>
          )}
          
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
              <div>
                <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-muted-foreground">
                  We accept all major credit cards and debit cards through our secure payment processor.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Is there a free trial?</h4>
                <p className="text-muted-foreground">
                  Yes, all accounts start with our free plan. No credit card required to get started.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How do I cancel my subscription?</h4>
                <p className="text-muted-foreground">
                  You can cancel anytime through your billing portal. Your subscription remains active until the end of your billing period.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;