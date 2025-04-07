
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { getUserTypeName } from '@/lib/supabase/user';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ error: Error | null, data: any }>;
  signOut: () => Promise<void>;
}

interface UserMetadata {
  first_name?: string;
  last_name?: string;
  user_type?: string;
  [key: string]: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          // Defer fetching user type with setTimeout to avoid potential deadlocks
          setTimeout(() => {
            getUserTypeName().then(type => {
              console.log('User type:', type);
              setUserType(type);
            });
          }, 0);
        } else {
          setUserType(null);
        }
      }
    );
    
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        getUserTypeName().then(type => {
          console.log('Initial user type:', type);
          setUserType(type);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting to sign in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log('Sign in result:', error ? 'Error' : 'Success', data?.user?.email);
      
      if (error) {
        console.error('Sign in error:', error.message);
        
        // Provide more helpful error messages for common issues
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email address before signing in.');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
      } else if (data?.user) {
        const userType = await getUserTypeName();
        setUserType(userType);
        toast.success('Signed in successfully');
      }
      
      setIsLoading(false);
      return { error };
    } catch (err) {
      console.error('Exception during sign in:', err);
      setIsLoading(false);
      toast.error('An unexpected error occurred during login');
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, metadata: UserMetadata = {}) => {
    setIsLoading(true);
    try {
      console.log('Attempting to sign up:', email, metadata);
      
      const formattedMetadata = {
        ...metadata,
        user_type: metadata.user_type || 'client'
      };
      
      // Updated to match Supabase API requirements
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
          data: formattedMetadata,
          emailRedirectTo: window.location.origin
        }
      });
      
      console.log('Sign up result:', error ? 'Error' : 'Success', data?.user?.email);
      
      if (error) {
        console.error('Sign up error:', error.message);
        
        // Enhanced error handling with more specific messages
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else if (error.message.includes('permission denied')) {
          console.error('Permission denied error details:', error);
          toast.error('Account creation failed due to permission issues. Please contact support.');
        } else if (error.message.includes('weak password')) {
          toast.error('Please use a stronger password that meets all requirements.');
        } else {
          toast.error(`Sign up failed: ${error.message}`);
        }
      } else if (data?.user) {
        toast.success('Account created successfully! Please check your email to confirm your account.');
        
        // Check if email confirmation is required
        const requiresEmailConfirmation = !data.session;
        
        if (requiresEmailConfirmation) {
          toast.info('Please check your email to confirm your account before logging in.');
        }
      }
      
      setIsLoading(false);
      return { error, data };
    } catch (err) {
      console.error('Exception during sign up:', err);
      setIsLoading(false);
      toast.error('An unexpected error occurred during sign up');
      return { error: err as Error, data: null };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUserType(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
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
      signIn, 
      signUp, 
      signOut 
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
