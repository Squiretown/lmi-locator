import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Home, User, LogIn } from 'lucide-react';

export const RegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showLoginInfo, setShowLoginInfo] = useState(false);

  useEffect(() => {
    setShowLoginInfo(searchParams.get('showLoginInfo') === 'true');
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background py-8 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Registration Complete!
              </h1>
              <p className="text-muted-foreground">
                Thank you for completing your registration. Your account has been created successfully.
              </p>
            </div>

            {showLoginInfo && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground font-medium mb-2">
                  🎉 You can now sign in to your client dashboard!
                </p>
                <p className="text-sm text-muted-foreground">
                  Use the email address you registered with to sign in and access your property search dashboard.
                </p>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>What's next?</strong>
                <br />
                {showLoginInfo 
                  ? "Sign in to your dashboard to start searching for properties and save your favorites." 
                  : "Your professional will review your information and contact you shortly to discuss your needs and next steps."
                }
              </p>
            </div>

            <div className="space-y-3">
              {showLoginInfo && (
                <Link to="/client-login" className="w-full">
                  <Button className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In to Dashboard
                  </Button>
                </Link>
              )}
              
              <Button 
                onClick={() => navigate('/')}
                variant={showLoginInfo ? "outline" : "default"}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If you have any questions, please contact your professional directly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};