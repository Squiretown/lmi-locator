
import { useState } from 'react';
import type { AdminUser } from '../types/admin-user';

export const useUserManagementState = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: string | null;
    user: AdminUser | null;
  }>({
    open: false,
    action: null,
    user: null,
  });
  const [professionalDialog, setProfessionalDialog] = useState<{
    open: boolean;
    action: string | null;
    user: AdminUser | null;
  }>({
    open: false,
    action: null,
    user: null,
  });

  const resetActionDialog = () => {
    setActionDialog({ open: false, action: null, user: null });
  };

  const resetProfessionalDialog = () => {
    setProfessionalDialog({ open: false, action: null, user: null });
  };

  return {
    searchQuery,
    setSearchQuery,
    addUserDialogOpen,
    setAddUserDialogOpen,
    selectedUsers,
    setSelectedUsers,
    currentPage,
    setCurrentPage,
    actionDialog,
    setActionDialog,
    professionalDialog,
    setProfessionalDialog,
    resetActionDialog,
    resetProfessionalDialog,
  };
};
