
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
        return 'secondary';
      case 'client':
        return 'outline';
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

  return (
    <Badge variant={getVariant(userType)}>
      {getDisplayName(userType)}
    </Badge>
  );
};
