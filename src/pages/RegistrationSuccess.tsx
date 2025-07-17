import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, User } from 'lucide-react';

export const RegistrationSuccess: React.FC = () => {
  const navigate = useNavigate();

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
                Thank you for completing your registration. Your information has been successfully submitted to your professional.
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>What's next?</strong>
                <br />
                Your professional will review your information and contact you shortly to discuss your needs and next steps.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                <User className="mr-2 h-4 w-4" />
                Create Account (Optional)
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