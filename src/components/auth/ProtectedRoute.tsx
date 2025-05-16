
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
  const { session, userType, isLoading, authInitialized } = useAuth();

  console.log("ProtectedRoute:", { 
    isLoading, 
    authInitialized,
    hasSession: !!session, 
    userType, 
    requiredUserType 
  });

  if (!authInitialized || isLoading) {
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
    
    // If user has a session but userType isn't loaded yet, try to get it from session
    if (!userType && session) {
      // Try to extract user_type from session metadata
      const metadataUserType = session.user?.user_metadata?.user_type;
      
      if (metadataUserType === requiredUserType) {
        console.log('Using user type from session metadata:', metadataUserType);
        return <>{children}</>;
      }
      
      if (!metadataUserType) {
        console.log('Has session but user type not loaded yet. Showing loading spinner');
        return (
          <div className="flex h-screen items-center justify-center">
            <LoadingSpinner />
          </div>
        );
      }
    }
    
    console.log(`User type mismatch: expected ${requiredUserType}, got ${userType}. Redirecting.`);
    
    // Otherwise, redirect to appropriate dashboard
    switch (userType) {
      case 'mortgage_professional':
        return <Navigate to="/dashboard/mortgage" replace />;
      case 'realtor':
        return <Navigate to="/dashboard/realtor" replace />;
      case 'client':
        return <Navigate to="/dashboard/client" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
