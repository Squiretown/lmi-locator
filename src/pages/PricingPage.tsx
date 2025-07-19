
import React from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Pricing</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Choose the plan that fits your needs
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg border">
              <h3 className="text-2xl font-semibold mb-4">Basic</h3>
              <div className="text-3xl font-bold mb-2">$29<span className="text-lg text-muted-foreground">/month</span></div>
              <ul className="text-left space-y-2 mb-6">
                <li>✓ 100 address checks/month</li>
                <li>✓ Basic eligibility reports</li>
                <li>✓ Email support</li>
              </ul>
              <Button className="w-full">Get Started</Button>
            </div>
            
            <div className="bg-card p-8 rounded-lg border border-primary">
              <h3 className="text-2xl font-semibold mb-4">Professional</h3>
              <div className="text-3xl font-bold mb-2">$79<span className="text-lg text-muted-foreground">/month</span></div>
              <ul className="text-left space-y-2 mb-6">
                <li>✓ 500 address checks/month</li>
                <li>✓ Advanced reporting</li>
                <li>✓ Client management tools</li>
                <li>✓ Priority support</li>
              </ul>
              <Button className="w-full">Most Popular</Button>
            </div>
            
            <div className="bg-card p-8 rounded-lg border">
              <h3 className="text-2xl font-semibold mb-4">Enterprise</h3>
              <div className="text-3xl font-bold mb-2">$199<span className="text-lg text-muted-foreground">/month</span></div>
              <ul className="text-left space-y-2 mb-6">
                <li>✓ Unlimited address checks</li>
                <li>✓ Custom integrations</li>
                <li>✓ Team management</li>
                <li>✓ Dedicated support</li>
              </ul>
              <Button className="w-full">Contact Sales</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
