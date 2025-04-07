
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface FormErrorDisplayProps {
  error: string | null;
  title?: string;
}

const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ 
  error, 
  title = "Error" 
}) => {
  if (!error) return null;
  
  // Format error message for better readability
  const formatErrorMessage = (message: string): string => {
    // Handle common Supabase error messages
    if (message.includes('permission denied for')) {
      if (message.includes('notification_preferences')) {
        return 'There was an issue with account creation. Our team has been notified. Please try again later or contact support.';
      }
      return 'Database permission error. This is likely due to Row-Level Security settings. Please contact support.';
    }
    
    if (message.includes('already registered')) {
      return 'An account with this email already exists. Please log in instead.';
    }
    
    if (message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    
    // For transaction aborted errors
    if (message.includes('current transaction is aborted')) {
      return 'An error occurred during account creation. Please try again later.';
    }
    
    return message;
  };
  
  const formattedError = formatErrorMessage(error);
  
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{formattedError}</AlertDescription>
    </Alert>
  );
};

export default FormErrorDisplay;
