
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Key, UserX, Shield, Mail, Trash2 } from 'lucide-react';
import type { AdminUser } from '../types/admin-user';

interface UserActionMenuProps {
  user: AdminUser;
  onResetPassword: () => void;
  onDisableUser: () => void;
  onDeleteUser?: () => void;
}

export const UserActionMenu: React.FC<UserActionMenuProps> = ({
  user,
  onResetPassword,
  onDisableUser,
  onDeleteUser,
}) => {
  const isAdmin = user.user_metadata?.user_type === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={onResetPassword}
          disabled
        >
          <Key className="mr-2 h-4 w-4" />
          Reset Password
        </DropdownMenuItem>
        
        <DropdownMenuItem disabled>
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </DropdownMenuItem>
        
        {isAdmin && (
          <DropdownMenuItem disabled>
            <Shield className="mr-2 h-4 w-4" />
            Admin User
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={onDisableUser}
          disabled={isAdmin}
          className="text-orange-600"
        >
          <UserX className="mr-2 h-4 w-4" />
          Remove Profile
        </DropdownMenuItem>

        {onDeleteUser && (
          <DropdownMenuItem 
            onClick={onDeleteUser}
            disabled={isAdmin}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
