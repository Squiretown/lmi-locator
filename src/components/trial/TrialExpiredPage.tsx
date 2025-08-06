import { AlertTriangle, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export const TrialExpiredPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-warning/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl">Your Trial Has Ended</CardTitle>
          <p className="text-muted-foreground">
            Your 14-day trial has expired. Upgrade to a paid plan to continue accessing all features.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Star className="h-5 w-5 text-primary" />
              <span>Access to all premium features</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Crown className="h-5 w-5 text-primary" />
              <span>Priority customer support</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Star className="h-5 w-5 text-primary" />
              <span>No usage limits</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/pricing')}
              className="w-full"
              size="lg"
            >
              View Pricing Plans
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Continue with Limited Features
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Need help choosing a plan? <a href="/support" className="text-primary hover:underline">Contact our team</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};