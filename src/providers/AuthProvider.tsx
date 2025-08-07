
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { getUserTypeName } from '@/lib/supabase/user';
import { AuthContextType, UserMetadata } from '@/types/auth';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser,
  deleteUserWithPassword,
  signInWithGoogle,
  signInWithGitHub,
  signInWithMicrosoft,
  signInWithDiscord
} from '@/lib/auth/operations';
import AuthContext from '@/contexts/AuthContext';
import { USER_ROLES, PROFESSIONAL_ROLES, normalizeRole } from '@/lib/constants/roles';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Track if component is mounted to avoid state updates after unmount
    let isMounted = true;
    
    // Function to safely update state only if component is still mounted
    const safeSetState = {
      setUser: (u: User | null) => isMounted && setUser(u),
      setSession: (s: Session | null) => isMounted && setSession(s),
      setUserType: (t: string | null) => isMounted && setUserType(t),
      setIsLoading: (l: boolean) => isMounted && setIsLoading(l),
      setAuthInitialized: (i: boolean) => isMounted && setAuthInitialized(i)
    };

    // Function to fetch user type safely
    const fetchUserType = async () => {
      try {
        const type = await getUserTypeName();
        console.log('Fetched user type:', type);
        safeSetState.setUserType(type);
      } catch (error) {
        console.error('Error getting user type:', error);
        safeSetState.setUserType('client'); // Default fallback
      }
    };

    // Setup auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        
        if (!isMounted) return;
        
        safeSetState.setSession(newSession);
        safeSetState.setUser(newSession?.user || null);
        
        if (newSession?.user) {
          // Use setTimeout(0) to avoid recursive calls with Supabase client
          setTimeout(() => {
            if (isMounted) fetchUserType();
          }, 0);
        } else {
          safeSetState.setUserType(null);
        }
      }
    );
    
    // Then check for existing session
    const initializeAuth = async () => {
      try {
        // Wrap in a timeout to ensure that if the supabase client is slow or throws,
        // we still set authInitialized to true eventually
        const timeoutId = setTimeout(() => {
          if (isMounted && !authInitialized) {
            console.warn('Auth initialization timed out, setting initialized state anyway');
            safeSetState.setIsLoading(false);
            safeSetState.setAuthInitialized(true);
          }
        }, 3000);
        
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          // Clear the timeout as we got a response
          clearTimeout(timeoutId);
          
          if (error) {
            console.error('Error getting session:', error);
            safeSetState.setIsLoading(false);
            safeSetState.setAuthInitialized(true);
            return;
          }
          
          console.log('Initial session check:', currentSession?.user?.email);
          safeSetState.setSession(currentSession);
          safeSetState.setUser(currentSession?.user || null);
          
          if (currentSession?.user) {
            try {
              await fetchUserType();
            } catch (typeError) {
              console.error('Error fetching user type during initialization:', typeError);
              // Don't fail initialization if user type fetch fails
            }
          }
        } catch (innerErr) {
          console.error('Inner exception during auth initialization:', innerErr);
          clearTimeout(timeoutId);
          throw innerErr; // Re-throw to be caught by outer catch
        }
      } catch (err) {
        console.error('Exception during auth initialization:', err);
      } finally {
        safeSetState.setIsLoading(false);
        safeSetState.setAuthInitialized(true);
      }
    };
    
    initializeAuth();

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      
      if (result.userType) {
        setUserType(result.userType);
      }
      
      return { error: result.error };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: UserMetadata = {}) => {
    setIsLoading(true);
    console.log('AuthProvider signUp called with metadata:', metadata);
    
    try {
      // Validate and sanitize user type to prevent role escalation
      // Only allow professional roles for direct signup
      const userType = metadata.user_type || USER_ROLES.REALTOR;
      const sanitizedUserType = PROFESSIONAL_ROLES.includes(userType as any) ? userType : USER_ROLES.REALTOR;
      
      // Block client direct signup - clients must be invited
      if (userType === USER_ROLES.CLIENT) {
        throw new Error('Clients cannot sign up directly. Please contact a real estate professional to receive an invitation.');
      }
      
      console.log('User type validation (professional only):', { userType, sanitizedUserType });
      
      // Prevent admin role assignment during signup
      if (userType === USER_ROLES.ADMIN) {
        console.warn('Attempted admin role assignment during signup blocked');
      }
      
      const sanitizedMetadata = {
        ...metadata,
        user_type: sanitizedUserType
      };
      
      const result = await signUpWithEmail(email, password, sanitizedMetadata);
      console.log('AuthProvider signUp result:', result);
      
      // If signup was successful and we got back a session (no email confirmation required)
      if (result.data?.session) {
        setSession(result.data.session);
        setUser(result.data.user || null);
        
        // Set user type from sanitized metadata
        console.log('Setting user type from sanitized metadata:', sanitizedUserType);
        setUserType(sanitizedUserType);
      }
      
      return result;
    } catch (error) {
      console.error('Error in AuthProvider signUp:', error);
      return { error: error as Error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      setUserType(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (currentPassword: string) => {
    setIsLoading(true);
    try {
      const result = await deleteUserWithPassword(currentPassword);
      return result;
    } catch (error) {
      console.error('Error during account deletion:', error);
      return { success: false, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'azure' | 'discord', options: { userType?: string } = {}) => {
    setIsLoading(true);
    try {
      let result;
      
      switch (provider) {
        case 'google':
          result = await signInWithGoogle({ userType: options.userType || USER_ROLES.REALTOR });
          break;
        case 'github':
          result = await signInWithGitHub({ userType: options.userType || USER_ROLES.REALTOR });
          break;
        case 'azure':
          result = await signInWithMicrosoft({ userType: options.userType || USER_ROLES.REALTOR });
          break;
        case 'discord':
          result = await signInWithDiscord({ userType: options.userType || USER_ROLES.REALTOR });
          break;
        default:
          throw new Error(`Unsupported OAuth provider: ${provider}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error during ${provider} OAuth sign in:`, error);
      return { success: false, error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const authContextValue: AuthContextType = {
    user, 
    session, 
    userType,
    isLoading,
    authInitialized,
    signIn, 
    signUp, 
    signOut,
    deleteAccount,
    signInWithOAuth
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
