
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserTypeBadgeProps {
  userType?: string;
}

export const UserTypeBadge: React.FC<UserTypeBadgeProps> = ({ userType }) => {
  if (!userType) return <Badge variant="outline">Standard</Badge>;
  
  switch (userType) {
    case 'admin':
      return <Badge className="bg-purple-600">Admin</Badge>;
    case 'mortgage_professional':
      return <Badge className="bg-blue-600">Mortgage Pro</Badge>;
    case 'realtor':
      return <Badge className="bg-green-600">Realtor</Badge>;
    case 'client':
      return <Badge className="bg-orange-600">Client</Badge>;
    default:
      return <Badge variant="outline">{userType}</Badge>;
  }
};
