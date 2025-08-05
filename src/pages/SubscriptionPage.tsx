import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';
import { UsageTracker } from '@/components/subscription/UsageTracker';
import { ArrowLeft, CreditCard, BarChart3, Settings, HelpCircle } from 'lucide-react';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Subscription & Billing</h1>
                <p className="text-muted-foreground">
                  Manage your subscription, track usage, and update billing information
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Status & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              <SubscriptionStatus />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/pricing')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    View All Plans
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('mailto:support@example.com?subject=Billing Support', '_blank')}
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Usage & Analytics */}
            <div className="lg:col-span-2 space-y-6">
              <UsageTracker />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Billing History
                  </CardTitle>
                  <CardDescription>
                    View your recent billing transactions and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No billing history available yet.</p>
                    <p className="text-sm">
                      Your billing history will appear here after your first payment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Features</CardTitle>
                  <CardDescription>
                    Features included in your current plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Included Features</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ Basic property search</li>
                        <li>✓ Save properties</li>
                        <li>✓ Email support</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Upgrade for More</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Advanced analytics</li>
                        <li>• Client management</li>
                        <li>• Team collaboration</li>
                        <li>• Priority support</li>
                      </ul>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;