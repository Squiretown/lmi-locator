
import React from 'react';
import { UserAdvancedFilters } from '@/components/users/UserAdvancedFilters';
import { toast } from 'sonner';

interface UserManagementFiltersProps {
  onFiltersChange: (filters: any) => void;
  onBulkAction: (action: string, userIds: string[]) => void;
  selectedUsers: string[];
  totalUsers: number;
}

export const UserManagementFilters: React.FC<UserManagementFiltersProps> = ({
  onFiltersChange,
  onBulkAction,
  selectedUsers,
  totalUsers,
}) => {
  const handleBulkAction = (action: string, userIds: string[]) => {
    console.log('Bulk action:', action, 'for users:', userIds);
    toast.info(`Bulk action "${action}" will be implemented for ${userIds.length} users`);
    onBulkAction(action, userIds);
  };

  return (
    <UserAdvancedFilters
      onFiltersChange={onFiltersChange}
      onBulkAction={handleBulkAction}
      selectedUsers={selectedUsers}
      totalUsers={totalUsers}
    />
  );
};
