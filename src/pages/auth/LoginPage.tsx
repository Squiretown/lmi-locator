
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoginForm from './components/LoginForm';
import { createInitialAdminUser } from '@/lib/auth/auth-operations';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [showInitialAdminCreation, setShowInitialAdminCreation] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{ email: string, password: string } | null>(null);

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
          <>
            <LoginForm />
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={handleCreateInitialAdmin}
                className="w-full"
              >
                Create Initial Admin User
              </Button>
            </div>
          </>
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
