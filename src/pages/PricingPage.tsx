
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Header from '@/components/Header';
import { Link } from 'react-router-dom';
import { getSubscriptionPlans, getPlanLimits } from '@/lib/supabase/subscriptions';

interface DynamicPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price: number;
  billing_period: string;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
  features: string[];
  limits?: any[];
}

const PricingTier: React.FC<{
  plan: DynamicPlan;
}> = ({ plan }) => {
  const formatPrice = (price: number, period: string) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const getButtonText = (plan: DynamicPlan) => {
    if (plan.price === 0) return 'Sign Up Free';
    return `Choose ${plan.display_name}`;
  };

  return (
    <Card className={`flex flex-col ${plan.is_popular ? 'border-primary shadow-lg relative' : ''}`}>
      {plan.is_popular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
      )}
      <CardHeader className={`${plan.is_popular ? 'pt-8' : ''}`}>
        <CardTitle>{plan.display_name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">{formatPrice(plan.price, plan.billing_period)}</span>
          {plan.price !== 0 && <span className="text-muted-foreground ml-2">/{plan.billing_period}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex gap-3">
              <CheckIcon className="h-5 w-5 text-primary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* Display limits if available */}
        {plan.limits && plan.limits.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Plan Limits:</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {plan.limits.map((limit, index) => (
                <div key={index} className="flex justify-between">
                  <span>{limit.resource_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                  <span>{limit.limit_value === -1 ? 'Unlimited' : limit.limit_value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className={`w-full ${plan.is_popular ? 'bg-primary hover:bg-primary/90' : ''}`} asChild>
          <Link to="/login?tab=signup">{getButtonText(plan)}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<DynamicPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricingPlans();
  }, []);

  const loadPricingPlans = async () => {
    try {
      setLoading(true);
      const plansData = await getSubscriptionPlans();
      
      // Load limits for each plan
      const plansWithLimits = await Promise.all(
        plansData.map(async (plan) => {
          const limits = await getPlanLimits(plan.id);
          return { ...plan, limits };
        })
      );

      // Sort by sort_order
      plansWithLimits.sort((a, b) => a.sort_order - b.sort_order);
      setPlans(plansWithLimits);
    } catch (error) {
      console.error('Error loading pricing plans:', error);
      // Fallback to default plans if loading fails
      setPlans([
        {
          id: '1',
          name: 'basic',
          display_name: 'Basic',
          description: 'For individuals looking to check a single property',
          price: 0,
          billing_period: 'monthly',
          is_active: true,
          is_popular: false,
          sort_order: 1,
          features: [
            'Single property LMI eligibility check',
            'Basic program eligibility screening',
            'Property report generation',
            'Limited searches per month'
          ]
        },
        {
          id: '2',
          name: 'professional',
          display_name: 'Professional',
          description: 'For realtors and mortgage professionals',
          price: 49.99,
          billing_period: 'monthly',
          is_active: true,
          is_popular: true,
          sort_order: 2,
          features: [
            'Unlimited property LMI checks',
            'Advanced program matching',
            'Client management tools',
            'Marketing list generation',
            'Property history tracking',
            'Email notifications'
          ]
        },
        {
          id: '3',
          name: 'enterprise',
          display_name: 'Enterprise',
          description: 'For teams and organizations',
          price: 149.99,
          billing_period: 'monthly',
          is_active: true,
          is_popular: false,
          sort_order: 3,
          features: [
            'All Professional features',
            'Team member accounts',
            'API access for integration',
            'Bulk property checking',
            'Advanced analytics dashboard',
            'White-label reports',
            'Priority support'
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Pricing | LMICHECK.COM</title>
          <meta 
            name="description" 
            content="Explore our pricing plans for LMI property checking and find the right plan for your needs." 
          />
        </Helmet>
        
        <Header />
        
        <div className="container mx-auto px-4 py-12">
          <PageHeader 
            title="Simple, Transparent Pricing" 
            description="Choose the plan that's right for you"
          />
          
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading pricing plans...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pricing | LMICHECK.COM</title>
        <meta 
          name="description" 
          content="Explore our pricing plans for LMI property checking and find the right plan for your needs." 
        />
      </Helmet>
      
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Simple, Transparent Pricing" 
          description="Choose the plan that's right for you"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {plans.map((plan) => (
            <PricingTier key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </>
  );
};

export default PricingPage;
