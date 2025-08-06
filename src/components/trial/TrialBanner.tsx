import { AlertTriangle, Clock, Zap } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrial } from "@/hooks/useTrial";
import { useNavigate } from "react-router-dom";

export const TrialBanner = () => {
  const { isTrialActive, daysRemaining, trialExpired, isTrialUser } = useTrial();
  const navigate = useNavigate();

  if (!isTrialUser) return null;

  if (trialExpired) {
    return (
      <Alert className="border-destructive bg-destructive/10 mb-4">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-destructive font-medium">
            Your trial has expired. Upgrade now to continue using all features.
          </span>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => navigate('/pricing')}
          >
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isTrialActive) {
    const isUrgent = daysRemaining <= 3;
    
    return (
      <Alert className={`mb-4 ${isUrgent ? 'border-warning bg-warning/10' : 'border-primary bg-primary/10'}`}>
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <AlertTriangle className="h-4 w-4 text-warning" />
          ) : (
            <Clock className="h-4 w-4 text-primary" />
          )}
          <Badge variant={isUrgent ? "destructive" : "secondary"} className="gap-1">
            <Zap className="h-3 w-3" />
            Trial
          </Badge>
        </div>
        <AlertDescription className="flex items-center justify-between mt-2">
          <span className={isUrgent ? 'text-warning font-medium' : 'text-foreground'}>
            {daysRemaining === 1 
              ? "Last day of your trial! Upgrade now to keep all features."
              : `${daysRemaining} days left in your trial. Upgrade to continue after trial ends.`
            }
          </span>
          <Button 
            variant={isUrgent ? "default" : "outline"} 
            size="sm"
            onClick={() => navigate('/pricing')}
          >
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};