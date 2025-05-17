
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOutAllUsers } from "@/lib/auth/operations/session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SignOutAllUsersButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSignOutAll = async () => {
    setIsLoading(true);
    
    try {
      const result = await signOutAllUsers();
      
      if (result.success) {
        toast.success("All users have been signed out successfully", {
          description: "Users will need to sign in again at their next session"
        });
      } else {
        toast.error(`Operation failed: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error in sign out all:", error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out All Users
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
            Sign Out All Users
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will immediately terminate all user sessions across the entire platform.
            All users will need to sign in again. Your own session will remain active.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleSignOutAll();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Sign Out All Users"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SignOutAllUsersButton;
