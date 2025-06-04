
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserSecurityActions } from './UserSecurityActions';
import { UserAuditTrail } from './UserAuditTrail';
import { UserStatusBadge } from './UserStatusBadge';
import { 
  BasicInformation, 
  AccountStatus, 
  ReferralInformation, 
  MetadataSection, 
  RawMetadata 
} from './user-details';
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
    // Check both app_metadata and if the user has a verified email timestamp
    return !!user.app_metadata?.email_verified || !!user.email;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>User Details: {user.email || 'No email'}</span>
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
              <BasicInformation user={user} getUserType={getUserType} />
              <AccountStatus 
                user={user} 
                getUserType={getUserType} 
                isEmailVerified={isEmailVerified} 
              />
            </div>

            <ReferralInformation user={user} />
            <MetadataSection user={user} />
            <RawMetadata user={user} />
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
