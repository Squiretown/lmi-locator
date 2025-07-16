import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
export const ProfileMenu = () => {
  const {
    signOut,
    user
  } = useAuth();
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
  if (!user) return null;
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
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