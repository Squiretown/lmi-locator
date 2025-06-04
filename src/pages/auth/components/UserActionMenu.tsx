
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Key, 
  UserX, 
  Shield, 
  Mail, 
  Trash2, 
  Edit, 
  UserCheck,
  Ban,
  Clock,
  Eye,
  Settings
} from 'lucide-react';
import type { AdminUser } from '../types/admin-user';

interface UserActionMenuProps {
  user: AdminUser;
  onAction: (action: string, user: AdminUser) => void;
}

export const UserActionMenu: React.FC<UserActionMenuProps> = ({
  user,
  onAction,
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onAction('viewDetails', user)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction('editProfile', user)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Settings className="mr-2 h-4 w-4" />
            Account Actions
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => onAction('resetPassword', user)}>
              <Key className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('changeEmail', user)}>
              <Mail className="mr-2 h-4 w-4" />
              Change Email
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => onAction('sendEmail', user)}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Shield className="mr-2 h-4 w-4" />
            Permissions
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem 
              onClick={() => onAction('changeRole', user)}
              disabled={isAdmin}
            >
              <Shield className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onAction('activate', user)}
              disabled={isAdmin}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Activate User
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onAction('suspend', user)}
              disabled={isAdmin}
              className="text-orange-600"
            >
              <Clock className="mr-2 h-4 w-4" />
              Suspend User
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => onAction('disableUser', user)}
          disabled={isAdmin}
          className="text-orange-600"
        >
          <UserX className="mr-2 h-4 w-4" />
          Remove Profile
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => onAction('delete', user)}
          disabled={isAdmin}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
