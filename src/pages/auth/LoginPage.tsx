
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import MagicLinkForm from './components/MagicLinkForm';
import PasswordResetForm from './components/PasswordResetForm';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Users, UserCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const location = useLocation();
  const navigate = useNavigate();

  // Set the active tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['login', 'signup', 'magic', 'reset'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/login?tab=${value}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Professional Portal</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Login for Realtors and Mortgage Professionals
          </p>
          
          {/* Client Login Link */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Are you a client?</span>
            <Link 
              to="/client-login" 
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Client Login
            </Link>
          </div>
        </div>
        
        <div className="bg-card shadow-lg rounded-xl px-8 pt-6 pb-8 mb-4 border">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
            
            <TabsContent value="magic">
              <MagicLinkForm />
            </TabsContent>
            
            <TabsContent value="reset">
              <PasswordResetForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
