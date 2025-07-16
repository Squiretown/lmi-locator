import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
export const ProfileMenu = () => {
  const { signOut, user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  // Handle navigation to different pages
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Handle sign out action
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name || '';
    const lastName = user?.user_metadata?.last_name || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return user?.email || 'User';
  };

  if (!user) return null;
  
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="rounded-full p-1 h-auto">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.profile_image || ''} />
            <AvatarFallback className="text-sm">{getInitials()}</AvatarFallback>
          </Avatar>
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.profile_image || ''} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium text-sm">{getUserDisplayName()}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleNavigate('/settings')}>
          <User className="h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleNavigate('/settings')}>
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleNavigate('/resources')}>
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
};
export default ProfileMenu;