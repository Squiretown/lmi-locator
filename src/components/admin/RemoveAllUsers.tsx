
import React, { useState } from 'react';
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RemoveAllUsers: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const handleRemoveAllUsers = async () => {
    if (confirmation !== 'CONFIRM_DELETE_ALL_USERS') {
      toast.error('Invalid confirmation code');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Function 'remove-all-users' does not exist
      const error = new Error('Function not implemented');
      const response = null;
      
      if (error) {
        console.error('Error removing users:', error);
        toast.error(`Operation failed: ${error.message || 'Unknown error'}`);
        return;
      }
      
      if (response.success) {
        toast.success(`Successfully removed ${response.deletedCount} users`, {
          description: 'All users except your account have been removed'
        });
        setIsOpen(false);
      } else {
        toast.error(`Operation failed: ${response.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Exception during user removal:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setConfirmation('');
    }
  };
  
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center text-red-700">
          <Trash2 className="h-5 w-5 mr-2" />
          Remove All Users
        </CardTitle>
        <CardDescription className="text-red-600">
          This is a destructive operation that cannot be undone!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-red-700">
          This will permanently delete all users from your Supabase project except your admin account.
          Any data associated with deleted users may become inaccessible.
        </p>
        
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Remove All Users
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-red-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-700 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                This action cannot be reversed
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p className="font-medium">
                  You are about to delete ALL USERS from your Supabase project except your admin account.
                </p>
                <p>
                  This is extremely destructive and cannot be undone. All user data may be lost.
                </p>
                <div className="mt-4">
                  <label className="text-sm font-medium text-red-700">
                    Type CONFIRM_DELETE_ALL_USERS to proceed:
                  </label>
                  <Input 
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="CONFIRM_DELETE_ALL_USERS"
                    className="mt-1 border-red-300"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveAllUsers();
                }}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={isLoading || confirmation !== 'CONFIRM_DELETE_ALL_USERS'}
              >
                {isLoading ? "Processing..." : "Remove All Users"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
      <CardFooter className="bg-red-100 text-xs text-red-700 rounded-b-lg">
        This operation requires admin privileges and should only be used in extreme cases.
      </CardFooter>
    </Card>
  );
};

export default RemoveAllUsers;
