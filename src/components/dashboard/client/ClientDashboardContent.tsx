
import React, { useEffect, useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { useClientActivity, type ActivityItem } from '@/hooks/useClientActivity';
import PropertyChecker from '@/components/PropertyChecker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, PlusCircle } from 'lucide-react';

export function ClientDashboardContent() {
  const { activities, isLoading, addActivity } = useClientActivity();
  const [showPropertyChecker, setShowPropertyChecker] = useState(false);
  
  return (
    <div className="space-y-6">
      <DashboardStats />
      
      {showPropertyChecker ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Check Property Eligibility</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowPropertyChecker(false)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <PropertyChecker />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Check If A Property Is Eligible</h2>
                <p className="text-muted-foreground mb-4 md:mb-0">
                  Find out if a property is in an LMI area and discover available assistance programs
                </p>
              </div>
              <Button onClick={() => setShowPropertyChecker(true)} className="gap-2">
                <Search className="h-4 w-4" />
                Check Property
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivity activities={activities} />
        
        <Card>
          <CardHeader>
            <CardTitle>Program Eligibility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Programs You May Qualify For</h3>
                <ul className="space-y-2">
                  <li className="text-sm flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">First-Time Homebuyer Assistance</p>
                      <p className="text-muted-foreground">Up to $10,000 in down payment assistance</p>
                    </div>
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Low-Interest Rate Mortgage</p>
                      <p className="text-muted-foreground">Below-market interest rates for eligible properties</p>
                    </div>
                  </li>
                </ul>
                <Button variant="outline" size="sm" className="mt-4 w-full">View All Programs</Button>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Complete Eligibility Screener</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Answer a few questions to find more programs you may qualify for
                </p>
                <Button variant="outline" className="w-full gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Start Eligibility Screener
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
