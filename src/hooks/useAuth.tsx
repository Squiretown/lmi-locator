
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { getUserTypeName } from '@/lib/supabase/user';
import { AuthContextType, UserMetadata } from '@/types/auth';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser,
  deleteUserWithPassword
} from '@/lib/auth/auth-operations';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
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
          await fetchUserType();
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
      const result = await signUpWithEmail(email, password, metadata);
      console.log('AuthProvider signUp result:', result);
      
      // If signup was successful and we got back a session (no email confirmation required)
      if (result.data?.session) {
        setSession(result.data.session);
        setUser(result.data.user || null);
        
        // Set user type from metadata
        if (metadata.user_type) {
          console.log('Setting user type from metadata:', metadata.user_type);
          setUserType(metadata.user_type);
        }
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userType,
      isLoading,
      authInitialized,
      signIn, 
      signUp, 
      signOut,
      deleteAccount 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
