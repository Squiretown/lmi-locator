
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { AdminUser } from '../../types/admin-user';

interface BasicInformationProps {
  user: AdminUser;
  getUserType: (user: AdminUser) => string;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({ user, getUserType }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Basic Information</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">User ID:</span>
          <span className="font-mono text-sm">{user.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Email:</span>
          <span className="text-sm">{user.email || 'Not provided'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">User Type:</span>
          <Badge variant="outline">{getUserType(user)}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Created:</span>
          <span className="text-sm">{new Date(user.created_at).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Last Sign In:</span>
          <span className="text-sm">
            {user.last_sign_in_at 
              ? new Date(user.last_sign_in_at).toLocaleString()
              : 'Never'
            }
          </span>
        </div>
        {user.user_metadata?.first_name && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">First Name:</span>
            <span className="text-sm">{user.user_metadata.first_name}</span>
          </div>
        )}
        {user.user_metadata?.last_name && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Name:</span>
            <span className="text-sm">{user.user_metadata.last_name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
