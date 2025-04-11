
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import MagicLinkForm from './components/MagicLinkForm';
import PasswordResetForm from './components/PasswordResetForm';
import { createInitialAdminUser } from '@/lib/auth/auth-operations';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [showInitialAdminCreation, setShowInitialAdminCreation] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{ email: string, password: string } | null>(null);
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

  const handleCreateInitialAdmin = async () => {
    const credentials = await createInitialAdminUser();
    
    if (credentials) {
      setAdminCredentials(credentials);
      setShowInitialAdminCreation(true);
      toast.success('Initial admin user created. Please log in.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {!showInitialAdminCreation ? (
          <div className="bg-white shadow-md rounded-xl px-8 pt-6 pb-8 mb-4">
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
            
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={handleCreateInitialAdmin}
                className="w-full mt-4"
              >
                Create Initial Admin User
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold text-center mb-4">Initial Admin Credentials</h2>
            <p className="text-center mb-4">
              <strong>Email:</strong> {adminCredentials?.email}
            </p>
            <p className="text-center mb-4">
              <strong>Password:</strong> {adminCredentials?.password}
            </p>
            <p className="text-sm text-red-600 text-center mb-4">
              Please change this password after first login!
            </p>
            <Button 
              onClick={() => setShowInitialAdminCreation(false)}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
