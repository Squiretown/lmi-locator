
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
    // Check both app_metadata and if the user has a verified email timestamp
    return !!user.app_metadata?.email_verified || !!user.email;
  };

  const getReferralTypeLabel = (type?: string) => {
    switch (type) {
      case 'mortgage_broker':
        return 'Mortgage Broker';
      case 'realtor':
        return 'Realtor';
      case 'professional':
        return 'Professional';
      default:
        return 'Not specified';
    }
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
            </div>

            {/* Referral Information */}
            {(user.user_metadata?.referred_by_type || user.user_metadata?.referral_code) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Referral Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    {user.user_metadata?.referral_code && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Referral Code:</span>
                        <span className="text-sm font-mono">{user.user_metadata.referral_code}</span>
                      </div>
                    )}
                    {user.user_metadata?.referred_by_type && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Referred By Type:</span>
                        <Badge variant="secondary">
                          {getReferralTypeLabel(user.user_metadata.referred_by_type)}
                        </Badge>
                      </div>
                    )}
                    {user.user_metadata?.referred_by_name && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Professional Name:</span>
                        <span className="text-sm">{user.user_metadata.referred_by_name}</span>
                      </div>
                    )}
                    {user.user_metadata?.referred_by_id && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Professional ID:</span>
                        <span className="text-sm font-mono">{user.user_metadata.referred_by_id}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Metadata Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">User Metadata</h3>
                <div className="space-y-2">
                  {Object.entries(user.user_metadata || {}).map(([key, value]) => {
                    if (key === 'first_name' || key === 'last_name' || key === 'user_type' || 
                        key === 'suspended' || key === 'suspension_end' || 
                        key === 'referred_by_type' || key === 'referred_by_id' || 
                        key === 'referred_by_name' || key === 'referral_code') {
                      return null; // Already displayed above
                    }
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    );
                  })}
                  {(!user.user_metadata || Object.keys(user.user_metadata).length === 0) && (
                    <p className="text-sm text-muted-foreground">No additional user metadata</p>
                  )}
                </div>
              </div>

              {/* App Metadata Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">App Metadata</h3>
                <div className="space-y-2">
                  {Object.entries(user.app_metadata || {}).map(([key, value]) => {
                    if (key === 'provider' || key === 'providers' || key === 'email_verified') {
                      return null; // Already displayed above
                    }
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span className="text-sm">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                           Array.isArray(value) ? value.join(', ') : 
                           String(value)}
                        </span>
                      </div>
                    );
                  })}
                  {(!user.app_metadata || Object.keys(user.app_metadata).length === 0) && (
                    <p className="text-sm text-muted-foreground">No additional app metadata</p>
                  )}
                </div>
              </div>
            </div>

            {/* Raw Metadata for Technical Reference */}
            {(user.user_metadata && Object.keys(user.user_metadata).length > 0) || 
             (user.app_metadata && Object.keys(user.app_metadata).length > 0) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Raw Metadata (Technical Reference)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">User Metadata JSON</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                        {JSON.stringify(user.user_metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                  {user.app_metadata && Object.keys(user.app_metadata).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">App Metadata JSON</h4>
                      <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
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
