
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserManagementDialogsProps {
  addUserDialogOpen: boolean;
  setAddUserDialogOpen: (open: boolean) => void;
}

export const UserManagementDialogs: React.FC<UserManagementDialogsProps> = ({
  addUserDialogOpen,
  setAddUserDialogOpen,
}) => {
  return (
    <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            User creation functionality is not yet implemented. Users can currently only be created through the sign-up process.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To add users, they need to sign up through the registration form or you can implement invitation functionality.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
