
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { verifyAdminAccess } from '@/lib/auth/operations/session';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: string;
  allowedUserTypes?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType,
  allowedUserTypes 
}) => {
  const { session, userType, isLoading, authInitialized } = useAuth();
  const location = useLocation();
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState<boolean | null>(null);

  console.log("ProtectedRoute:", { 
    isLoading, 
    authInitialized,
    hasSession: !!session, 
    userType, 
    requiredUserType,
    currentPath: location.pathname,
    isVerifyingAdmin,
    hasAdminAccess
  });

  // Special handling for admin routes
  useEffect(() => {
    if (!isLoading && authInitialized && session && requiredUserType === 'admin') {
      const checkAdminAccess = async () => {
        try {
          setIsVerifyingAdmin(true);
          const { isAdmin, error } = await verifyAdminAccess();
          
          if (error) {
            console.error('Admin verification error:', error);
            toast.error('Failed to verify admin access');
            setHasAdminAccess(false);
          } else {
            setHasAdminAccess(isAdmin);
            if (!isAdmin) {
              toast.error('You do not have admin access');
            }
          }
        } catch (err) {
          console.error('Exception during admin verification:', err);
          setHasAdminAccess(false);
        } finally {
          setIsVerifyingAdmin(false);
        }
      };
      
      checkAdminAccess();
    }
  }, [isLoading, authInitialized, session, requiredUserType]);

  useEffect(() => {
    if (!isLoading && authInitialized && !session) {
      console.log('No session detected, user will be redirected to login');
    }
  }, [isLoading, authInitialized, session]);

  // Show loading state during authentication or admin verification
  if (!authInitialized || isLoading || (requiredUserType === 'admin' && isVerifyingAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If no session, redirect to login
  if (!session) {
    console.log('No session, redirecting to login');
    // Save the current location the user was trying to access
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Special case for admin routes
  if (requiredUserType === 'admin') {
    // If admin verification is complete and access is denied
    if (!isVerifyingAdmin && hasAdminAccess === false) {
      console.log('Admin access denied, redirecting');
      return <Navigate to="/" replace />;
    }
    
    // If admin verification is complete and access is granted
    if (!isVerifyingAdmin && hasAdminAccess === true) {
      console.log('Admin access granted');
      return <>{children}</>;
    }
  }
  
  // For non-admin routes, proceed with user type check
  const isUserTypeAllowed = () => {
    if (requiredUserType) {
      return userType === requiredUserType;
    }
    if (allowedUserTypes && allowedUserTypes.length > 0) {
      return allowedUserTypes.includes(userType || '');
    }
    return true; // No specific type requirement
  };
  
  if ((requiredUserType || allowedUserTypes) && !isUserTypeAllowed()) {
    // If user has a session but userType isn't loaded yet, try to get it from session
    if (!userType && session) {
      // Try to extract user_type from session metadata
      const metadataUserType = session.user?.user_metadata?.user_type;
      
      if ((requiredUserType && metadataUserType === requiredUserType) || 
          (allowedUserTypes && allowedUserTypes.includes(metadataUserType))) {
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
    
    const expectedTypes = requiredUserType ? requiredUserType : allowedUserTypes?.join(', ');
    console.log(`User type not allowed: expected ${expectedTypes}, got ${userType}. Redirecting.`);
    
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
