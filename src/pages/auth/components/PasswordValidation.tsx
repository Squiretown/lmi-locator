
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PasswordValidationProps {
  passwordError: string | null;
}

const PasswordValidation: React.FC<PasswordValidationProps> = ({ passwordError }) => {
  if (!passwordError) return null;
  
  return (
    <div className="flex items-center text-sm text-red-500 mt-1">
      <AlertCircle className="h-4 w-4 mr-1" />
      {passwordError}
    </div>
  );
};

export default PasswordValidation;
