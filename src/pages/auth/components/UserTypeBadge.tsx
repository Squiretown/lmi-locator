
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getRoleDisplayName, normalizeRole, USER_ROLES } from '@/lib/constants/roles';

interface UserTypeBadgeProps {
  userType?: string;
}

export const UserTypeBadge: React.FC<UserTypeBadgeProps> = ({ userType }) => {
  const getVariant = (type?: string) => {
    const normalizedType = normalizeRole(type);
    switch (normalizedType) {
      case USER_ROLES.ADMIN:
        return 'destructive';
      case USER_ROLES.REALTOR:
        return 'default';
      case USER_ROLES.MORTGAGE_PROFESSIONAL:
        return 'secondary'; // We'll override this with custom styling
      case USER_ROLES.CLIENT:
        return 'outline'; // We'll override this with custom styling
      default:
        return 'outline';
    }
  };

  const getDisplayName = (type?: string) => {
    return getRoleDisplayName(type);
  };

  const getCustomStyles = (type?: string) => {
    const normalizedType = normalizeRole(type);
    switch (normalizedType) {
      case USER_ROLES.MORTGAGE_PROFESSIONAL:
        return 'bg-green-800 text-white hover:bg-green-900 border-green-800';
      case USER_ROLES.CLIENT:
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
