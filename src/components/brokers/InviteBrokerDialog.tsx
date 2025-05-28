
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InviteBrokerForm } from './InviteBrokerForm';

interface InviteBrokerDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const InviteBrokerDialog: React.FC<InviteBrokerDialogProps> = ({
  isOpen,
  setIsOpen,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Broker</DialogTitle>
        </DialogHeader>
        <InviteBrokerForm onSuccess={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
