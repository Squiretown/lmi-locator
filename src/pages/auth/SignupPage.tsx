
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SignupForm from './components/SignupForm';
import { Link } from 'react-router-dom';

const SignupPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="max-w-md w-full mx-4">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <SignupForm />
            
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
