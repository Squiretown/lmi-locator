
import { useContext } from 'react';
import AuthContext from '@/contexts/AuthContext';

/**
 * Hook for accessing the authentication context
 * @returns The authentication context
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
