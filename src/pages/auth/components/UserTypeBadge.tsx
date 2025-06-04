
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserTypeBadgeProps {
  userType?: string;
}

export const UserTypeBadge: React.FC<UserTypeBadgeProps> = ({ userType }) => {
  const getVariant = (type?: string) => {
    switch (type) {
      case 'admin':
        return 'destructive';
      case 'realtor':
        return 'default';
      case 'mortgage_professional':
        return 'secondary'; // We'll override this with custom styling
      case 'client':
        return 'outline'; // We'll override this with custom styling
      default:
        return 'outline';
    }
  };

  const getDisplayName = (type?: string) => {
    switch (type) {
      case 'admin':
        return 'Admin';
      case 'realtor':
        return 'Realtor';
      case 'mortgage_professional':
        return 'Mortgage Professional';
      case 'client':
        return 'Client';
      default:
        return type || 'Unknown';
    }
  };

  const getCustomStyles = (type?: string) => {
    switch (type) {
      case 'mortgage_professional':
        return 'bg-green-800 text-white hover:bg-green-900 border-green-800';
      case 'client':
        return 'bg-black text-white hover:bg-gray-900 border-black';
      default:
        return '';
    }
  };

  const customStyles = getCustomStyles(userType);

  return (
    <Badge 
      variant={getVariant(userType)} 
      className={customStyles}
    >
      {getDisplayName(userType)}
    </Badge>
  );
};
