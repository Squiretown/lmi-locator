
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface UserStatusBadgeProps {
  status: string;
  isEmailVerified?: boolean;
  lastSignIn?: string | null;
  user?: any; // Add user prop to access metadata
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({
  status,
  isEmailVerified = false,
  lastSignIn,
  user,
}) => {
  const getStatusInfo = () => {
    // Check if user is suspended via metadata
    if (user?.user_metadata?.suspended === true) {
      const suspensionEnd = user.user_metadata?.suspension_end;
      const endDate = suspensionEnd ? new Date(suspensionEnd).toLocaleDateString() : '';
      return {
        variant: 'destructive' as const,
        icon: <XCircle className="h-3 w-3" />,
        label: endDate ? `Suspended until ${endDate}` : 'Suspended',
      };
    }

    // Determine status based on available data
    if (status === 'suspended' || status === 'banned') {
      return {
        variant: 'destructive' as const,
        icon: <XCircle className="h-3 w-3" />,
        label: 'Suspended',
      };
    }

    if (!isEmailVerified) {
      return {
        variant: 'secondary' as const,
        icon: <Clock className="h-3 w-3" />,
        label: 'Pending Verification',
      };
    }

    if (!lastSignIn) {
      return {
        variant: 'outline' as const,
        icon: <AlertTriangle className="h-3 w-3" />,
        label: 'Never Logged In',
      };
    }

    return {
      variant: 'default' as const,
      icon: <CheckCircle className="h-3 w-3" />,
      label: 'Active',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Badge variant={statusInfo.variant} className="flex items-center gap-1">
      {statusInfo.icon}
      {statusInfo.label}
    </Badge>
  );
};
