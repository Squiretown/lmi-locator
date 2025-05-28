
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Realtor } from '@/lib/api/realtors';

interface DeleteRealtorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  realtor: Realtor | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteRealtorDialog: React.FC<DeleteRealtorDialogProps> = ({
  isOpen,
  onOpenChange,
  realtor,
  onConfirm,
  isDeleting,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the realtor 
            {realtor && <span className="font-semibold"> {realtor.name}</span>} 
            and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
