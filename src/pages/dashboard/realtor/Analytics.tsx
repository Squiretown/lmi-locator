import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const RealtorAnalytics: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          View your business analytics and performance metrics
        </p>
      </div>
      
      <Card className="text-center py-12">
        <CardContent className="space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-2xl">Analytics Dashboard Coming Soon</CardTitle>
            <CardDescription className="text-lg max-w-md mx-auto">
              We're building comprehensive analytics to help you track your business performance and client insights.
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

export default RealtorAnalytics;