
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Activity, Settings, BarChart3, Database } from 'lucide-react';
import type { AdminUser } from '../types/admin-user';
import { 
  BasicInformation, 
  AccountStatus, 
  ReferralInformation, 
  MetadataSection, 
  RawMetadata 
} from './user-details';
import { UserSecurityActions } from './UserSecurityActions';
import { UserAuditTrail } from './UserAuditTrail';
import { UserAnalytics } from './UserAnalytics';
import { UserSystemIntegration } from './UserSystemIntegration';

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

  const getUserType = () => {
    return user.user_metadata?.user_type || 'client';
  };

  const getDisplayName = () => {
    const firstName = user.user_metadata?.first_name;
    const lastName = user.user_metadata?.last_name;
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    
    return user.email || 'No name';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3">
            <User className="h-6 w-6" />
            <div>
              <div className="flex items-center gap-2">
                {getDisplayName()}
                <Badge variant="outline">
                  {getUserType()}
                </Badge>
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                {user.email}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Integration
              </TabsTrigger>
              <TabsTrigger value="metadata" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Metadata
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-6">
              <TabsContent value="basic" className="space-y-6">
                <BasicInformation user={user} />
                <AccountStatus user={user} />
                <ReferralInformation user={user} />
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <UserSecurityActions user={user} />
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <UserAuditTrail user={user} />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <UserAnalytics user={user} />
              </TabsContent>

              <TabsContent value="integration" className="space-y-6">
                <UserSystemIntegration user={user} />
              </TabsContent>

              <TabsContent value="metadata" className="space-y-6">
                <MetadataSection user={user} />
                <RawMetadata user={user} />
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
