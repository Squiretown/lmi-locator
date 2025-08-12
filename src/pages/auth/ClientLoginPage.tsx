import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, UserCheck, Mail, KeyRound } from 'lucide-react';
import LoginForm from './components/LoginForm';
import MagicLinkForm from './components/MagicLinkForm';
import PasswordResetForm from './components/PasswordResetForm';

const ClientLoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const location = useLocation();
  const navigate = useNavigate();

  // Set the active tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['login', 'magic', 'reset'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/client-login?tab=${value}`, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Client Login - LMI Locator</title>
        <meta name="description" content="Client portal login for LMI Locator. Access your property search dashboard and saved information." />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Access your client dashboard to search properties and view saved listings
            </p>
            
            {/* Professional Login Link */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Are you a real estate professional?</span>
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Professional Login
              </Link>
            </div>
          </div>
          
          <div className="bg-card shadow-lg rounded-xl px-8 pt-6 pb-8 border">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </TabsTrigger>
                <TabsTrigger value="magic" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Magic Link</span>
                </TabsTrigger>
                <TabsTrigger value="reset" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Reset</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="magic">
                <MagicLinkForm />
              </TabsContent>
              
              <TabsContent value="reset">
                <PasswordResetForm />
              </TabsContent>
            </Tabs>
            
            {/* Help Text */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account? Contact your real estate professional for an invitation.
              </p>
            </div>
          </div>
          
          {/* Back to Home */}
          <div className="text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientLoginPage;