import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

const MortgageAnalytics: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Search Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          View analytics for your LMI searches and marketing campaigns
        </p>
      </div>
      
      <Card className="text-center py-12">
        <CardContent className="space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl">Search Analytics Coming Soon</CardTitle>
            <CardDescription className="text-lg max-w-md mx-auto">
              We're building detailed analytics to help you track LMI searches, client engagement, and marketing campaign performance.
            </CardDescription>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              This feature is currently under development
            </p>
            <p className="text-sm text-muted-foreground">
              Check back soon for updates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MortgageAnalytics;