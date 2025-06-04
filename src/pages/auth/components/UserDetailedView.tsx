
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserSecurityActions } from './UserSecurityActions';
import { UserAuditTrail } from './UserAuditTrail';
import { UserStatusBadge } from './UserStatusBadge';
import type { AdminUser } from '../types/admin-user';

interface UserDetailedViewProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

export const UserDetailedView: React.FC<UserDetailedViewProps> = ({
  user,
  open,
  onClose,
}) => {
  if (!user) return null;

  const getUserType = (user: AdminUser) => {
    return user.user_metadata?.user_type || 'client';
  };

  const isEmailVerified = (user: AdminUser) => {
    return !!user.app_metadata?.email_verified;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>User Details: {user.email}</span>
            <UserStatusBadge 
              status={getUserType(user)}
              isEmailVerified={isEmailVerified(user)}
              lastSignIn={user.last_sign_in_at}
            />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">User ID:</span>
                    <span className="font-mono text-sm">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm">{user.email}</span>
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
                </div>
              </div>

              {/* Account Status */}
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
                      <span className="text-sm text-muted-foreground">Suspension End:</span>
                      <span className="text-sm text-red-600">
                        {new Date(user.user_metadata.suspension_end).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            {(user.user_metadata || user.app_metadata) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">User Metadata</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(user.user_metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                  {user.app_metadata && Object.keys(user.app_metadata).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">App Metadata</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                        {JSON.stringify(user.app_metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="security">
            <UserSecurityActions user={user} />
          </TabsContent>

          <TabsContent value="activity">
            <div className="text-center py-8 text-muted-foreground">
              <p>User activity monitoring will be available soon.</p>
              <p className="text-sm">This will show recent user actions, login patterns, and usage statistics.</p>
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <UserAuditTrail user={user} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
