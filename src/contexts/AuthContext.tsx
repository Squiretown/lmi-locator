
import { createContext } from 'react';
import { AuthContextType } from '@/types/auth';

// Create the authentication context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
