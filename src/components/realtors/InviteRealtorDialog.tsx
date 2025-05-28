
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InviteRealtorForm } from './InviteRealtorForm';

interface InviteRealtorDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const InviteRealtorDialog: React.FC<InviteRealtorDialogProps> = ({
  isOpen,
  setIsOpen,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Realtor</DialogTitle>
        </DialogHeader>
        <InviteRealtorForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
