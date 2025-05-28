
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { MortgageBroker } from '@/lib/api/types';

interface DeleteBrokerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  broker: MortgageBroker | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteBrokerDialog: React.FC<DeleteBrokerDialogProps> = ({
  isOpen,
  onOpenChange,
  broker,
  onConfirm,
  isDeleting,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the broker 
            {broker && <span className="font-semibold"> {broker.name}</span>} 
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
