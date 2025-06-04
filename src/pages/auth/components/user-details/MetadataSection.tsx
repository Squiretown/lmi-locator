
import React from 'react';
import type { AdminUser } from '../../types/admin-user';

interface MetadataSectionProps {
  user: AdminUser;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({ user }) => {
  const excludedUserMetadataKeys = [
    'first_name', 'last_name', 'user_type', 'suspended', 'suspension_end',
    'referred_by_type', 'referred_by_id', 'referred_by_name', 'referral_code'
  ];

  const excludedAppMetadataKeys = ['provider', 'providers', 'email_verified'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* User Metadata Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">User Metadata</h3>
        <div className="space-y-2">
          {Object.entries(user.user_metadata || {}).map(([key, value]) => {
            if (excludedUserMetadataKeys.includes(key)) {
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
            if (excludedAppMetadataKeys.includes(key)) {
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
  );
};
