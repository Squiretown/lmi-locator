
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { Link } from 'react-router-dom';

const PricingTier: React.FC<{
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}> = ({ name, price, description, features, buttonText, popular }) => (
  <Card className={`flex flex-col ${popular ? 'border-primary shadow-lg relative' : ''}`}>
    {popular && (
      <div className="absolute -top-4 left-0 right-0 mx-auto w-fit bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
        Most Popular
      </div>
    )}
    <CardHeader className={`${popular ? 'pt-8' : ''}`}>
      <CardTitle>{name}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <div className="mt-4">
        <span className="text-3xl font-bold">{price}</span>
        {price !== 'Free' && <span className="text-muted-foreground ml-2">/month</span>}
      </div>
    </CardHeader>
    <CardContent className="flex-grow">
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex gap-3">
            <CheckIcon className="h-5 w-5 text-primary flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button className={`w-full ${popular ? 'bg-primary hover:bg-primary/90' : ''}`} asChild>
        <Link to="/login?tab=signup">{buttonText}</Link>
      </Button>
    </CardFooter>
  </Card>
);

const PricingPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Pricing | LMICHECK.COM</title>
        <meta 
          name="description" 
          content="Explore our pricing plans for LMI property checking and find the right plan for your needs." 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <PageHeader 
          title="Simple, Transparent Pricing" 
          description="Choose the plan that's right for you"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <PricingTier 
            name="Basic" 
            price="Free" 
            description="For individuals looking to check a single property"
            features={[
              "Single property LMI eligibility check",
              "Basic program eligibility screening",
              "Property report generation",
              "Limited searches per month"
            ]}
            buttonText="Sign Up Free"
          />
          
          <PricingTier 
            name="Professional" 
            price="$49.99" 
            description="For realtors and mortgage professionals"
            features={[
              "Unlimited property LMI checks",
              "Advanced program matching",
              "Client management tools",
              "Marketing list generation",
              "Property history tracking",
              "Email notifications"
            ]}
            buttonText="Choose Professional"
            popular
          />
          
          <PricingTier 
            name="Enterprise" 
            price="$149.99" 
            description="For teams and organizations"
            features={[
              "All Professional features",
              "Team member accounts",
              "API access for integration",
              "Bulk property checking",
              "Advanced analytics dashboard",
              "White-label reports",
              "Priority support"
            ]}
            buttonText="Choose Enterprise"
          />
        </div>
      </div>
    </>
  );
};

export default PricingPage;
