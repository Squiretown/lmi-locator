
import React from 'react';
import { UserStatistics } from '@/components/users/UserStatistics';

interface UserManagementStatsProps {
  totalUsers: number;
  activeUsers: number;
  newSignups: number;
  pendingVerifications: number;
}

export const UserManagementStats: React.FC<UserManagementStatsProps> = ({
  totalUsers,
  activeUsers,
  newSignups,
  pendingVerifications,
}) => {
  return (
    <UserStatistics
      totalUsers={totalUsers}
      activeUsers={activeUsers}
      newSignups={newSignups}
      pendingVerifications={pendingVerifications}
    />
  );
};
