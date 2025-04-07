
import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  text: string;
  satisfied: boolean;
}

interface PasswordRequirementsProps {
  password: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password }) => {
  const requirements: PasswordRequirement[] = [
    { 
      text: 'At least 8 characters long', 
      satisfied: password.length >= 8 
    },
    { 
      text: 'At least one uppercase letter', 
      satisfied: /[A-Z]/.test(password) 
    },
    { 
      text: 'At least one lowercase letter', 
      satisfied: /[a-z]/.test(password) 
    },
    { 
      text: 'At least one number', 
      satisfied: /[0-9]/.test(password) 
    },
    { 
      text: 'At least one special character', 
      satisfied: /[^A-Za-z0-9]/.test(password) 
    }
  ];

  if (password.length === 0) return null;
  
  return (
    <div className="text-xs mt-2 space-y-1">
      <p className="font-medium text-gray-700">Password requirements:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            {req.satisfied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <X className="h-3 w-3 text-red-500" />
            )}
            <span className={req.satisfied ? "text-green-600" : "text-gray-500"}>
              {req.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
