
import { useAuthContext } from './useAuthContext';

/**
 * Hook for accessing and managing authentication state
 * @returns Auth context object with user info and auth methods
 */
export function useAuth() {
  return useAuthContext();
}

// Re-export the AuthProvider for convenience
export { AuthProvider } from '@/providers/AuthProvider';
