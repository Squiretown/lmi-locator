
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { AdminUser } from '../../types/admin-user';

interface ReferralInformationProps {
  user: AdminUser;
}

export const ReferralInformation: React.FC<ReferralInformationProps> = ({ user }) => {
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

  if (!user.user_metadata?.referred_by_type && !user.user_metadata?.referral_code) {
    return null;
  }

  return (
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
  );
};
