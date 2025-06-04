
import React from 'react';
import { UsersSearch } from '@/components/users/UsersSearch';

interface UserManagementSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const UserManagementSearch: React.FC<UserManagementSearchProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  return (
    <UsersSearch
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
    />
  );
};
