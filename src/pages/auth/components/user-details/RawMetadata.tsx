
import React from 'react';
import type { AdminUser } from '../../types/admin-user';

interface RawMetadataProps {
  user: AdminUser;
}

export const RawMetadata: React.FC<RawMetadataProps> = ({ user }) => {
  const hasUserMetadata = user.user_metadata && Object.keys(user.user_metadata).length > 0;
  const hasAppMetadata = user.app_metadata && Object.keys(user.app_metadata).length > 0;

  if (!hasUserMetadata && !hasAppMetadata) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Raw Metadata (Technical Reference)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasUserMetadata && (
          <div>
            <h4 className="font-medium mb-2">User Metadata JSON</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(user.user_metadata, null, 2)}
            </pre>
          </div>
        )}
        {hasAppMetadata && (
          <div>
            <h4 className="font-medium mb-2">App Metadata JSON</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(user.app_metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
