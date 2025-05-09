
import React, { useState, useEffect } from 'react';
import { DashboardStats } from './DashboardStats';
import { RecentActivity } from './RecentActivity';
import { useClientActivity } from '@/hooks/useClientActivity';
import { useSavedAddresses } from '@/hooks/useSavedAddresses';
import PropertyChecker from '@/components/PropertyChecker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, PlusCircle, CheckCircle } from 'lucide-react';
import { TeamContent } from './TeamContent';

export function ClientDashboardContent() {
  const { activities, refreshActivities } = useClientActivity();
  const { savedAddresses, refreshAddresses } = useSavedAddresses();
  const [showPropertyChecker, setShowPropertyChecker] = useState(false);
  
  // Refresh data when the component mounts
  useEffect(() => {
    const refreshData = async () => {
      console.log("ClientDashboardContent: Refreshing data on mount");
      try {
        await Promise.all([
          refreshActivities(),
          refreshAddresses()
        ]);
        console.log("Dashboard content data refreshed. Saved addresses:", savedAddresses.length);
      } catch (error) {
        console.error("Error refreshing dashboard content data:", error);
      }
    };
    
    refreshData();
    
    // Refresh data every 15 seconds
    const intervalId = setInterval(refreshData, 15000);
    
    return () => clearInterval(intervalId);
  }, [refreshActivities, refreshAddresses]);

  return (
    <div className="space-y-6">
      <DashboardStats />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Property Checker */}
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
          
          {/* Recent Activity */}
          <RecentActivity activities={activities} />
        </div>
        
        {/* Right sidebar - Team Content */}
        <div className="md:col-span-1">
          <TeamContent />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Home Buying Journey */}
        <Card>
          <CardHeader>
            <CardTitle>Your Home Buying Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Next Steps</h3>
                <ul className="space-y-2">
                  <li className="text-sm flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Find an eligible property</p>
                      <p className="text-muted-foreground">Use the property checker to find LMI eligible areas</p>
                    </div>
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Check program eligibility</p>
                      <p className="text-muted-foreground">See which assistance programs you qualify for</p>
                    </div>
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Connect with a specialist</p>
                      <p className="text-muted-foreground">Get personalized guidance through the process</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Program Eligibility */}
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
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">First-Time Homebuyer Assistance</p>
                      <p className="text-muted-foreground">Up to $10,000 in down payment assistance</p>
                    </div>
                  </li>
                  <li className="text-sm flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
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
