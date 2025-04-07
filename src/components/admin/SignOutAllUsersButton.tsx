
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import { signOutAllUsers } from "@/lib/auth/auth-operations";

interface SignOutAllUsersButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const SignOutAllUsersButton: React.FC<SignOutAllUsersButtonProps> = ({
  variant = "destructive",
  size = "default",
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOutAllUsers = async () => {
    setIsLoading(true);
    try {
      await signOutAllUsers();
      // Don't close the dialog immediately to give time for the toast to be seen
      setTimeout(() => {
        setIsOpen(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out All Users
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out all users?</AlertDialogTitle>
          <AlertDialogDescription>
            This will sign out all currently authenticated users across all devices.
            Users will need to sign in again to access their accounts.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleSignOutAllUsers();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Sign Out All Users"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SignOutAllUsersButton;
