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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.email);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
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
      
      if (!error && data?.user) {
        const userType = await getUserTypeName();
        setUserType(userType);
      }
      
      setIsLoading(false);
      return { error };
    } catch (err) {
      console.error('Exception during sign in:', err);
      setIsLoading(false);
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
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
          data: formattedMetadata,
          emailRedirectTo: window.location.origin
        }
      });
      
      console.log('Sign up result:', error ? 'Error' : 'Success', data?.user?.email);
      
      if (!error && data?.user) {
        toast.success("Account created successfully! Please check your email to confirm your account.");
      }
      
      setIsLoading(false);
      return { error, data };
    } catch (err) {
      console.error('Exception during sign up:', err);
      setIsLoading(false);
      return { error: err as Error, data: null };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUserType(null);
    } catch (error) {
      console.error('Error signing out:', error);
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
