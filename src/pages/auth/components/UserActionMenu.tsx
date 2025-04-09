
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, Ban, UserCheck, Lock } from 'lucide-react';

interface UserActionMenuProps {
  userId: string;
  userType?: string;
  onResetPassword: (userId: string) => void;
  onDisableUser: (userId: string) => void;
}

export const UserActionMenu: React.FC<UserActionMenuProps> = ({ 
  userId, 
  userType, 
  onResetPassword, 
  onDisableUser 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onResetPassword(userId)}
          className="flex items-center"
        >
          <Lock className="mr-2 h-4 w-4" />
          <span>Reset Password</span>
        </DropdownMenuItem>
        {userType !== 'admin' && (
          <DropdownMenuItem 
            onClick={() => onDisableUser(userId)}
            className="flex items-center text-red-600"
          >
            <Ban className="mr-2 h-4 w-4" />
            <span>Disable User</span>
          </DropdownMenuItem>
        )}
        {userType !== 'admin' && (
          <DropdownMenuItem className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>Change Role</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="flex items-center">
          <UserCheck className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
