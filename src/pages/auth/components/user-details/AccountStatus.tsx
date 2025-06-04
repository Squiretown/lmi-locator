
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserStatusBadge } from '../UserStatusBadge';
import type { AdminUser } from '../../types/admin-user';

interface AccountStatusProps {
  user: AdminUser;
  getUserType: (user: AdminUser) => string;
  isEmailVerified: (user: AdminUser) => boolean;
}

export const AccountStatus: React.FC<AccountStatusProps> = ({ user, getUserType, isEmailVerified }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Account Status</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Email Verified:</span>
          <Badge variant={isEmailVerified(user) ? "default" : "secondary"}>
            {isEmailVerified(user) ? 'Verified' : 'Unverified'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Account Status:</span>
          <UserStatusBadge 
            status={getUserType(user)}
            isEmailVerified={isEmailVerified(user)}
            lastSignIn={user.last_sign_in_at}
          />
        </div>
        {user.user_metadata?.suspended && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Suspension Status:</span>
            <Badge variant="destructive">Suspended</Badge>
          </div>
        )}
        {user.user_metadata?.suspension_end && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Suspension End:</span>
            <span className="text-sm text-red-600">
              {new Date(user.user_metadata.suspension_end).toLocaleString()}
            </span>
          </div>
        )}
        {user.app_metadata?.provider && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Auth Provider:</span>
            <Badge variant="outline">{user.app_metadata.provider}</Badge>
          </div>
        )}
        {user.app_metadata?.providers && user.app_metadata.providers.length > 0 && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">All Providers:</span>
            <div className="flex gap-1">
              {user.app_metadata.providers.map((provider, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {provider}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
