import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { FeatureGate } from "@/components/subscription/FeatureGate";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";
import { TrialBanner } from "@/components/trial/TrialBanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, FileText, Users, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Welcome to LMI Hunter Pro</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Please sign in to access your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TrialBanner />
      <h1 className="text-3xl font-bold mb-8">Welcome to LMI Hunter Pro</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <SubscriptionStatus />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Census Tract Search
            </CardTitle>
            <CardDescription>
              Search for LMI eligible census tracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/search')} className="w-full">
              Start Search
            </Button>
          </CardContent>
        </Card>

        <FeatureGate feature="batch_processing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Batch Processing
              </CardTitle>
              <CardDescription>
                Process multiple addresses at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/batch')} className="w-full">
                Upload File
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        <FeatureGate feature="client_management">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Management
              </CardTitle>
              <CardDescription>
                Manage your client relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/clients')} className="w-full">
                View Clients
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        <FeatureGate feature="advanced_analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>
                Advanced search analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/analytics')} className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>
      </div>
    </div>
  );
};

export default HomePage;