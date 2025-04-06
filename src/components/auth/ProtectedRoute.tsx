import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType 
}) => {
  const { session, userType, isLoading } = useAuth();

  console.log("ProtectedRoute:", { 
    isLoading, 
    hasSession: !!session, 
    userType, 
    requiredUserType 
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    console.log('No session, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If a specific user type is required
  if (requiredUserType && userType !== requiredUserType) {
    // Admin can access all areas
    if (userType === 'admin') {
      console.log('Admin access granted');
      return <>{children}</>;
    }
    
    console.log(`User type mismatch: expected ${requiredUserType}, got ${userType}. Redirecting.`);
    
    // Otherwise, redirect to appropriate dashboard
    switch (userType) {
      case 'mortgage_professional':
        return <Navigate to="/mortgage" replace />;
      case 'realtor':
        return <Navigate to="/realtor" replace />;
      case 'client':
        return <Navigate to="/client" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
