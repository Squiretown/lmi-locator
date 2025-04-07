
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
    const result = await signInWithEmail(email, password);
    
    if (result.userType) {
      setUserType(result.userType);
    }
    
    setIsLoading(false);
    return { error: result.error };
  };

  const signUp = async (email: string, password: string, metadata: UserMetadata = {}) => {
    setIsLoading(true);
    const result = await signUpWithEmail(email, password, metadata);
    setIsLoading(false);
    return result;
  };

  const signOut = async () => {
    setIsLoading(true);
    await signOutUser();
    setUserType(null);
    setIsLoading(false);
  };

  const deleteAccount = async (currentPassword: string) => {
    setIsLoading(true);
    const result = await deleteUserWithPassword(currentPassword);
    setIsLoading(false);
    return result;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userType,
      isLoading, 
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
